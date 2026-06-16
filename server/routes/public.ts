import { eq } from 'drizzle-orm';
import { db } from '../db/client.js';
import { menuItems, tables, reservations, businessConfig } from '../db/schema.js';
import { createReservationSchema } from '../lib/validation.js';
import { generateReservationId } from '../lib/reservation-id.js';
import { Router, type Request, type Response, type NextFunction } from 'express';
import type { InferInsertModel } from 'drizzle-orm';

const router = Router();

/** Wrap async route handlers so thrown errors hit the error middleware. */
function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>
) {
  return (req: Request, res: Response, next: NextFunction) => {
    fn(req, res, next).catch(next);
  };
}

router.get(
  '/menu',
  asyncHandler(async (_req, res) => {
    const rows = await db.select().from(menuItems);
    res.json(rows);
  })
);

router.get(
  '/tables',
  asyncHandler(async (_req, res) => {
    const rows = await db.select().from(tables);
    res.json(rows);
  })
);

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
        timeSlots: [],
        transferQrUrl: null
      });
      return;
    }
    res.json(rows[0]);
  })
);

router.post(
  '/reservations',
  asyncHandler(async (req, res) => {
    const parsed = createReservationSchema.safeParse(req.body);
    if (!parsed.success) {
      const issue = parsed.error.issues[0];
      res.status(400).json({ error: issue?.message ?? 'Invalid request body' });
      return;
    }

    const id = await generateReservationId(async (candidate) => {
      const existing = await db
        .select({ id: reservations.id })
        .from(reservations)
        .where(eq(reservations.id, candidate))
        .limit(1);
      return existing.length > 0;
    });

    const inserted = await db
      .insert(reservations)
      .values({
        id,
        customerName: parsed.data.customerName,
        customerEmail: parsed.data.customerEmail,
        customerPhone: parsed.data.customerPhone,
        date: parsed.data.date,
        timeSlot: parsed.data.timeSlot,
        tableId: parsed.data.tableId,
        area: parsed.data.area,
        guestsCount: parsed.data.guestsCount,
        notes: parsed.data.notes,
        selectedOrderItems: parsed.data.selectedOrderItems
      } as never)
      .returning();

    res.status(201).json(inserted[0]);
  })
);

export default router;
