import {
  pgTable,
  text,
  numeric,
  boolean,
  integer,
  bigserial,
  jsonb,
  timestamp,
  date,
  pgEnum,
  index
} from 'drizzle-orm/pg-core';

export const tableAreaEnum = pgEnum('table_area', [
  'waterfall_deck',
  'fireplace_cozy',
  'indoor_premium',
  'terrace_panoramic'
]);

export const kanbanStageEnum = pgEnum('kanban_stage', ['pending', 'confirmed', 'cancelled']);

export const paymentStatusEnum = pgEnum('payment_status', [
  'pending',
  'success',
  'failed',
  'simulated_paid',
  'unpaid'
]);

// PR#4: 4-state service lifecycle (orthogonal to kanban `status`).
// not_checked_in → checked_in → in_service → completed (no backward transitions).
export const serviceStatusEnum = pgEnum('service_status', [
  'not_checked_in',
  'checked_in',
  'in_service',
  'completed'
]);

export const menuItems = pgTable('menu_items', {
  id: text('id').primaryKey(),
  nameEs: text('name_es').notNull(),
  nameEn: text('name_en').notNull(),
  descriptionEs: text('description_es'),
  descriptionEn: text('description_en'),
  price: numeric('price', { precision: 10, scale: 2 }).notNull(),
  category: text('category').notNull(),
  image: text('image'),
  fallbackImage: text('fallback_image'),
  active: boolean('active').default(true),
  ingredientsEs: text('ingredients_es').array(),
  ingredientsEn: text('ingredients_en').array(),
  isSpecial: boolean('is_special').default(false),
  preparationTime: integer('preparation_time'),
  updatedAt: timestamp('updated_at').defaultNow()
});

export const tables = pgTable('tables', {
  id: text('id').primaryKey(),
  nameEs: text('name_es').notNull(),
  nameEn: text('name_en').notNull(),
  capacity: integer('capacity').notNull(),
  area: tableAreaEnum('area').notNull(),
  minimumConsumption: numeric('minimum_consumption', { precision: 10, scale: 2 }).notNull(),
  updatedAt: timestamp('updated_at').defaultNow()
});

export const reservations = pgTable('reservations', {
  id: text('id').primaryKey(),
  customerName: text('customer_name').notNull(),
  customerEmail: text('customer_email').notNull(),
  customerPhone: text('customer_phone').notNull(),
  date: date('date').notNull(),
  timeSlot: text('time_slot').notNull(),
  tableId: text('table_id').references(() => tables.id),
  area: tableAreaEnum('area').notNull(),
  guestsCount: integer('guests_count').notNull(),
  status: kanbanStageEnum('status').notNull().default('pending'),
  paymentStatus: paymentStatusEnum('payment_status').notNull().default('pending'),
  paymentReference: text('payment_reference'),
  notes: text('notes'),
  selectedOrderItems: jsonb('selected_order_items'),
  // PR#4: service lifecycle. Defaults to `not_checked_in` so existing rows are valid.
  serviceStatus: serviceStatusEnum('service_status').notNull().default('not_checked_in'),
  checkedInAt: timestamp('checked_in_at'),
  serviceStartedAt: timestamp('service_started_at'),
  serviceCompletedAt: timestamp('service_completed_at'),
  createdAt: timestamp('created_at').defaultNow()
});

// PR#4: persisted notification log. D4: only 2 events fire today
// (reservation_created, reservation_status_changed), but the schema is open.
export const notifications = pgTable(
  'notifications',
  {
    id: bigserial('id', { mode: 'number' }).primaryKey(),
    type: text('type').notNull(),
    titleEs: text('title_es').notNull(),
    titleEn: text('title_en').notNull(),
    bodyEs: text('body_es').notNull(),
    bodyEn: text('body_en').notNull(),
    sourceReservationId: text('source_reservation_id'),
    dismissedAt: timestamp('dismissed_at'),
    createdAt: timestamp('created_at').notNull().defaultNow()
  },
  (table) => ({
    // Admin GET is ordered created_at DESC; index keeps it cheap as the table grows.
    createdAtIdx: index('notifications_created_at_idx').on(table.createdAt.desc())
  })
);

export const businessConfig = pgTable('business_config', {
  id: integer('id').primaryKey().default(1),
  name: text('name'),
  location: text('location'),
  locationLink: text('location_link'),
  whatsappNumber: text('whatsapp_number'),
  minPeopleReservation: integer('min_people_reservation'),
  maxPeopleReservation: integer('max_people_reservation'),
  schedules: jsonb('schedules'),
  timeSlots: text('time_slots').array(),
  transferQrUrl: text('transfer_qr_url'),
  updatedAt: timestamp('updated_at').defaultNow()
});

export const adminSessions = pgTable('admin_sessions', {
  token: text('token').primaryKey(),
  createdAt: timestamp('created_at').defaultNow(),
  expiresAt: timestamp('expires_at').notNull()
});

export const menuCategories = pgTable('menu_categories', {
  id: text('id').primaryKey(),
  nameEs: text('name_es').notNull(),
  nameEn: text('name_en').notNull(),
  displayOrder: integer('display_order').notNull(),
  active: boolean('active').notNull().default(true),
  updatedAt: timestamp('updated_at').defaultNow()
});

export const tableAreas = pgTable('table_areas', {
  id: text('id').primaryKey(),
  nameEs: text('name_es').notNull(),
  nameEn: text('name_en').notNull(),
  descriptionEs: text('description_es'),
  descriptionEn: text('description_en'),
  displayOrder: integer('display_order').notNull(),
  active: boolean('active').notNull().default(true),
  updatedAt: timestamp('updated_at').defaultNow()
});
