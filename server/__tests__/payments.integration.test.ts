import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { hasTestDatabase, getApp } from './setup.js';

const d = hasTestDatabase ? describe : describe.skip;

d('POST /api/payments/simulate (integration)', () => {
  it('card with valid amount succeeds after 1-2s and returns a PAY- reference', async () => {
    const app = await getApp();
    const t0 = Date.now();
    const res = await request(app)
      .post('/api/payments/simulate')
      .send({ method: 'card', amount: 12.5 })
      .set('Content-Type', 'application/json');
    const elapsed = Date.now() - t0;

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('success');
    expect(res.body.reference).toMatch(/^PAY-[A-Z0-9]{9}$/);
    expect(elapsed).toBeGreaterThanOrEqual(1000);
    expect(elapsed).toBeLessThanOrEqual(2500);
  });

  it('card with reference starting 0000 fails with "Card declined"', async () => {
    const app = await getApp();
    const t0 = Date.now();
    const res = await request(app)
      .post('/api/payments/simulate')
      .send({ method: 'card', amount: 12.5, reference: '0000-1234' })
      .set('Content-Type', 'application/json');
    const elapsed = Date.now() - t0;

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: 'failed', reason: 'Card declined' });
    // The handler still simulates 1-2s of latency before responding.
    expect(elapsed).toBeGreaterThanOrEqual(1000);
  });

  it('transfer without a reference is rejected immediately with 400', async () => {
    const app = await getApp();
    const t0 = Date.now();
    const res = await request(app)
      .post('/api/payments/simulate')
      .send({ method: 'transfer', amount: 50 })
      .set('Content-Type', 'application/json');
    const elapsed = Date.now() - t0;

    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: 'reference is required' });
    // The 400 path must skip the simulated 1-2s delay.
    expect(elapsed).toBeLessThan(500);
  });
});
