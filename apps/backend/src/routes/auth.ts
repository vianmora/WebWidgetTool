import { Router } from 'express';
import jwt from 'jsonwebtoken';
import { isSaaS } from '../lib/mode';
import { requireAuth, AuthRequest } from '../middleware/authUnified';

const router = Router();

// ─── Self-hosted login (JWT) ───────────────────────────────────────────────────
// Only active when APP_MODE=selfhosted. In SaaS mode, Better Auth handles /api/auth/*
router.post('/login', (req, res) => {
  if (isSaaS()) {
    res.status(404).json({ error: 'Not found' });
    return;
  }

  const { email, password } = req.body;

  if (
    email !== process.env.ADMIN_EMAIL ||
    password !== process.env.ADMIN_PASSWORD
  ) {
    res.status(401).json({ error: 'Identifiants incorrects.' });
    return;
  }

  const token = jwt.sign(
    { email },
    process.env.JWT_SECRET || 'secret',
    { expiresIn: '7d' }
  );

  res.json({ token });
});

// ─── Current user profile ──────────────────────────────────────────────────────
router.get('/me', requireAuth, (req: AuthRequest, res) => {
  res.json({ id: req.user!.id, email: req.user!.email, plan: req.user!.plan });
});

export default router;
