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

d('Notifications — POST /api/reservations writes a row (integration)', () => {
  beforeEach(async () => {
    await truncateTables();
  });
  afterAll(async () => {
    await truncateTables();
  });

  it('creates a reservation_created notification with bilingual es+en text', async () => {
    const app = await getApp();
    const { db } = await import('../db/client.js');
    const { tables, notifications } = await import('../db/schema.js');
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
    const reservationId = res.body.id as string;

    const rows = await db.select().from(notifications);
    expect(rows).toHaveLength(1);
    const row = rows[0]!;
    expect(row.type).toBe('reservation_created');
    expect(row.sourceReservationId).toBe(reservationId);
    expect(row.titleEs).toBe('Nueva Reserva');
    expect(row.titleEn).toBe('New Reservation');
    expect(row.bodyEs).toContain(reservationId);
    expect(row.bodyEn).toContain(reservationId);
    expect(row.dismissedAt).toBeNull();
  });
});

d('Notifications — status PATCH (integration)', () => {
  beforeEach(async () => {
    await truncateTables();
  });
  afterAll(async () => {
    await truncateTables();
  });

  it('writes a status-changed notification when the status actually changes', async () => {
    const app = await getApp();
    const { db } = await import('../db/client.js');
    const { tables, notifications } = await import('../db/schema.js');
    await db.insert(tables).values({
      id: 't_deck_1',
      nameEs: 'Mesa 1',
      nameEn: 'Table 1',
      capacity: 4,
      area: 'waterfall_deck',
      minimumConsumption: '0.00'
    } as never);

    const created = await request(app)
      .post('/api/reservations')
      .send(VALID_RESERVATION_BODY)
      .set('Content-Type', 'application/json');
    expect(created.status).toBe(201);
    const reservationId = created.body.id as string;

    // Sanity: 1 row from POST.
    const before = await db.select().from(notifications);
    expect(before).toHaveLength(1);

    const cookie = await login(app);
    const patch = await request(app)
      .patch(`/api/admin/reservations/${reservationId}/status`)
      .set('Cookie', cookie)
      .send({ status: 'confirmed' });
    expect(patch.status).toBe(200);

    const after = await db.select().from(notifications);
    expect(after).toHaveLength(2);
    const statusRow = after.find((r) => r.type === 'reservation_status_changed')!;
    expect(statusRow).toBeDefined();
    expect(statusRow.sourceReservationId).toBe(reservationId);
    expect(statusRow.bodyEs).toContain('pending → confirmed');
    expect(statusRow.bodyEn).toContain('pending → confirmed');
  });

  it('does NOT write a notification when the status is unchanged', async () => {
    const app = await getApp();
    const { db } = await import('../db/client.js');
    const { tables, notifications } = await import('../db/schema.js');
    await db.insert(tables).values({
      id: 't_deck_1',
      nameEs: 'Mesa 1',
      nameEn: 'Table 1',
      capacity: 4,
      area: 'waterfall_deck',
      minimumConsumption: '0.00'
    } as never);

    const created = await request(app)
      .post('/api/reservations')
      .send(VALID_RESERVATION_BODY)
      .set('Content-Type', 'application/json');
    const reservationId = created.body.id as string;

    const cookie = await login(app);
    // First PATCH: pending → confirmed (writes a notification).
    await request(app)
      .patch(`/api/admin/reservations/${reservationId}/status`)
      .set('Cookie', cookie)
      .send({ status: 'confirmed' });
    // Second PATCH: confirmed → confirmed (must NOT write a notification).
    await request(app)
      .patch(`/api/admin/reservations/${reservationId}/status`)
      .set('Cookie', cookie)
      .send({ status: 'confirmed' });

    const all = await db.select().from(notifications);
    // 1 from POST + 1 from the first PATCH = 2 total. The unchanged PATCH
    // must not add a third.
    expect(all).toHaveLength(2);
    const types = all.map((r) => r.type);
    expect(types.filter((t) => t === 'reservation_status_changed')).toHaveLength(1);
  });
});

d('Notifications — admin GET + dismiss (integration)', () => {
  beforeEach(async () => {
    await truncateTables();
  });
  afterAll(async () => {
    await truncateTables();
  });

  it('GET /api/admin/notifications returns up to 50 rows in created_at DESC order', async () => {
    const app = await getApp();
    const { db } = await import('../db/client.js');
    const { tables, notifications } = await import('../db/schema.js');
    await db.insert(tables).values({
      id: 't_deck_1',
      nameEs: 'Mesa 1',
      nameEn: 'Table 1',
      capacity: 4,
      area: 'waterfall_deck',
      minimumConsumption: '0.00'
    } as never);
    // Seed 60 notification rows directly.
    const rows = Array.from({ length: 60 }, (_, i) => ({
      type: 'reservation_created' as const,
      titleEs: `R ${i}`,
      titleEn: `R ${i}`,
      bodyEs: `b ${i}`,
      bodyEn: `b ${i}`,
      sourceReservationId: null
    }));
    await db.insert(notifications).values(rows as never);

    const cookie = await login(app);
    const res = await request(app).get('/api/admin/notifications').set('Cookie', cookie);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body).toHaveLength(50);
  });

  it('GET /api/admin/notifications?limit=10 returns 10 rows', async () => {
    const app = await getApp();
    const { db } = await import('../db/client.js');
    const { notifications } = await import('../db/schema.js');
    const rows = Array.from({ length: 30 }, (_, i) => ({
      type: 'reservation_created' as const,
      titleEs: `R ${i}`,
      titleEn: `R ${i}`,
      bodyEs: `b ${i}`,
      bodyEn: `b ${i}`
    }));
    await db.insert(notifications).values(rows as never);

    const cookie = await login(app);
    const res = await request(app)
      .get('/api/admin/notifications?limit=10')
      .set('Cookie', cookie);
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(10);
  });

  it('POST /api/admin/notifications/:id/dismiss returns 204 and stamps dismissed_at', async () => {
    const app = await getApp();
    const { db } = await import('../db/client.js');
    const { notifications } = await import('../db/schema.js');
    const inserted = await db
      .insert(notifications)
      .values({
        type: 'reservation_created',
        titleEs: 't',
        titleEn: 't',
        bodyEs: 'b',
        bodyEn: 'b'
      } as never)
      .returning({ id: notifications.id });
    const id = inserted[0]!.id;

    const cookie = await login(app);
    const res = await request(app)
      .post(`/api/admin/notifications/${id}/dismiss`)
      .set('Cookie', cookie);
    expect(res.status).toBe(204);

    const after = await db.select().from(notifications);
    expect(after[0]!.dismissedAt).not.toBeNull();
  });

  it('POST /api/admin/notifications/:id/dismiss returns 404 for an unknown id', async () => {
    const app = await getApp();
    const cookie = await login(app);
    const res = await request(app)
      .post('/api/admin/notifications/9999999/dismiss')
      .set('Cookie', cookie);
    expect(res.status).toBe(404);
    expect(res.body).toEqual({ error: 'Notification not found' });
  });
});
