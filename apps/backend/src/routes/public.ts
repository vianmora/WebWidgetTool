import { Router } from 'express';
import prisma from '../lib/prisma';
import cache from '../lib/cache';
import { fetchGoogleReviews } from '../lib/google';

const router = Router();

router.get('/:id/reviews', async (req, res) => {
  const { id } = req.params;

  const cached = cache.get(id);
  if (cached) {
    res.json(cached);
    return;
  }

  try {
    const widget = await prisma.widget.findUnique({ where: { id } });
    if (!widget) {
      res.status(404).json({ error: 'Widget introuvable.' });
      return;
    }

    const config = widget.config as any;
    const reviews = await fetchGoogleReviews(config.placeId, config.apiKey);

    const minRating: number = config.minRating ?? 1;
    const maxReviews: number = config.maxReviews ?? 5;

    const filtered = reviews
      .filter((r) => r.rating >= minRating)
      .slice(0, maxReviews);

    const result = {
      widget: {
        id: widget.id,
        name: widget.name,
        config: {
          theme: config.theme || 'light',
          accentColor: config.accentColor || '#4F46E5',
        },
      },
      reviews: filtered,
    };

    cache.set(id, result);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
