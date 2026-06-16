import { eq } from 'drizzle-orm';
import { unlink } from 'node:fs/promises';
import { resolve, basename, extname } from 'node:path';
import { db } from '../db/client.js';
import { tables, reservations, businessConfig, menuItems, adminSessions } from '../db/schema.js';
import {
  createTableSchema,
  updateTableSchema,
  updateBusinessConfigSchema,
  updateReservationStatusSchema,
  adminLoginSchema,
  createMenuItemSchema
} from '../lib/validation.js';
import { requireAdmin, SESSION_COOKIE } from '../lib/auth.js';
import { uploadSingle, UPLOADS_DIR, ALLOWED_MIME_TYPES } from '../lib/uploads.js';
import { Router, type Request, type Response, type NextFunction } from 'express';
import { randomUUID } from 'crypto';

const router = Router();

const COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: 'lax' as const,
  secure: process.env.NODE_ENV === 'production'
};
const SESSION_MAX_AGE_MS = 24 * 60 * 60 * 1000; // 24 hours

function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>
) {
  return (req: Request, res: Response, next: NextFunction) => {
    fn(req, res, next).catch(next);
  };
}

// ─── Public auth endpoints (no session required) ──────────────────────────────

router.post(
  '/login',
  asyncHandler(async (req, res) => {
    const parsed = adminLoginSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: 'password is required' });
      return;
    }

    const passwords = (process.env.ADMIN_PASSWORDS ?? '').split(',').map((p) => p.trim());
    if (!passwords.includes(parsed.data.password)) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    const token = randomUUID();
    const expiresAt = new Date(Date.now() + SESSION_MAX_AGE_MS);

    await db.insert(adminSessions).values({ token, expiresAt });

    res.cookie(SESSION_COOKIE, token, {
      ...COOKIE_OPTIONS,
      maxAge: SESSION_MAX_AGE_MS
    });

    res.json({ ok: true, expiresAt: expiresAt.toISOString() });
  })
);

router.post(
  '/logout',
  asyncHandler(async (req, res) => {
    const token = req.cookies?.[SESSION_COOKIE];
    if (token) {
      await db.delete(adminSessions).where(eq(adminSessions.token, token));
    }
    res.clearCookie(SESSION_COOKIE, COOKIE_OPTIONS);
    res.json({ ok: true });
  })
);

router.get(
  '/me',
  asyncHandler(async (req, res) => {
    const token = req.cookies?.[SESSION_COOKIE];
    if (!token) {
      res.status(401).json({ authenticated: false });
      return;
    }
    const rows = await db
      .select()
      .from(adminSessions)
      .where(eq(adminSessions.token, token))
      .limit(1);
    if (rows.length === 0) {
      res.status(401).json({ authenticated: false });
      return;
    }
    const session = rows[0];
    if (new Date(session.expiresAt) < new Date()) {
      await db.delete(adminSessions).where(eq(adminSessions.token, token));
      res.status(401).json({ authenticated: false, expired: true });
      return;
    }
    res.json({ authenticated: true, expiresAt: session.expiresAt.toISOString() });
  })
);

// ─── Protected routes (require session) ────────────────────────────────────────

router.use(requireAdmin);

// ─── Image uploads (D1) ───────────────────────────────────────────────────────

// Multer errors flow through `next(err)` and reach the centralized handler in
// `server/app.ts`, which reads `err.status` to return 413/415/400 JSON.
router.post(
  '/uploads',
  uploadSingle('file'),
  asyncHandler(async (req, res) => {
    const file = req.file;
    if (!file) {
      res.status(400).json({ error: 'No file uploaded' });
      return;
    }
    res.status(201).json({ url: `/uploads/${file.filename}` });
  })
);

const SAFE_FILENAME = /^[\w.-]+$/;

router.delete(
  '/uploads/:filename',
  asyncHandler(async (req, res) => {
    const raw = req.params.filename;
    // Strip any path components and the .gitkeep marker so traversal is
    // impossible even if the URL is hand-crafted.
    const filename = basename(raw);
    if (filename !== raw || filename === '.gitkeep' || !SAFE_FILENAME.test(filename)) {
      res.status(400).json({ error: 'Invalid filename' });
      return;
    }
    const filePath = resolve(UPLOADS_DIR, filename);
    if (extname(filePath) === '') {
      res.status(400).json({ error: 'Invalid filename' });
      return;
    }
    try {
      await unlink(filePath);
    } catch (err) {
      const e = err as NodeJS.ErrnoException;
      if (e.code === 'ENOENT') {
        res.status(404).json({ error: 'File not found' });
        return;
      }
      throw err;
    }
    res.status(204).end();
  })
);

