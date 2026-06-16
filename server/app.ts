import 'dotenv/config';
import express, { type Request, type Response, type NextFunction } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import publicRoutes from './routes/public.js';
import adminRoutes from './routes/admin.js';
import paymentRoutes from './routes/payments.js';
import { requestTimeout } from './lib/timeout.js';
import { UPLOADS_DIR } from './lib/uploads.js';

export const app = express();

app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '1mb' }));
app.use(cookieParser());

// 5-second request timeout: abort with 504 if a handler has not finished.
app.use(requestTimeout());

// Serve uploaded images from local disk (D1) with a 1-year cache.
// Mounted BEFORE /api so static asset 404s don't fall through to API routes.
app.use(
  '/uploads',
  express.static(UPLOADS_DIR, {
    maxAge: '1y',
    setHeaders: (res) => {
      res.setHeader('Cache-Control', 'public, max-age=31536000');
    }
  })
);

// JSON 404 for missing uploaded files (express.static falls through here).
app.use('/uploads', (_req: Request, res: Response) => {
  res.status(404).json({ error: 'File not found' });
});

app.get('/api/health', (_req: Request, res: Response) => {
  res.json({ ok: true, service: 'chayka-api' });
});

app.use('/api/admin', adminRoutes);
app.use('/api', publicRoutes);
app.use('/api/payments', paymentRoutes);

// 404 fallback for unknown /api routes
app.use('/api', (_req: Request, res: Response) => {
  res.status(404).json({ error: 'Not Found' });
});

// Centralized error handler
app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  const e = err as { status?: number; message?: string };
  if (e && typeof e.status === 'number' && e.status >= 400 && e.status < 500) {
    res.status(e.status).json({ error: e.message ?? 'Request failed' });
    return;
  }
  console.error('[API error]', err);
  const message = err instanceof Error ? err.message : 'Internal Server Error';
  res.status(500).json({ error: message });
});
