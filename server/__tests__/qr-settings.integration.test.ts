/**
 * Integration tests for the transfer QR upload/delete pipeline (PR#3).
 *
 * Covers the four acceptance scenarios of the `payment-qr` spec:
 *
 *   1. First upload → 200 `{ transfer_qr_url }`, `business_config.transfer_qr_url`
 *      is set, file is on disk.
 *   2. Re-upload → 200 with a NEW url; the PREVIOUS file is removed from disk.
 *   3. DELETE /api/admin/qr → 204; column is null; file is removed from disk.
 *   4. POST /api/admin/qr without an admin session → 401.
 *
 * Mirrors the `uploads.integration.test.ts` plumbing (supertest + getApp +
 * truncateTables, skip when `TEST_DATABASE_URL` is unset).
 */
import { describe, it, expect, beforeEach, afterAll } from 'vitest';
import request from 'supertest';
import { readdir, stat, unlink } from 'node:fs/promises';
import { hasTestDatabase, getApp, truncateTables } from './setup.js';
import { UPLOADS_DIR } from '../lib/uploads.js';

const d = hasTestDatabase ? describe : describe.skip;

// Minimal 1×1 pixel JPEG (same buffer used in the uploads integration suite).
const TINY_JPEG = Buffer.from(
  '/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAAEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEB/9sAQwEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEB/8AAEQgAAQABAwEiAAIRAQMRAf/EAB8AAAEFAQEBAQEBAAAAAAAAAAABAgMEBQYHCAkKC//EALUQAAIBAwMCBAMFBQQEAAABfQECAwAEEQUSITFBBhNRYQicRQygZGhCCNCscEVUtHwJDNicoIJChYXGBkaJSYnKCkqNDU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6g4SFhoeIiYqSk5SVlpeYmZqio6Slpqeoqaqys7S1tre4ubrCw8TFxsfIycrS09TV1tfY2drh4uPk5ebn6Onq8fLz9PX29/j5+v/EAB8BAAMBAQEBAQEBAQEAAAAAAAABAgMEBQYHCAkKC//EALURAAIBAgQEAwQHBQQEAAECdwABAgMRBAUhMQYSQVEHYXETIjKBCBRCkaGxwQkjM1LwFWJy0QoWJDThJfEXGBkaJicoKSo1Njc4OTpDREVGR0hJSlNUVVZXWFlaY2RlZmdoaWpzdHV2d3h5eoKDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uLj5OXm5+jp6vLz9PX29/j5+v/aAAwDAQACEQMRAD8A/v4ooooA/9k=',
  'base64'
);

async function listUploads(): Promise<string[]> {
  try {
    return await readdir(UPLOADS_DIR);
  } catch {
    return [];
  }
}

async function cleanupUploads() {
  const files = await listUploads();
  await Promise.all(
    files.filter((f) => f !== '.gitkeep').map((f) => unlink(`${UPLOADS_DIR}/${f}`))
  );
}

d('Transfer QR upload/delete (integration)', () => {
  beforeEach(async () => {
    await truncateTables();
    await cleanupUploads();
  });

  afterAll(async () => {
    await cleanupUploads();
  });

  async function login(): Promise<string> {
    const app = await getApp();
    const res = await request(app)
      .post('/api/admin/login')
      .send({ password: 'testpass' })
      .set('Content-Type', 'application/json');
    expect(res.status).toBe(200);
    return res.headers['set-cookie']![0]!;
  }

  it('first upload returns 200 with { transfer_qr_url } and persists the file', async () => {
    const app = await getApp();
    const cookie = await login();

    const res = await request(app)
      .post('/api/admin/qr')
      .set('Cookie', cookie)
      .attach('file', TINY_JPEG, { filename: 'qr.jpg', contentType: 'image/jpeg' });

    expect(res.status).toBe(200);
    expect(res.body.transfer_qr_url).toMatch(/^\/uploads\/[0-9a-f-]{36}\.jpg$/);

    const filename = res.body.transfer_qr_url.replace('/uploads/', '');
    const info = await stat(`${UPLOADS_DIR}/${filename}`);
    expect(info.isFile()).toBe(true);
    expect(info.size).toBe(TINY_JPEG.length);

    // The business_config row reflects the new URL.
    const cfg = await request(app).get('/api/business-config');
    expect(cfg.status).toBe(200);
    expect(cfg.body.transferQrUrl).toBe(res.body.transfer_qr_url);
  });

  it('re-upload replaces the previous file and returns the new url', async () => {
    const app = await getApp();
    const cookie = await login();

    const first = await request(app)
      .post('/api/admin/qr')
      .set('Cookie', cookie)
      .attach('file', TINY_JPEG, { filename: 'qr1.jpg', contentType: 'image/jpeg' });
    expect(first.status).toBe(200);
    const firstFilename = first.body.transfer_qr_url.replace('/uploads/', '');

    const second = await request(app)
      .post('/api/admin/qr')
      .set('Cookie', cookie)
      .attach('file', TINY_JPEG, { filename: 'qr2.jpg', contentType: 'image/jpeg' });
    expect(second.status).toBe(200);
    expect(second.body.transfer_qr_url).not.toBe(first.body.transfer_qr_url);

    const secondFilename = second.body.transfer_qr_url.replace('/uploads/', '');

    // The second file exists on disk.
    const onDisk = await stat(`${UPLOADS_DIR}/${secondFilename}`);
    expect(onDisk.isFile()).toBe(true);

    // The first file has been removed.
    await expect(stat(`${UPLOADS_DIR}/${firstFilename}`)).rejects.toThrow();

    // The column reflects the latest url.
    const cfg = await request(app).get('/api/business-config');
    expect(cfg.body.transferQrUrl).toBe(second.body.transfer_qr_url);
  });

  it('DELETE /api/admin/qr returns 204, nulls the column, and removes the file', async () => {
    const app = await getApp();
    const cookie = await login();

    const upload = await request(app)
      .post('/api/admin/qr')
      .set('Cookie', cookie)
      .attach('file', TINY_JPEG, { filename: 'qr.jpg', contentType: 'image/jpeg' });
    const filename = upload.body.transfer_qr_url.replace('/uploads/', '');

    const del = await request(app).delete('/api/admin/qr').set('Cookie', cookie);
    expect(del.status).toBe(204);

    await expect(stat(`${UPLOADS_DIR}/${filename}`)).rejects.toThrow();

    const cfg = await request(app).get('/api/business-config');
    expect(cfg.body.transferQrUrl).toBeNull();
  });

  it('POST /api/admin/qr without an admin session returns 401', async () => {
    const app = await getApp();
    const res = await request(app)
      .post('/api/admin/qr')
      .attach('file', TINY_JPEG, { filename: 'qr.jpg', contentType: 'image/jpeg' });
    expect(res.status).toBe(401);
  });

  it('DELETE /api/admin/qr without an admin session returns 401', async () => {
    const app = await getApp();
    const res = await request(app).delete('/api/admin/qr');
    expect(res.status).toBe(401);
  });

  it('DELETE /api/admin/qr is idempotent (204 even when no QR is set)', async () => {
    const app = await getApp();
    const cookie = await login();

    const del = await request(app).delete('/api/admin/qr').set('Cookie', cookie);
    expect(del.status).toBe(204);

    const cfg = await request(app).get('/api/business-config');
    expect(cfg.body.transferQrUrl).toBeNull();
  });
});
