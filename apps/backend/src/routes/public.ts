import { Router } from 'express';
import axios from 'axios';
import prisma from '../lib/prisma';
import cache from '../lib/cache';
import { fetchGoogleReviews } from '../lib/google';

const router = Router();

const ALLOWED_IMAGE_HOSTS = ['lh3.googleusercontent.com', 'lh4.googleusercontent.com', 'lh5.googleusercontent.com', 'lh6.googleusercontent.com'];
const imageCache = new Map<string, { data: Buffer; contentType: string }>();

router.get('/image', async (req, res) => {
  const url = req.query.url as string;
  if (!url) {
    res.status(400).end();
    return;
  }

  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    res.status(400).end();
    return;
  }

  if (!ALLOWED_IMAGE_HOSTS.includes(parsed.hostname)) {
    res.status(403).end();
    return;
  }

  if (imageCache.has(url)) {
    const { data, contentType } = imageCache.get(url)!;
    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'public, max-age=86400');
    res.send(data);
    return;
  }

  try {
    const response = await axios.get(url, { responseType: 'arraybuffer' });
    const data = Buffer.from(response.data);
    const contentType = response.headers['content-type'] || 'image/jpeg';
    imageCache.set(url, { data, contentType });
    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'public, max-age=86400');
    res.send(data);
  } catch {
    res.status(502).end();
  }
});

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
    const apiKey = process.env.GOOGLE_MAPS_API_KEY || config.apiKey;
    const language: string = config.language || 'fr';
    const reviews = await fetchGoogleReviews(config.placeId, apiKey, language);

    const minRating: number = config.minRating ?? 1;
    const maxReviews: number = config.maxReviews ?? 5;

    const baseUrl = `${req.protocol}://${req.get('host')}`;

    const filtered = reviews
      .filter((r) => r.rating >= minRating)
      .slice(0, maxReviews)
      .map((r) => ({
        ...r,
        profile_photo_url: r.profile_photo_url
          ? `${baseUrl}/widget/image?url=${encodeURIComponent(r.profile_photo_url)}`
          : r.profile_photo_url,
      }));

    const result = {
      widget: {
        id: widget.id,
        name: widget.name,
        config: {
          theme: config.theme || 'light',
          accentColor: config.accentColor || '#4F46E5',
          layout: config.layout || 'list',
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
