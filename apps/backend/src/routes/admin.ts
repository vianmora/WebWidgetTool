import { Router, Response } from 'express';
import { requireAuth, AuthRequest } from '../middleware/authUnified';
import prisma from '../lib/prisma';

const router = Router();

// Guard: superadmin only
function requireSuperAdmin(req: AuthRequest, res: Response, next: () => void) {
  const superAdminEmail = process.env.SUPERADMIN_EMAIL;
  if (!superAdminEmail || req.user?.email !== superAdminEmail) {
    res.status(403).json({ error: 'Forbidden' });
    return;
  }
  next();
}

router.use(requireAuth, requireSuperAdmin as any);

// GET /api/admin/users — list all users with stats
router.get('/users', async (_req, res) => {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      email: true,
      plan: true,
      monthlyViewCount: true,
      monthlyViewResetAt: true,
      createdAt: true,
      _count: { select: { widgets: true } },
    },
  });
  res.json(users);
});

// PATCH /api/admin/users/:id — override plan manually
router.patch('/users/:id', async (req, res) => {
  const { plan } = req.body;
  if (!['free', 'starter', 'pro', 'agency'].includes(plan)) {
    res.status(400).json({ error: 'Plan invalide.' });
    return;
  }
  const user = await prisma.user.update({
    where: { id: req.params.id },
    data: { plan },
    select: { id: true, email: true, plan: true },
  });
  res.json(user);
});

// GET /api/admin/stats — global metrics
router.get('/stats', async (_req, res) => {
  const [totalUsers, totalWidgets, byPlan] = await Promise.all([
    prisma.user.count(),
    prisma.widget.count(),
    prisma.user.groupBy({ by: ['plan'], _count: { id: true } }),
  ]);
  res.json({ totalUsers, totalWidgets, byPlan });
});

export default router;
