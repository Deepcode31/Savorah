import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { createServer as createViteServer } from 'vite';
import { config } from './config.js';
import { connectDb } from './db.js';

import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import transactionRoutes from './routes/transactions.js';
import budgetRoutes from './routes/budgets.js';
import goalRoutes from './routes/goals.js';
import notificationRoutes from './routes/notifications.js';
import analyticsRoutes from './routes/analytics.js';
import aiRoutes from './routes/ai.js';

const isProd = process.env.NODE_ENV === 'production';

const app = express();
app.disable('x-powered-by');
app.use(
  helmet({
    contentSecurityPolicy: false, // Vite dev server + inline styles; enable with a tuned policy when hardening prod
    crossOriginEmbedderPolicy: false,
    // Google Sign-In popup must postMessage back to the opener. Helmet's
    // default "same-origin" COOP blocks that and leaves accounts.google.com/gsi/transform blank.
    crossOriginOpenerPolicy: { policy: 'same-origin-allow-popups' },
  })
);
app.use(express.json({ limit: '10mb' }));

/* ---------- Rate limiting ---------- */
const apiLimiter = rateLimit({
  windowMs: 60_000,
  limit: 300,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { error: 'Too many requests. Please slow down.' },
});
const authLimiter = rateLimit({
  windowMs: 15 * 60_000,
  limit: 30,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { error: 'Too many authentication attempts. Try again in a few minutes.' },
});
const aiLimiter = rateLimit({
  windowMs: 60_000,
  limit: 30,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { error: 'AI request limit reached. Please wait a minute.' },
});

app.use('/api', apiLimiter);
app.use('/api/auth', authLimiter);
app.use('/api/ai', aiLimiter);

/* ---------- Request logging (API only) ---------- */
app.use('/api', (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  res.on('finish', () => {
    console.log(`${req.method} ${req.originalUrl} ${res.statusCode} ${Date.now() - start}ms`);
  });
  next();
});

app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'Savorah API',
    ai: config.openRouter.apiKey ? 'openrouter-configured' : 'openrouter-missing-key',
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/budgets', budgetRoutes);
app.use('/api/goals', goalRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/ai', aiRoutes);

/* ---------- API 404 + central error handler ---------- */
app.use('/api', (_req: Request, res: Response) => {
  res.status(404).json({ error: 'API route not found' });
});

app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Unhandled error:', err);
  if (res.headersSent) return;
  const status = err?.status || err?.statusCode || 500;
  res.status(status).json({
    error: isProd ? 'Internal server error' : err?.message || 'Internal server error',
  });
});

async function startServer() {
  try {
    await connectDb();
  } catch (err) {
    console.error('Failed to connect to MongoDB. Set MONGODB_URI and ensure Mongo is running.', err);
    process.exit(1);
  }

  if (!config.openRouter.apiKey) {
    console.warn('WARNING: OPENROUTER_API_KEY is not set — AI routes will fail until configured.');
  }

  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath, { maxAge: '1y', index: false }));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(config.port, '0.0.0.0', () => {
    console.log(`Savorah server running on http://localhost:${config.port}`);
  });
}

startServer();
