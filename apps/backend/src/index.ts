import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import authRouter from './routes/auth';
import widgetsRouter from './routes/widgets';
import placesRouter from './routes/places';
import publicRouter from './routes/public';

const app = express();
const PORT = process.env.PORT || 4000;

const dashboardCors = cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
});

const openCors = cors();

app.use(express.json());

app.use('/api/auth', dashboardCors, authRouter);
app.use('/api/widgets', dashboardCors, widgetsRouter);
app.use('/api/places', dashboardCors, placesRouter);
app.use('/widget', openCors, publicRouter);

// Serve widget.js with open CORS
app.get('/widget.js', openCors, (_, res) => {
  res.setHeader('Content-Type', 'application/javascript');
  res.sendFile(path.join(__dirname, '../public/widget.js'));
});

app.get('/health', (_, res) => res.json({ status: 'ok' }));

// Serve the React SPA when the frontend is bundled (all-in-one mode).
// The Dockerfile copies the frontend build to public/app/.
// In dev (two-container) mode this directory does not exist and this block is skipped.
const spaDir = path.join(__dirname, '../public/app');
const spaIndex = path.join(spaDir, 'index.html');
if (fs.existsSync(spaIndex)) {
  app.use(express.static(spaDir));
  // SPA fallback: serve index.html for any route not already handled above
  app.get('*', (_req, res) => res.sendFile(spaIndex));
}

app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
});
