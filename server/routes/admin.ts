import { eq } from 'drizzle-orm';
import { db } from '../db/client.js';
import { tables, reservations, businessConfig, menuItems } from '../db/schema.js';
import {
  createTableSchema,
  updateTableSchema,
  updateBusinessConfigSchema,
  updateReservationStatusSchema
} from '../lib/validation.js';
import { Router, type Request, type Response, type NextFunction } from 'express';

const router = Router();

function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>
) {
  return (req: Request, res: Response, next: NextFunction) => {
    fn(req, res, next).catch(next);
  };
}

// Menu items
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
