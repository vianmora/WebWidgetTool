import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { searchPlaces } from '../lib/google';

const router = Router();

router.use(requireAuth);

router.get('/search', async (req, res) => {
  const q = req.query.q as string;
  if (!q || q.trim().length < 2) {
    res.status(400).json({ error: 'Paramètre q requis (min 2 caractères).' });
    return;
  }
  try {
    const results = await searchPlaces(q.trim());
    res.json(results);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
