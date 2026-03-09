import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import rateLimit from 'express-rate-limit';
import { isSaaS } from './lib/mode';
import authRouter from './routes/auth';
import widgetsRouter from './routes/widgets';
import placesRouter from './routes/places';
import publicRouter from './routes/public';
import billingRouter from './routes/billing';
import adminRouter from './routes/admin';

const app = express();
const PORT = process.env.PORT || 4000;

// Trust the first reverse proxy (Traefik, Nginx, Coolify…) so that
// express-rate-limit can read X-Forwarded-For correctly.
app.set('trust proxy', 1);

const dashboardCors = cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
});

const openCors = cors();

// Stripe webhook needs raw body — mount before express.json()
app.use('/api/billing/webhook', express.raw({ type: 'application/json' }));
app.use(express.json());

// Rate limiting on auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30,
  skipFailedRequests: true, // 5xx errors don't consume quota (avoids exhaustion from server errors)
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Trop de tentatives. Réessayez dans 15 minutes.' },
});

// ─── Better Auth handler (SaaS mode) ─────────────────────────────────────────
if (isSaaS()) {
  // Dynamic import to avoid loading Better Auth in self-hosted mode
  import('./lib/auth').then(({ auth }) => {
    const { toNodeHandler } = require('better-auth/node');
    app.all('/api/auth/*', authLimiter, dashboardCors, toNodeHandler(auth));
  });
}

// ─── API routes ───────────────────────────────────────────────────────────────
app.use('/api/auth', authLimiter, dashboardCors, authRouter);
app.use('/api/widgets', dashboardCors, widgetsRouter);
app.use('/api/places', dashboardCors, placesRouter);
app.use('/api/billing', dashboardCors, billingRouter);
app.use('/api/admin', dashboardCors, adminRouter);

// ─── Public widget routes (open CORS) ────────────────────────────────────────
app.use('/widget', openCors, publicRouter);

// Serve widget.js with open CORS
app.get('/widget.js', openCors, (_, res) => {
  res.setHeader('Content-Type', 'application/javascript');
  res.sendFile(path.join(__dirname, '../public/widget.js'));
});

app.get('/health', (_, res) => res.json({ status: 'ok' }));

// ─── SPA serving (all-in-one prod mode) ──────────────────────────────────────
const spaDir = path.join(__dirname, '../public/app');
const spaIndex = path.join(spaDir, 'index.html');
if (fs.existsSync(spaIndex)) {
  app.use(express.static(spaDir));
  app.get('*', (_req, res) => res.sendFile(spaIndex));
}

app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT} [${process.env.APP_MODE || 'selfhosted'}]`);
});