// Menu items
router.post(
  '/menu',
  asyncHandler(async (req, res) => {
    const parsed = createMenuItemSchema.safeParse(req.body);
    if (!parsed.success) {
      const issue = parsed.error.issues[0];
      res.status(400).json({ error: issue?.message ?? 'Invalid request body' });
      return;
    }
    const data = parsed.data;
    const existing = await db
      .select({ id: menuItems.id })
      .from(menuItems)
      .where(eq(menuItems.id, data.id))
      .limit(1);
    if (existing.length > 0) {
      res.status(409).json({ error: 'Menu id already exists' });
      return;
    }
    const inserted = await db
      .insert(menuItems)
      .values({
        id: data.id,
        nameEs: data.name.es,
        nameEn: data.name.en,
        descriptionEs: data.description?.es ?? null,
        descriptionEn: data.description?.en ?? null,
        price: String(data.price),
        category: data.category,
        image: data.image ?? null,
        fallbackImage: data.fallbackImage ?? null,
        active: data.active ?? true,
        ingredientsEs: data.ingredients?.es ?? null,
        ingredientsEn: data.ingredients?.en ?? null,
        isSpecial: data.isSpecial ?? false,
        preparationTime: data.preparationTime ?? null
      } as never)
      .returning();
    res.status(201).json(inserted[0]);
  })
);

router.put(
  '/menu/:id',
  asyncHandler(async (req, res) => {
    const body = req.body as Record<string, unknown>;
    const id = req.params.id;
    const update: Record<string, unknown> = { updatedAt: new Date() };
    if (body.nameEs !== undefined) update.nameEs = body.nameEs;
    if (body.nameEn !== undefined) update.nameEn = body.nameEn;
    if (body.descriptionEs !== undefined) update.descriptionEs = body.descriptionEs;
    if (body.descriptionEn !== undefined) update.descriptionEn = body.descriptionEn;
    if (body.price !== undefined) update.price = String(body.price);
    if (body.category !== undefined) update.category = body.category;
    if (body.image !== undefined) update.image = body.image;
    if (body.fallbackImage !== undefined) update.fallbackImage = body.fallbackImage;
    if (body.active !== undefined) update.active = body.active;
    if (body.ingredientsEs !== undefined) update.ingredientsEs = body.ingredientsEs;
    if (body.ingredientsEn !== undefined) update.ingredientsEn = body.ingredientsEn;
    if (body.isSpecial !== undefined) update.isSpecial = body.isSpecial;
    if (body.preparationTime !== undefined) update.preparationTime = body.preparationTime;
    const updated = await db
      .update(menuItems)
      .set(update as never)
      .where(eq(menuItems.id, id))
      .returning();
    if (updated.length === 0) {
      res.status(404).json({ error: 'Menu item not found' });
      return;
    }
    res.json(updated[0]);
  })
);

router.delete(
  '/menu/:id',
  asyncHandler(async (req, res) => {
    const deleted = await db
      .delete(menuItems)
      .where(eq(menuItems.id, req.params.id))
      .returning({ id: menuItems.id });
    if (deleted.length === 0) {
      res.status(404).json({ error: 'Menu item not found' });
      return;
    }
    res.status(204).end();
  })
);

// Tables
router.get(
  '/tables',
  asyncHandler(async (_req, res) => {
    const rows = await db.select().from(tables);
    res.json(rows);
  })
);

router.post(
  '/tables',
  asyncHandler(async (req, res) => {
    const parsed = createTableSchema.safeParse(req.body);
    if (!parsed.success) {
      const issue = parsed.error.issues[0];
      res.status(400).json({ error: issue?.message ?? 'Invalid request body' });
      return;
    }
    const existing = await db
      .select({ id: tables.id })
      .from(tables)
      .where(eq(tables.id, parsed.data.id))
      .limit(1);
    if (existing.length > 0) {
      res.status(409).json({ error: 'Table id already exists' });
      return;
    }
    const inserted = await db
      .insert(tables)
      .values({
        id: parsed.data.id,
        nameEs: parsed.data.name.es,
        nameEn: parsed.data.name.en,
        capacity: parsed.data.capacity,
        area: parsed.data.area,
        minimumConsumption: String(parsed.data.minimumConsumption)
      })
      .returning();
    res.status(201).json(inserted[0]);
  })
);

