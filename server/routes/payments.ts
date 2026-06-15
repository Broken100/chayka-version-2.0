import { Router, type Request, type Response, type NextFunction } from 'express';
import { simulatePaymentSchema } from '../lib/validation.js';

const router = Router();

function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>
) {
  return (req: Request, res: Response, next: NextFunction) => {
    fn(req, res, next).catch(next);
  };
}

function randomAlnum(length: number): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let out = '';
  for (let i = 0; i < length; i++) {
    out += chars[Math.floor(Math.random() * chars.length)];
  }
  return out;
}

router.post(
  '/simulate',
  asyncHandler(async (req, res) => {
    const parsed = simulatePaymentSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: 'Invalid payment payload' });
      return;
    }

    const { method, reference } = parsed.data;

    // Transfer without a reference is rejected immediately (no delay).
    if (method === 'transfer' && (!reference || reference.trim() === '')) {
      res.status(400).json({ error: 'reference is required' });
      return;
    }

    // Simulate processing latency: 1-2s wall-clock for any non-immediate response.
    const delay = 1000 + Math.floor(Math.random() * 1000);
    await new Promise<void>((resolve) => setTimeout(resolve, delay));

    if (method === 'card' && reference && reference.startsWith('0000')) {
      res.json({ status: 'failed', reason: 'Card declined' });
      return;
    }

    res.json({ status: 'success', reference: `PAY-${randomAlnum(9)}` });
  })
);

export default router;
