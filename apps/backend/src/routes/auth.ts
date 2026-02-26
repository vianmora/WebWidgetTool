import { Router } from 'express';
import jwt from 'jsonwebtoken';

const router = Router();

router.post('/login', (req, res) => {
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

export default router;
