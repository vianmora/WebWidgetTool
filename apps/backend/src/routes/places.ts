import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { searchPlaces, fetchGoogleReviewsWithPhotos } from '../lib/google';
import cache from '../lib/cache';

const router = Router();

router.use(requireAuth);

router.get('/search', async (req, res) => {
  const q = req.query.q as string;
  if (!q || q.trim().length < 2) {
    res.status(400).json({ error: 'Paramètre q requis (min 2 caractères).' });
    return;
  }
  if (!process.env.GOOGLE_MAPS_API_KEY) {
    res.status(500).json({ error: 'API_KEY_MISSING', message: 'Clé API Google Maps non configurée.' });
    return;
  }
  try {
    const results = await searchPlaces(q.trim());
    res.json(results);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/reviews', async (req, res) => {
  const placeId = req.query.placeId as string;
  if (!placeId) {
    res.status(400).json({ error: 'Paramètre placeId requis.' });
    return;
  }
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    res.status(500).json({ error: 'GOOGLE_MAPS_API_KEY non configurée.' });
    return;
  }

  const cacheKey = `places:${placeId}`;
  const cached = cache.get(cacheKey);
  if (cached) { res.json(cached); return; }

  try {
    const reviews = await fetchGoogleReviewsWithPhotos(placeId, apiKey, 'fr');
    cache.set(cacheKey, reviews);
    res.json(reviews);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
