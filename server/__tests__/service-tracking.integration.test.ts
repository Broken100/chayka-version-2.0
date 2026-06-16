import { describe, it, expect, beforeEach, afterAll } from 'vitest';
import request from 'supertest';
import { hasTestDatabase, getApp, truncateTables } from './setup.js';

const d = hasTestDatabase ? describe : describe.skip;

async function login(app: Awaited<ReturnType<typeof getApp>>): Promise<string> {
  const res = await request(app)
    .post('/api/admin/login')
    .send({ password: 'testpass' })
    .set('Content-Type', 'application/json');
  expect(res.status).toBe(200);
  return res.headers['set-cookie']![0]!;
}

const VALID_RESERVATION_BODY = {
  customerName: 'Test Customer',
  customerEmail: 'test@example.com',
  customerPhone: '+593987163354',
  date: '2026-12-31',
  timeSlot: '19:00',
  tableId: 't_deck_1',
  area: 'waterfall_deck' as const,
  guestsCount: 2
};

async function seedReservation(app: Awaited<ReturnType<typeof getApp>>): Promise<string> {
  const { db } = await import('../db/client.js');
  const { tables } = await import('../db/schema.js');
  await db.insert(tables).values({
    id: 't_deck_1',
    nameEs: 'Mesa 1',
    nameEn: 'Table 1',
    capacity: 4,
    area: 'waterfall_deck',
    minimumConsumption: '0.00'
  } as never);
  const res = await request(app)
    .post('/api/reservations')
    .send(VALID_RESERVATION_BODY)
    .set('Content-Type', 'application/json');
  expect(res.status).toBe(201);
  return res.body.id as string;
}

d('Service tracking — happy paths (integration)', () => {
  beforeEach(async () => {
    await truncateTables();
  });
  afterAll(async () => {
    await truncateTables();
  });

  it('checkin → checked_in + checked_in_at stamped', async () => {
    const app = await getApp();
    const { db } = await import('../db/client.js');
    const { reservations } = await import('../db/schema.js');
    const id = await seedReservation(app);
    const cookie = await login(app);

    const res = await request(app)
      .post(`/api/admin/reservations/${id}/checkin`)
      .set('Cookie', cookie);
    expect(res.status).toBe(200);
    expect(res.body.serviceStatus).toBe('checked_in');
    expect(res.body.checkedInAt).not.toBeNull();

    const row = (await db.select().from(reservations).where((await import('drizzle-orm')).eq(reservations.id, id)))[0]!;
    expect(row.serviceStatus).toBe('checked_in');
    expect(row.checkedInAt).not.toBeNull();
    expect(row.serviceStartedAt).toBeNull();
    expect(row.serviceCompletedAt).toBeNull();
  });

  it('full happy path: not_checked_in → checked_in → in_service → completed', async () => {
    const app = await getApp();
    const { db } = await import('../db/client.js');
    const { reservations, eq } = await import('../db/schema.js');
    const id = await seedReservation(app);
    const cookie = await login(app);

    let r = await request(app)
      .post(`/api/admin/reservations/${id}/checkin`)
      .set('Cookie', cookie);
    expect(r.status).toBe(200);
    expect(r.body.serviceStatus).toBe('checked_in');

    r = await request(app)
      .post(`/api/admin/reservations/${id}/start-service`)
      .set('Cookie', cookie);
    expect(r.status).toBe(200);
    expect(r.body.serviceStatus).toBe('in_service');
    expect(r.body.serviceStartedAt).not.toBeNull();

    r = await request(app)
      .post(`/api/admin/reservations/${id}/complete-service`)
      .set('Cookie', cookie);
    expect(r.status).toBe(200);
    expect(r.body.serviceStatus).toBe('completed');
    expect(r.body.serviceCompletedAt).not.toBeNull();

    // All three timestamps are populated.
    const row = (await db.select().from(reservations).where(eq(reservations.id, id)))[0]!;
    expect(row.checkedInAt).not.toBeNull();
    expect(row.serviceStartedAt).not.toBeNull();
    expect(row.serviceCompletedAt).not.toBeNull();
  });
});

d('Service tracking — invalid transitions (integration)', () => {
  beforeEach(async () => {
    await truncateTables();
  });
  afterAll(async () => {
    await truncateTables();
  });

  it('returns 409 when calling checkin twice in a row', async () => {
    const app = await getApp();
    const id = await seedReservation(app);
    const cookie = await login(app);

    const first = await request(app)
      .post(`/api/admin/reservations/${id}/checkin`)
      .set('Cookie', cookie);
    expect(first.status).toBe(200);

    const second = await request(app)
      .post(`/api/admin/reservations/${id}/checkin`)
      .set('Cookie', cookie);
    expect(second.status).toBe(409);
    expect(second.body.error).toMatch(/Invalid service transition/);
  });

  it('returns 409 when calling start-service from not_checked_in', async () => {
    const app = await getApp();
    const id = await seedReservation(app);
    const cookie = await login(app);

    const res = await request(app)
      .post(`/api/admin/reservations/${id}/start-service`)
      .set('Cookie', cookie);
    expect(res.status).toBe(409);
    expect(res.body.error).toMatch(/not_checked_in/);
  });

  it('returns 409 when calling complete-service from checked_in', async () => {
    const app = await getApp();
    const id = await seedReservation(app);
    const cookie = await login(app);

    await request(app)
      .post(`/api/admin/reservations/${id}/checkin`)
      .set('Cookie', cookie);
    const res = await request(app)
      .post(`/api/admin/reservations/${id}/complete-service`)
      .set('Cookie', cookie);
    expect(res.status).toBe(409);
    expect(res.body.error).toMatch(/Invalid service transition/);
  });
});

d('Service tracking — missing reservation (integration)', () => {
  beforeEach(async () => {
    await truncateTables();
  });
  afterAll(async () => {
    await truncateTables();
  });

  it('returns 404 when the reservation does not exist (checkin)', async () => {
    const app = await getApp();
    const cookie = await login(app);
    const res = await request(app)
      .post('/api/admin/reservations/RES-999999/checkin')
      .set('Cookie', cookie);
    expect(res.status).toBe(404);
  });

  it('returns 404 when the reservation does not exist (start-service)', async () => {
    const app = await getApp();
    const cookie = await login(app);
    const res = await request(app)
      .post('/api/admin/reservations/RES-999999/start-service')
      .set('Cookie', cookie);
    expect(res.status).toBe(404);
  });

  it('returns 404 when the reservation does not exist (complete-service)', async () => {
    const app = await getApp();
    const cookie = await login(app);
    const res = await request(app)
      .post('/api/admin/reservations/RES-999999/complete-service')
      .set('Cookie', cookie);
    expect(res.status).toBe(404);
  });
});
