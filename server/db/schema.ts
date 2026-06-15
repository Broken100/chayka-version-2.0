import { pgTable, text, numeric, boolean, integer, jsonb, timestamp, date, pgEnum } from 'drizzle-orm/pg-core';

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
  createdAt: timestamp('created_at').defaultNow()
});

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
  updatedAt: timestamp('updated_at').defaultNow()
});

export const adminSessions = pgTable('admin_sessions', {
  token: text('token').primaryKey(),
  createdAt: timestamp('created_at').defaultNow(),
  expiresAt: timestamp('expires_at').notNull()
});
