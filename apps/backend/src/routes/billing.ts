import { Router, Request, Response } from 'express';
import { requireAuth, AuthRequest } from '../middleware/authUnified';
import prisma from '../lib/prisma';
import stripe, { getPriceIdForPlan } from '../lib/stripe';
import { sendMail } from '../lib/mailer';

const router = Router();

// ─── Create Stripe Checkout Session ───────────────────────────────────────────
router.post('/checkout', requireAuth, async (req: AuthRequest, res: Response) => {
  const { plan } = req.body;
  const priceId = getPriceIdForPlan(plan);
  if (!priceId) {
    res.status(400).json({ error: 'Plan invalide.' });
    return;
  }

  const user = await prisma.user.findUnique({ where: { id: req.user!.id } });
  if (!user) {
    res.status(404).json({ error: 'Utilisateur introuvable.' });
    return;
  }

  const appUrl = process.env.APP_URL || process.env.BETTER_AUTH_URL || 'http://localhost:3000';

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    payment_method_types: ['card'],
    customer_email: user.stripeCustomerId ? undefined : user.email,
    customer: user.stripeCustomerId || undefined,
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${appUrl}/billing?success=1`,
    cancel_url: `${appUrl}/billing?canceled=1`,
    metadata: { userId: user.id },
  });

  res.json({ url: session.url });
});

// ─── Stripe Customer Portal ────────────────────────────────────────────────────
router.post('/portal', requireAuth, async (req: AuthRequest, res: Response) => {
  const user = await prisma.user.findUnique({ where: { id: req.user!.id } });
  if (!user?.stripeCustomerId) {
    res.status(400).json({ error: 'Aucun abonnement actif.' });
    return;
  }

  const appUrl = process.env.APP_URL || process.env.BETTER_AUTH_URL || 'http://localhost:3000';

  const portalSession = await stripe.billingPortal.sessions.create({
    customer: user.stripeCustomerId,
    return_url: `${appUrl}/billing`,
  });

  res.json({ url: portalSession.url });
});

// ─── Stripe Webhook ────────────────────────────────────────────────────────────
router.post('/webhook', async (req: Request, res: Response) => {
  const sig = req.headers['stripe-signature'];
  if (!sig) {
    res.status(400).json({ error: 'Missing stripe-signature' });
    return;
  }

  let event: any;
  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    res.status(400).json({ error: `Webhook error: ${err.message}` });
    return;
  }

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object;
      const userId = session.metadata?.userId;
      if (!userId) break;

      const subscription = await stripe.subscriptions.retrieve(session.subscription as string);
      const priceId = subscription.items.data[0]?.price.id;
      const plan = Object.entries({
        starter: process.env.STRIPE_PRICE_STARTER,
        pro:     process.env.STRIPE_PRICE_PRO,
        agency:  process.env.STRIPE_PRICE_AGENCY,
      }).find(([, id]) => id === priceId)?.[0] || 'free';

      await prisma.user.update({
        where: { id: userId },
        data: {
          plan,
          stripeCustomerId: session.customer as string,
          stripeSubscriptionId: session.subscription as string,
        },
      });
      break;
    }

    case 'customer.subscription.updated': {
      const sub = event.data.object;
      const user = await prisma.user.findFirst({
        where: { stripeSubscriptionId: sub.id },
      });
      if (!user) break;

      const priceId = sub.items.data[0]?.price.id;
      const plan = Object.entries({
        starter: process.env.STRIPE_PRICE_STARTER,
        pro:     process.env.STRIPE_PRICE_PRO,
        agency:  process.env.STRIPE_PRICE_AGENCY,
      }).find(([, id]) => id === priceId)?.[0] || 'free';

      await prisma.user.update({ where: { id: user.id }, data: { plan } });
      break;
    }

    case 'customer.subscription.deleted': {
      const sub = event.data.object;
      await prisma.user.updateMany({
        where: { stripeSubscriptionId: sub.id },
        data: { plan: 'free', stripeSubscriptionId: null },
      });
      break;
    }

    case 'invoice.payment_failed': {
      const invoice = event.data.object;
      if (invoice.customer_email) {
        await sendMail({
          to: invoice.customer_email,
          subject: 'Paiement échoué — WebWidget',
          html: `
            <div style="font-family:sans-serif;padding:40px;max-width:520px">
              <h2 style="color:#621B7A">Paiement échoué</h2>
              <p>Nous n'avons pas pu traiter votre paiement. Veuillez mettre à jour votre moyen de paiement.</p>
              <a href="${process.env.APP_URL || 'http://localhost:3000'}/billing"
                 style="display:inline-block;background:#621B7A;color:#fff;padding:12px 24px;border-radius:5px;text-decoration:none">
                Gérer mon abonnement
              </a>
            </div>`,
        });
      }
      break;
    }
  }

  res.json({ received: true });
});

export default router;
