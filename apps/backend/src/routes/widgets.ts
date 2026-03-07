import { Router } from 'express';
import { requireAuth, AuthRequest } from '../middleware/authUnified';
import prisma from '../lib/prisma';
import cache from '../lib/cache';
import { isSaaS } from '../lib/mode';
import { hasReachedWidgetLimit, getPlanLimits } from '../lib/planLimits';

const router = Router();

router.use(requireAuth);

router.get('/', async (req: AuthRequest, res) => {
  try {
    const where = isSaaS() ? { userId: req.user!.id } : {};
    const widgets = await prisma.widget.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
    res.json(widgets);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req: AuthRequest, res) => {
  try {
    const { name, type, config } = req.body;
    if (!name || !type || !config) {
      res.status(400).json({ error: 'name, type et config sont requis.' });
      return;
    }

    if (isSaaS()) {
      const count = await prisma.widget.count({ where: { userId: req.user!.id } });
      if (hasReachedWidgetLimit(req.user!.plan || 'free', count)) {
        const limits = getPlanLimits(req.user!.plan || 'free');
        res.status(403).json({
          error: `Limite atteinte : votre plan autorise ${limits.widgets} widget(s). Passez à un plan supérieur.`,
          code: 'WIDGET_LIMIT_REACHED',
        });
        return;
      }
    }

    const widget = await prisma.widget.create({
      data: {
        name,
        type,
        config,
        ...(isSaaS() ? { userId: req.user!.id } : {}),
      },
    });
    res.status(201).json(widget);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', async (req: AuthRequest, res) => {
  try {
    const widget = await prisma.widget.findUnique({ where: { id: req.params.id } });
    if (!widget) {
      res.status(404).json({ error: 'Widget introuvable.' });
      return;
    }
    // In SaaS mode, ensure the widget belongs to the requesting user
    if (isSaaS() && widget.userId !== req.user!.id) {
      res.status(403).json({ error: 'Forbidden' });
      return;
    }
    res.json(widget);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id/stats', async (req: AuthRequest, res) => {
  try {
    const widget = await prisma.widget.findUnique({ where: { id: req.params.id } });
    if (!widget || (isSaaS() && widget.userId !== req.user!.id)) {
      res.status(404).json({ error: 'Widget introuvable.' });
      return;
    }
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const [monthAgg, totalAgg] = await Promise.all([
      prisma.widgetView.aggregate({ where: { widgetId: req.params.id, date: { gte: startOfMonth } }, _sum: { count: true } }),
      prisma.widgetView.aggregate({ where: { widgetId: req.params.id }, _sum: { count: true } }),
    ]);
    res.json({
      viewsThisMonth: monthAgg._sum.count ?? 0,
      viewsTotal: totalAgg._sum.count ?? 0,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.patch('/:id', async (req: AuthRequest, res) => {
  try {
    // Ownership check in SaaS mode
    if (isSaaS()) {
      const existing = await prisma.widget.findUnique({ where: { id: req.params.id } });
      if (!existing || existing.userId !== req.user!.id) {
        res.status(403).json({ error: 'Forbidden' });
        return;
      }
    }

    const { name, config } = req.body;
    const widget = await prisma.widget.update({
      where: { id: req.params.id },
      data: {
        ...(name !== undefined && { name }),
        ...(config !== undefined && { config }),
      },
    });
    cache.del(req.params.id);
    res.json(widget);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', async (req: AuthRequest, res) => {
  try {
    // Ownership check in SaaS mode
    if (isSaaS()) {
      const existing = await prisma.widget.findUnique({ where: { id: req.params.id } });
      if (!existing || existing.userId !== req.user!.id) {
        res.status(403).json({ error: 'Forbidden' });
        return;
      }
    }

    await prisma.widget.delete({ where: { id: req.params.id } });
    res.status(204).send();
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
