import { Router } from 'express';
import { requireAuth, AuthRequest } from '../middleware/authUnified';
import prisma from '../lib/prisma';
import cache from '../lib/cache';
import { isSaaS } from '../lib/mode';
import { hasReachedWidgetLimit, getPlanLimits } from '../lib/planLimits';
import { createScheduleAndRun, deleteSchedule } from '../lib/apify';

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

    // If Apify is configured and this is a google_reviews widget, create a
    // dataset + schedule and store the IDs. Fire-and-forget: don't block the response.
    if (process.env.APIFY_TOKEN && type === 'google_reviews' && (config as any).placeId) {
      const cfg = config as any;
      const language: string = cfg.language || 'fr';
      const maxReviews: number = Number(cfg.maxReviews ?? 5);
      createScheduleAndRun(cfg.placeId, language, maxReviews)
        .then(({ datasetId, scheduleId }) =>
          (prisma.widget.update as any)({
            where: { id: widget.id },
            data: { apifyDatasetId: datasetId, apifyScheduleId: scheduleId },
          }),
        )
        .catch((err) => console.error('[apify] createScheduleAndRun failed:', err?.message));
    }

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
    const existing = await prisma.widget.findUnique({ where: { id: req.params.id } });
    if (!existing) {
      res.status(404).json({ error: 'Widget introuvable.' });
      return;
    }
    if (isSaaS() && existing.userId !== req.user!.id) {
      res.status(403).json({ error: 'Forbidden' });
      return;
    }

    const { name, config } = req.body;
    const widget = await prisma.widget.update({
      where: { id: req.params.id },
      data: {
        ...(name !== undefined && { name }),
        ...(config !== undefined && { config }),
      },
    });

    // Always invalidate the final response cache (config may have changed)
    cache.del(`data:${req.params.id}`);

    // For google_reviews: only invalidate the raw reviews cache if Apify-relevant fields changed
    if (existing.type === 'google_reviews' && config !== undefined) {
      const oldCfg = existing.config as any;
      const newCfg = config as any;
      const apifyFieldChanged =
        oldCfg.placeId !== newCfg.placeId ||
        String(oldCfg.maxReviews ?? 5) !== String(newCfg.maxReviews ?? 5) ||
        (oldCfg.language || 'fr') !== (newCfg.language || 'fr');
      if (apifyFieldChanged) {
        cache.del(`apify:${oldCfg.placeId}:${Number(oldCfg.maxReviews ?? 5)}:${oldCfg.language || 'fr'}`);
      }
    }

    res.json(widget);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', async (req: AuthRequest, res) => {
  try {
    const existing = await prisma.widget.findUnique({ where: { id: req.params.id } });
    if (!existing) {
      res.status(404).json({ error: 'Widget introuvable.' });
      return;
    }
    if (isSaaS() && existing.userId !== req.user!.id) {
      res.status(403).json({ error: 'Forbidden' });
      return;
    }

    // Clean up Apify schedule before deleting (fire-and-forget)
    const scheduleId = (existing as any).apifyScheduleId as string | null;
    if (scheduleId) {
      deleteSchedule(scheduleId).catch((err) =>
        console.error('[apify] deleteSchedule failed:', err?.message),
      );
    }

    await prisma.widget.delete({ where: { id: req.params.id } });
    res.status(204).send();
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
