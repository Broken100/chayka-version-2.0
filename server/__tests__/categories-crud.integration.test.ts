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

d('GET /api/menu-categories (integration)', () => {
  beforeEach(async () => {
    await truncateTables();
  });

  afterAll(async () => {
    await truncateTables();
  });

  it('returns empty array when no categories are seeded', async () => {
    const app = await getApp();
    const res = await request(app).get('/api/menu-categories');
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  it('returns rows ordered by display_order when present', async () => {
    const app = await getApp();
    const cookie = await login(app);

    // Insert directly to skip the seed check.
    const { db } = await import('../db/client.js');
    const { menuCategories } = await import('../db/schema.js');
    await db.insert(menuCategories).values([
      {
        id: 'soft_drinks',
        nameEs: 'Soft',
        nameEn: 'Soft',
        displayOrder: 3,
        active: true
      },
      {
        id: 'hot_drinks',
        nameEs: 'Calientes',
        nameEn: 'Hot',
        displayOrder: 1,
        active: true
      },
      {
        id: 'frappes',
        nameEs: 'Frappes',
        nameEn: 'Frappes',
        displayOrder: 2,
        active: true
      }
    ] as never);

    const res = await request(app).get('/api/menu-categories');
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(3);
    expect(res.body.map((r: { id: string }) => r.id)).toEqual([
      'hot_drinks',
      'frappes',
      'soft_drinks'
    ]);
    expect(cookie).toBeDefined(); // login() must run before this branch even if not asserted
  });
});

d('POST /api/admin/menu-categories (integration)', () => {
  beforeEach(async () => {
    await truncateTables();
  });

  afterAll(async () => {
    await truncateTables();
  });

  it('creates a category and returns 201', async () => {
    const app = await getApp();
    const cookie = await login(app);
    const res = await request(app)
      .post('/api/admin/menu-categories')
      .set('Cookie', cookie)
      .send({
        id: 'specialty_tea',
        name: { es: 'Tés Especiales', en: 'Specialty Teas' },
        displayOrder: 4
      });
    expect(res.status).toBe(201);
    expect(res.body.id).toBe('specialty_tea');
    expect(res.body.nameEs).toBe('Tés Especiales');
    expect(res.body.nameEn).toBe('Specialty Teas');
    expect(res.body.displayOrder).toBe(4);
    expect(res.body.active).toBe(true);
  });

  it('returns 409 when the id already exists', async () => {
    const app = await getApp();
    const cookie = await login(app);
    await request(app)
      .post('/api/admin/menu-categories')
      .set('Cookie', cookie)
      .send({
        id: 'specialty_tea',
        name: { es: 'Tés', en: 'Teas' },
        displayOrder: 1
      });
    const res = await request(app)
      .post('/api/admin/menu-categories')
      .set('Cookie', cookie)
      .send({
        id: 'specialty_tea',
        name: { es: 'Tés 2', en: 'Teas 2' },
        displayOrder: 2
      });
    expect(res.status).toBe(409);
    expect(res.body).toEqual({ error: 'Menu category id already exists' });
  });
});

d('DELETE /api/admin/menu-categories/:id (integration)', () => {
  beforeEach(async () => {
    await truncateTables();
  });

  afterAll(async () => {
    await truncateTables();
  });

  it('returns 409 + count when items reference the category and soft-deletes', async () => {
    const app = await getApp();
    const cookie = await login(app);

    // Seed a category and 2 menu items referencing it.
    const { db } = await import('../db/client.js');
    const { menuCategories, menuItems } = await import('../db/schema.js');
    await db.insert(menuCategories).values({
      id: 'hot_drinks',
      nameEs: 'Calientes',
      nameEn: 'Hot',
      displayOrder: 1,
      active: true
    } as never);
    await db.insert(menuItems).values([
      {
        id: 'esp',
        nameEs: 'Espresso',
        nameEn: 'Espresso',
        price: '1.60',
        category: 'hot_drinks',
        active: true
      },
      {
        id: 'cap',
        nameEs: 'Capuccino',
        nameEn: 'Cappuccino',
        price: '2.60',
        category: 'hot_drinks',
        active: true
      }
    ] as never);

    const res = await request(app)
      .delete('/api/admin/menu-categories/hot_drinks')
      .set('Cookie', cookie);
    expect(res.status).toBe(409);
    expect(res.body).toEqual({ error: '2 items use this category' });

    // Row should still exist but be marked inactive.
    const after = await db
      .select()
      .from(menuCategories)
      .where((await import('drizzle-orm')).eq(menuCategories.id, 'hot_drinks'))
      .limit(1);
    expect(after).toHaveLength(1);
    expect(after[0]!.active).toBe(false);
  });

  it('returns 204 when no items reference the category (hard delete)', async () => {
    const app = await getApp();
    const cookie = await login(app);
    const { db } = await import('../db/client.js');
    const { menuCategories } = await import('../db/schema.js');
    await db.insert(menuCategories).values({
      id: 'specialty_tea',
      nameEs: 'Tés',
      nameEn: 'Teas',
      displayOrder: 1,
      active: true
    } as never);

    const res = await request(app)
      .delete('/api/admin/menu-categories/specialty_tea')
      .set('Cookie', cookie);
    expect(res.status).toBe(204);

    const { eq } = await import('drizzle-orm');
    const after = await db
      .select()
      .from(menuCategories)
      .where(eq(menuCategories.id, 'specialty_tea'))
      .limit(1);
    expect(after).toHaveLength(0);
  });
});
