import { describe, it, expect, beforeEach, afterAll } from 'vitest';
import request from 'supertest';
import { hasTestDatabase, getApp, truncateTables } from './setup.js';

const d = hasTestDatabase ? describe : describe.skip;

function cookieHeader(res: request.Response): string[] {
  const raw = res.headers['set-cookie'];
  if (!raw) return [];
  return Array.isArray(raw) ? raw : [raw];
}

function findSessionCookie(res: request.Response): string | undefined {
  return cookieHeader(res).find((c) => c.startsWith('chayka_admin_session='));
}

d('POST /api/admin/login (integration)', () => {
  beforeEach(async () => {
    await truncateTables();
  });

  afterAll(async () => {
    await truncateTables();
  });

  it('correct password sets chayka_admin_session cookie and inserts an admin_sessions row', async () => {
    const app = await getApp();
    const res = await request(app)
      .post('/api/admin/login')
      .send({ password: 'testpass' })
      .set('Content-Type', 'application/json');

    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
    const sessionCookie = findSessionCookie(res);
    expect(sessionCookie).toBeDefined();
    expect(sessionCookie).toMatch(/HttpOnly/i);

    // The cookie value is a UUID token — verify a row was written.
    const { db } = await import('../db/client.js');
    const { adminSessions } = await import('../db/schema.js');
    const { eq } = await import('drizzle-orm');
    const token = sessionCookie!.split(';')[0]!.split('=')[1]!;
    const rows = await db
      .select()
      .from(adminSessions)
      .where(eq(adminSessions.token, token));
    expect(rows).toHaveLength(1);
    expect(new Date(rows[0]!.expiresAt).getTime()).toBeGreaterThan(Date.now());
  });

  it('wrong password returns 401 Invalid credentials and sets no cookie', async () => {
    const app = await getApp();
    const res = await request(app)
      .post('/api/admin/login')
      .send({ password: 'nope' })
      .set('Content-Type', 'application/json');

    expect(res.status).toBe(401);
    expect(res.body).toEqual({ error: 'Invalid credentials' });
    expect(findSessionCookie(res)).toBeUndefined();
  });

  it('protected admin route without cookie returns 401 Unauthorized', async () => {
    const app = await getApp();
    const res = await request(app).get('/api/admin/tables');
    expect(res.status).toBe(401);
    expect(res.body).toEqual({ error: 'Unauthorized' });
  });

  it('protected admin route WITH cookie returns 200', async () => {
    const app = await getApp();
    const login = await request(app)
      .post('/api/admin/login')
      .send({ password: 'testpass' })
      .set('Content-Type', 'application/json');
    expect(login.status).toBe(200);
    const cookie = login.headers['set-cookie']![0]!;

    const res = await request(app)
      .get('/api/admin/tables')
      .set('Cookie', cookie);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('logout returns 200 and clears the cookie (Max-Age=0)', async () => {
    const app = await getApp();
    const login = await request(app)
      .post('/api/admin/login')
      .send({ password: 'testpass' })
      .set('Content-Type', 'application/json');
    const cookie = login.headers['set-cookie']![0]!;

    const res = await request(app)
      .post('/api/admin/logout')
      .set('Cookie', cookie);
    expect(res.status).toBe(200);
    const clearCookie = findSessionCookie(res);
    expect(clearCookie).toBeDefined();
    expect(clearCookie).toMatch(/Max-Age=0/i);
  });

  it('logout deletes the admin_sessions row', async () => {
    const app = await getApp();
    const login = await request(app)
      .post('/api/admin/login')
      .send({ password: 'testpass' })
      .set('Content-Type', 'application/json');
    const cookie = login.headers['set-cookie']![0]!;
    const token = cookie.split(';')[0]!.split('=')[1]!;

    const { db } = await import('../db/client.js');
    const { adminSessions } = await import('../db/schema.js');
    const { eq } = await import('drizzle-orm');
    const before = await db
      .select()
      .from(adminSessions)
      .where(eq(adminSessions.token, token));
    expect(before).toHaveLength(1);

    await request(app).post('/api/admin/logout').set('Cookie', cookie);

    const after = await db
      .select()
      .from(adminSessions)
      .where(eq(adminSessions.token, token));
    expect(after).toHaveLength(0);
  });
});
