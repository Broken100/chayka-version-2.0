import 'dotenv/config';
import express, { type Request, type Response, type NextFunction } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import publicRoutes from './routes/public.js';
import adminRoutes from './routes/admin.js';
import { requestTimeout } from './lib/timeout.js';

const app = express();
const port = Number(process.env.PORT) || 3001;

app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '1mb' }));
app.use(cookieParser());

// 5-second request timeout: abort with 504 if a handler has not finished.
app.use(requestTimeout());

app.get('/api/health', (_req: Request, res: Response) => {
  res.json({ ok: true, service: 'chayka-api' });
});

app.use('/api/admin', adminRoutes);
app.use('/api', publicRoutes);

// 404 fallback for unknown /api routes
app.use('/api', (_req: Request, res: Response) => {
  res.status(404).json({ error: 'Not Found' });
});

// Centralized error handler
app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  console.error('[API error]', err);
  const message = err instanceof Error ? err.message : 'Internal Server Error';
  res.status(500).json({ error: message });
});

app.listen(port, () => {
  console.log(`[chayka-api] listening on http://localhost:${port}`);
});