router.put(
  '/tables/:id',
  asyncHandler(async (req, res) => {
    const parsed = updateTableSchema.safeParse(req.body);
    if (!parsed.success) {
      const issue = parsed.error.issues[0];
      res.status(400).json({ error: issue?.message ?? 'Invalid request body' });
      return;
    }
    const id = req.params.id;
    const update: Record<string, unknown> = { updatedAt: new Date() };
    if (parsed.data.id) update.id = parsed.data.id;
    if (parsed.data.name) {
      update.nameEs = parsed.data.name.es;
      update.nameEn = parsed.data.name.en;
    }
    if (parsed.data.capacity !== undefined) update.capacity = parsed.data.capacity;
    if (parsed.data.area) update.area = parsed.data.area;
    if (parsed.data.minimumConsumption !== undefined) {
      update.minimumConsumption = String(parsed.data.minimumConsumption);
    }
    const updated = await db
      .update(tables)
      .set(update as never)
      .where(eq(tables.id, id))
      .returning();
    if (updated.length === 0) {
      res.status(404).json({ error: 'Table not found' });
      return;
    }
    res.json(updated[0]);
  })
);

router.delete(
  '/tables/:id',
  asyncHandler(async (req, res) => {
    const deleted = await db
      .delete(tables)
      .where(eq(tables.id, req.params.id))
      .returning({ id: tables.id });
    if (deleted.length === 0) {
      res.status(404).json({ error: 'Table not found' });
      return;
    }
    res.status(204).end();
  })
);

// Business config
router.get(
  '/business-config',
  asyncHandler(async (_req, res) => {
    const rows = await db.select().from(businessConfig).where(eq(businessConfig.id, 1));
    if (rows.length === 0) {
      res.json({
        id: 1,
        name: 'Chayka Coffee',
        location: '',
        locationLink: '',
        whatsappNumber: '',
        minPeopleReservation: 1,
        maxPeopleReservation: 10,
        schedules: [],
        timeSlots: []
      });
      return;
    }
    res.json(rows[0]);
  })
);

router.put(
  '/business-config',
  asyncHandler(async (req, res) => {
    const parsed = updateBusinessConfigSchema.safeParse(req.body);
    if (!parsed.success) {
      const issue = parsed.error.issues[0];
      res.status(400).json({ error: issue?.message ?? 'Invalid request body' });
      return;
    }
    const update: Record<string, unknown> = { updatedAt: new Date() };
    if (parsed.data.name !== undefined) update.name = parsed.data.name;
    if (parsed.data.location !== undefined) update.location = parsed.data.location;
    if (parsed.data.locationLink !== undefined) update.locationLink = parsed.data.locationLink;
    if (parsed.data.whatsappNumber !== undefined) update.whatsappNumber = parsed.data.whatsappNumber;
    if (parsed.data.minPeopleReservation !== undefined) {
      update.minPeopleReservation = parsed.data.minPeopleReservation;
    }
    if (parsed.data.maxPeopleReservation !== undefined) {
      update.maxPeopleReservation = parsed.data.maxPeopleReservation;
    }
    if (parsed.data.schedules !== undefined) update.schedules = parsed.data.schedules;
    if (parsed.data.timeSlots !== undefined) update.timeSlots = parsed.data.timeSlots;
    const updated = await db
      .update(businessConfig)
      .set(update as never)
      .where(eq(businessConfig.id, 1))
      .returning();
    if (updated.length === 0) {
      res.status(404).json({ error: 'Business config not found' });
      return;
    }
    res.json(updated[0]);
  })
);

// Reservations (admin view)
router.get(
  '/reservations',
  asyncHandler(async (_req, res) => {
    const rows = await db.select().from(reservations);
    res.json(rows);
  })
);

router.patch(
  '/reservations/:id/status',
  asyncHandler(async (req, res) => {
    const parsed = updateReservationStatusSchema.safeParse(req.body);
    if (!parsed.success) {
      const issue = parsed.error.issues[0];
      res.status(400).json({ error: issue?.message ?? 'Invalid request body' });
      return;
    }
    const updated = await db
      .update(reservations)
      .set({ status: parsed.data.status } as never)
      .where(eq(reservations.id, req.params.id))
      .returning();
    if (updated.length === 0) {
      res.status(404).json({ error: 'Reservation not found' });
      return;
    }
    res.json(updated[0]);
  })
);

export default router;
