/**
 * Server integration test setup.
 *
 * The `server:integration` vitest project points its `setupFiles` at this
 * module. It:
 *   1. Reads `TEST_DATABASE_URL` (required).
 *   2. Pins the runtime to a known `ADMIN_PASSWORDS` so the login tests are
 *      deterministic.
 *   3. Re-exports `hasTestDatabase` so individual suites can `.skipIf(!…)`.
 *   4. Lazily imports the express app so the database client picks up the
 *      test connection string (it is read at module init time).
 *   5. Exposes `truncateTables` so each test starts from a clean state.
 */
import { config } from 'dotenv';
import type { Express } from 'express';

config();

const testUrl = process.env.TEST_DATABASE_URL;
export const hasTestDatabase = Boolean(testUrl);

if (hasTestDatabase) {
  // The server's `db/client.ts` reads DATABASE_URL at import time, so
  // we have to override it before the app module is loaded.
  process.env.DATABASE_URL = testUrl;
}

process.env.ADMIN_PASSWORDS = 'testpass';
process.env.NODE_ENV = 'test';

let cachedApp: Express | undefined;

/**
 * Returns the express app, importing it lazily so the DATABASE_URL
 * override above is in place when the DB client initializes.
 */
export async function getApp(): Promise<Express> {
  if (!hasTestDatabase) {
    throw new Error(
      'TEST_DATABASE_URL is not set — integration tests cannot run.'
    );
  }
  if (!cachedApp) {
    const mod = await import('../app.js');
    cachedApp = mod.app as unknown as Express;
  }
  return cachedApp;
}

/**
 * Truncates the tables touched by the integration suite. Call this
 * inside `beforeEach` to keep tests isolated.
 */
export async function truncateTables(): Promise<void> {
  if (!hasTestDatabase) return;
  const { db } = await import('../db/client.js');
  const {
    adminSessions,
    menuItems,
    tables,
    reservations,
    businessConfig,
    menuCategories,
    tableAreas
  } = await import('../db/schema.js');
  // Order matters: tables are referenced by reservations.
  await db.delete(reservations);
  await db.delete(tables);
  await db.delete(menuItems);
  await db.delete(businessConfig);
  await db.delete(menuCategories);
  await db.delete(tableAreas);
  await db.delete(adminSessions);
}
