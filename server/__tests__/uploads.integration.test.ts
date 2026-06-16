/**
 * Integration tests for the image upload pipeline (D1) — covers the five
 * acceptance scenarios of the `image-uploads` spec:
 *
 *   1. Valid JPEG → 201 `{url: '/uploads/<uuid>.jpg'}` and file is on disk
 *   2. Oversized upload → 413 with `error: "File too large (max 5 MB)"`
 *   3. Disallowed mime → 415 with `error: "Unsupported file type"`
 *   4. DELETE existing → 204, file removed from disk
 *   5. DELETE missing → 404 with `error: "File not found"`
 *   6. GET /uploads/:filename → 200 with the `Cache-Control: public, max-age=31536000` header
 *
 * The suite uses the supertest request helper and the same `getApp()` /
 * `truncateTables()` plumbing as the other integration suites. It skips
 * gracefully when `TEST_DATABASE_URL` is not set.
 */
import { describe, it, expect, beforeEach, afterAll } from 'vitest';
import request from 'supertest';
import { readdir, unlink, stat } from 'node:fs/promises';
import { hasTestDatabase, getApp, truncateTables } from './setup.js';
import { UPLOADS_DIR } from '../lib/uploads.js';

const d = hasTestDatabase ? describe : describe.skip;

// Minimal 1×1 pixel JPEG. Generated once and reused across all test cases
// to keep the suite fast and hermetic.
const TINY_JPEG = Buffer.from(
  '/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAAEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEB/9sAQwEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEB/8AAEQgAAQABAwEiAAIRAQMRAf/EAB8AAAEFAQEBAQEBAAAAAAAAAAABAgMEBQYHCAkKC//EALUQAAIBAwMCBAMFBQQEAAABfQECAwAEEQUSITFBBhNRYQcicRQygZGhCCNCscEVUtHwJDNicoIJChYXGBkaJSYnKCkqNDU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6g4SFhoeIiYqSk5SVlpeYmZqio6Slpqeoqaqys7S1tre4ubrCw8TFxsfIycrS09TV1tfY2drh4uPk5ebn6Onq8fLz9PX29/j5+v/EAB8BAAMBAQEBAQEBAQEAAAAAAAABAgMEBQYHCAkKC//EALURAAIBAgQEAwQHBQQEAAECdwABAgMRBAUhMQYSQVEHYXETIjKBCBRCkaGxwQkjM1LwFWJy0QoWJDThJfEXGBkaJicoKSo1Njc4OTpDREVGR0hJSlNUVVZXWFlaY2RlZmdoaWpzdHV2d3h5eoKDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uLj5OXm5+jp6vLz9PX29/j5+v/aAAwDAQACEQMRAD8A/v4ooooA/9k=',
  'base64'
);

async function listUploads(): Promise<string[]> {
  try {
    return await readdir(UPLOADS_DIR);
  } catch {
    return [];
  }
}

d('Image upload pipeline (integration)', () => {
  beforeEach(async () => {
    await truncateTables();
    // Clean any leftover upload files from previous runs.
    const files = await listUploads();
    await Promise.all(
      files.filter((f) => f !== '.gitkeep').map((f) => unlink(`${UPLOADS_DIR}/${f}`))
    );
  });

  afterAll(async () => {
    const files = await listUploads();
    await Promise.all(
      files.filter((f) => f !== '.gitkeep').map((f) => unlink(`${UPLOADS_DIR}/${f}`))
    );
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

  it('valid JPEG upload returns 201 with /uploads/<uuid>.jpg and writes the file', async () => {
    const app = await getApp();
    const cookie = await login();

    const res = await request(app)
      .post('/api/admin/uploads')
      .set('Cookie', cookie)
      .attach('file', TINY_JPEG, { filename: 'tiny.jpg', contentType: 'image/jpeg' });

    expect(res.status).toBe(201);
    expect(res.body.url).toMatch(/^\/uploads\/[0-9a-f-]{36}\.jpg$/);
    const filename = res.body.url.replace('/uploads/', '');
    const onDisk = `${UPLOADS_DIR}/${filename}`;
    const info = await stat(onDisk);
    expect(info.isFile()).toBe(true);
    expect(info.size).toBe(TINY_JPEG.length);
  });

  it('oversized upload (>5 MB) returns 413', async () => {
    const app = await getApp();
    const cookie = await login();

    // 6 MB buffer of zeros — multer's fileSize limit fires before parsing
    // finishes, so the contents are irrelevant.
    const oversize = Buffer.alloc(6 * 1024 * 1024, 0);

    const res = await request(app)
      .post('/api/admin/uploads')
      .set('Cookie', cookie)
      .attach('file', oversize, { filename: 'big.jpg', contentType: 'image/jpeg' });

    expect(res.status).toBe(413);
    expect(res.body).toEqual({ error: 'File too large (max 5 MB)' });
  });

  it('disallowed mime (application/pdf) returns 415', async () => {
    const app = await getApp();
    const cookie = await login();

    const res = await request(app)
      .post('/api/admin/uploads')
      .set('Cookie', cookie)
      .attach('file', Buffer.from('%PDF-1.4 fake'), {
        filename: 'doc.pdf',
        contentType: 'application/pdf'
      });

    expect(res.status).toBe(415);
    expect(res.body).toEqual({ error: 'Unsupported file type' });
  });

  it('upload without admin session returns 401', async () => {
    const app = await getApp();
    const res = await request(app)
      .post('/api/admin/uploads')
      .attach('file', TINY_JPEG, { filename: 'tiny.jpg', contentType: 'image/jpeg' });
    expect(res.status).toBe(401);
  });

  it('DELETE existing file returns 204 and removes the file from disk', async () => {
    const app = await getApp();
    const cookie = await login();

    // Upload first
    const upload = await request(app)
      .post('/api/admin/uploads')
      .set('Cookie', cookie)
      .attach('file', TINY_JPEG, { filename: 'tiny.jpg', contentType: 'image/jpeg' });
    const filename = upload.body.url.replace('/uploads/', '');

    const del = await request(app)
      .delete(`/api/admin/uploads/${filename}`)
      .set('Cookie', cookie);
    expect(del.status).toBe(204);

    // The file should be gone.
    await expect(stat(`${UPLOADS_DIR}/${filename}`)).rejects.toThrow();
  });

  it('DELETE missing file returns 404', async () => {
    const app = await getApp();
    const cookie = await login();

    const res = await request(app)
      .delete('/api/admin/uploads/ghost-uuid.jpg')
      .set('Cookie', cookie);
    expect(res.status).toBe(404);
    expect(res.body).toEqual({ error: 'File not found' });
  });

  it('GET /uploads/:filename serves the file with a 1-year cache header', async () => {
    const app = await getApp();
    const cookie = await login();

    const upload = await request(app)
      .post('/api/admin/uploads')
      .set('Cookie', cookie)
      .attach('file', TINY_JPEG, { filename: 'tiny.jpg', contentType: 'image/jpeg' });
    const filename = upload.body.url.replace('/uploads/', '');

    const res = await request(app).get(`/uploads/${filename}`);
    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toMatch(/^image\/(jpeg|jpg)/);
    expect(res.headers['cache-control']).toMatch(/public/);
    expect(res.headers['cache-control']).toMatch(/max-age=31536000/);
  });

  it('GET /uploads/<missing> returns a JSON 404', async () => {
    const app = await getApp();
    const res = await request(app).get('/uploads/totally-missing.jpg');
    expect(res.status).toBe(404);
    expect(res.body).toEqual({ error: 'File not found' });
  });
});
