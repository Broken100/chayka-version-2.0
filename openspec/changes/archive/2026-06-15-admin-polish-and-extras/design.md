# Design: admin-polish-and-extras

## Technical Approach

Five force-chained PRs ship 7 features (1 MODIFIED + 6 ADDED) totalling ~2,600 lines. Strategy: keep `INITIAL_CATEGORIES` in `src/data.ts` for `MenuSection` icon fallbacks until PR#1 lands, then delete it (D3). Multer writes to `server/uploads/` mounted via `express.static` (D1). All WhatsApp delivery is client-side `wa.me/...` URL building — no backend, no env vars (D2). Notifications and service-tracking ride on the same PR#4 migration (additive schema, no destructive ALTERs).

PR chain: `PR#1` (categories) ∥ `PR#2` (uploads) → `PR#3` (QR) depends on PR#2; `PR#4` (notif+svc) depends on PR#1; `PR#5` (WA links) depends on PR#3 and PR#4. All ≤ 800 lines.

## Architecture Decisions

| # | Decision | Choice | Tradeoff | Rationale |
|---|---|---|---|---|
| AD-1 | Upload storage | `server/uploads/` + `express.static` | Local disk → no Vercel deploy | D1 locked. Swappable via one file (`server/lib/uploads.ts`) |
| AD-2 | WhatsApp delivery | Pure client `wa.me/<digits>?text=` | Admin must click to send | D2 locked. No env vars, no Cloud API code, no rate limit |
| AD-3 | Categories | DB tables `menu_categories` + `table_areas` | Migration + admin UI | D3 locked. Eliminates `INITIAL_CATEGORIES` from `src/data.ts` |
| AD-4 | Notification scope | 2 events: `reservation_created`, `reservation_status_changed` | No `service_status_changed` event for now | D4 locked. Schema supports adding more later (no enum) |
| AD-5 | Config cache | `useBusinessConfigQuery.staleTime: 0` | More refetches | D5 locked. Config is small; instant edit reflection |
| AD-6 | Upload delete | UUID v4 + mime allowlist + 5 MB cap | No resumable uploads | Single file per request, matches admin scale (~30 products) |
| AD-7 | Notification text | Bilingual (es + en) rows | 2× storage | D9 inherited. Lets UI pick per-language without re-render |
| AD-8 | Category delete | Soft-delete when items reference, hard otherwise; 409 guard | UI must show count | D7 inherited. Matches MenuManager UX |
| AD-9 | Schema migration | Drizzle `ALTER TABLE` + `pgEnum` ADD only | No destructive enums | R5 — `service_status` is a new enum; `table_area` stays |
| AD-10 | QR route | New `POST/DELETE /api/admin/qr` reuses multer + cleanup | One extra endpoint | Centralizes QR file lifecycle (delete previous on re-upload) |

## Data Flow

```
PR#1 — categories read
  GET /api/menu-categories  ──→  useMenuCategoriesQuery  ──→  MenuSection, MenuManager
  GET /api/table-areas      ──→  useTableAreasQuery      ──→  TableSelector, App

PR#2 — upload
  File picker  ──→  useUploadImage  ──→  POST /api/admin/uploads (multer)  ──→  /uploads/<uuid>.<ext>
  Remove btn   ──→  useDeleteUploadedImage  ──→  DELETE /api/admin/uploads/:filename
                                                                │
  server/index.ts mounts:  app.use('/uploads', express.static('server/uploads', { maxAge: '1y' }))

PR#3 — QR
  SettingsPanel  ──→  POST /api/admin/qr (multer)  ──→  business_config.transfer_qr_url
                                deletes old file from server/uploads/
  PaymentModal reads businessConfig.transfer_qr_url  ──→  renders <img> if method==='transfer'

PR#4 — notifications + service
  POST /api/reservations  ──→  insert reservation  ──→  insert notification (type=reservation_created)
  PATCH /api/admin/reservations/:id/status
      │  (when status changes)
      └─→  insert notification (type=reservation_status_changed)
  POST /api/admin/reservations/:id/{checkin|start-service|complete-service}
      └─→  update service_status + timestamp

PR#5 — wa.me link
  buildWhatsAppMessage({ paymentMethod, language, reservation })  ──→  string
  buildWhatsappUrl(message, whatsappNumber)  ──→  https://wa.me/<digits>?text=<encoded>
  BookingSection Step 4  ──→  <a target="_blank"> with URL
  KanbanBoard card       ──→  "Reenviar WhatsApp" button with URL
```

## File Changes (cumulative across 5 PRs)

### PR#1 — `feat/category-management` (~700 lines)

| File | Action | Notes |
|---|---|---|
| `server/db/schema.ts` | Modify | +`menuCategories`, +`tableAreas` pg tables |
| `server/db/seed.ts` | Modify | Insert 3 menu categories + 4 table areas on first run |
| `server/lib/validation.ts` | Modify | +`createMenuCategorySchema`, +`createTableAreaSchema` + bilingual payloads |
| `server/routes/public.ts` | Modify | +`GET /api/menu-categories`, +`GET /api/table-areas` |
| `server/routes/admin.ts` | Modify | +CRUD `/api/admin/menu-categories`, +CRUD `/api/admin/table-areas` |
| `src/types.ts` | Modify | +`MenuCategory` (bilingual name+description, displayOrder, active, icon? — no, icon is in MenuSection from a local map), +`TableAreaRow` |
| `src/lib/queries.ts` | Modify | +`useMenuCategoriesQuery`, +`useTableAreasQuery`, +`rowToMenuCategory`, +`rowToTableArea`; `staleTime: 0` for `useBusinessConfigQuery` (D5) |
| `src/lib/mutations.ts` | Modify | +`useCreateMenuCategory`, +`useUpdateMenuCategory`, +`useDeleteMenuCategory` (and table-area variants) |
| `src/components/admin/MenuManager.tsx` | Modify | Drop `INITIAL_CATEGORIES` import; read from `useMenuCategoriesQuery` |
| `src/components/booking/TableSelector.tsx` | Modify | Read area labels from `useTableAreasQuery` (keep enum for `area` field) |
| `src/components/MenuSection.tsx` | Modify | Read categories from query; local icon-name → Lucide map unchanged |
| `src/App.tsx` | Modify | Remove `INITIAL_CATEGORIES` import; pass empty array prop |
| `src/data.ts` | Modify | **Delete** `INITIAL_CATEGORIES` (D3) |
| `server/__tests__/categories-crud.integration.test.ts` | New | Skip without `TEST_DATABASE_URL` |
| `src/__tests__/categories-queries.test.ts` | New | `rowToMenuCategory` mapper |
| `package.json` | Modify | No new deps |
| `openspec/specs/category-management/spec.md` | New (already exists) | Verified |

### PR#2 — `feat/image-uploads` (~700 lines)

| File | Action | Notes |
|---|---|---|
| `package.json` | Modify | +`multer`, +`@types/multer` |
| `.gitignore` | Modify | +`server/uploads/*`, +`!server/uploads/.gitkeep` |
| `server/uploads/.gitkeep` | New | Empty marker so the directory exists in fresh checkouts |
| `server/lib/uploads.ts` | New | `multer.diskStorage` to `server/uploads/`, UUID v4 filename, 5 MB cap, mime allowlist (`jpg/png/webp`) |
| `server/lib/validation.ts` | Modify | Tighten `whatsappNumber` to `^\+\d{8,15}$`; tighten `customerPhone` to same regex (D6/D10) |
| `server/routes/admin.ts` | Modify | +`POST /api/admin/uploads` (multer single file), +`DELETE /api/admin/uploads/:filename` |
| `server/index.ts` (or `app.ts`) | Modify | Mount `app.use('/uploads', express.static('server/uploads', { maxAge: '1y' }))` BEFORE `/api` mount |
| `server/__tests__/` | New | `uploads.integration.test.ts` — happy path, oversize 413, wrong mime 415, delete 204/404 |
| `src/lib/mutations.ts` | Modify | +`useUploadImage` (FormData POST, no JSON), +`useDeleteUploadedImage` |
| `src/components/admin/MenuManager.tsx` | Modify | Image input → file picker; on change call `useUploadImage`; thumbnail 96×96; "Remove" calls `useDeleteUploadedImage`; legacy absolute URL still accepted |
| `src/components/admin/SettingsPanel.tsx` | Modify | WhatsApp input `type="tel"` `pattern="^\+\d{8,15}$"` |
| `src/components/booking/CheckoutForm.tsx` (or wherever phone is collected) | Modify | Phone input same `type="tel"` + `pattern` |
| `src/lib/queries.ts` | Modify | `useBusinessConfigQuery` `staleTime: 0` (D5 — also includes PR#1; safe to land here too) |
| `server/lib/__tests__/validation.test.ts` | Modify | +E.164 reject cases |

### PR#3 — `feat/qr-and-transfer-settings` (~350 lines)

| File | Action | Notes |
|---|---|---|
| `server/db/schema.ts` | Modify | +`transferQrUrl` text nullable on `businessConfig` |
| `server/db/seed.ts` | Modify | No seed value (null by default) |
| `server/routes/admin.ts` | Modify | +`POST /api/admin/qr` (multer single), +`DELETE /api/admin/qr`; on upload, delete previous file and update column |
| `server/lib/validation.ts` | Modify | +`updateBusinessConfigSchema.transferQrUrl` passthrough |
| `server/routes/public.ts` (or `admin.ts`) | Modify | `GET /api/business-config` includes `transfer_qr_url` (Drizzle will return it automatically once column exists) |
| `src/lib/queries.ts` | Modify | `BusinessConfigRow.transferQrUrl: string \| null`; `rowToBusinessConfig` returns it |
| `src/lib/mutations.ts` | Modify | +`useUploadQr`, +`useDeleteQr` (FormData variants) |
| `src/components/admin/SettingsPanel.tsx` | Modify | +"Pagos" section: 200×200 preview, file input → `useUploadQr`, "Remove QR" → `useDeleteQr`; placeholder when null |
| `src/components/PaymentModal.tsx` | Modify | Read `businessConfig.transferQrUrl`; render `<img>` 200×200 above reference input when `method==='transfer' && url` |
| `server/__tests__/qr-settings.integration.test.ts` | New | Upload persists; re-upload deletes old; DELETE nulls column + removes file |

### PR#4 — `feat/notifications-and-service-tracking` (~750 lines)

| File | Action | Notes |
|---|---|---|
| `server/db/schema.ts` | Modify | +`serviceStatusEnum('service_status', [...])`, +3 timestamp cols on `reservations`, +`notifications` pg table |
| `server/db/seed.ts` | Modify | No seed data for new tables |
| `server/lib/validation.ts` | Modify | +`notificationListQuerySchema` (limit: z.coerce.number().int().min(1).max(200).default(50)), +no body for dismiss route |
| `server/routes/public.ts` | Modify | `POST /api/reservations` after insert: `db.insert(notifications).values({ type: 'reservation_created', title_es, title_en, body_es, body_en, source_reservation_id: id })` |
| `server/routes/admin.ts` | Modify | `PATCH /api/admin/reservations/:id/status` writes `reservation_status_changed` only if `old !== new`; +`GET /api/admin/notifications?limit=`; +`POST /api/admin/notifications/:id/dismiss`; +3 service routes (checkin / start / complete) with transition validation → 409 |
| `src/types.ts` | Modify | +`ServiceStatus` union, +`Notification` interface, +extend `Reservation` with `serviceStatus`, `checkedInAt`, `serviceStartedAt`, `serviceCompletedAt` |
| `src/lib/queries.ts` | Modify | +`useNotificationsQuery` (key `['notifications']`, `staleTime: 0`); extend `ReservationRow` |
| `src/lib/mutations.ts` | Modify | +`useDismissNotification`, +`useCheckIn` / `useStartService` / `useCompleteService` |
| `src/components/admin/AdminPanel.tsx` | Modify | +"Notificaciones" tab; +"Currently In Service" KPI tile (count where `serviceStatus === 'in_service'`) |
| `src/components/admin/NotificationHistory.tsx` | New | List rows, unread dot, dismiss button, relative timestamps; filter chips (All / Unread) |
| `src/components/admin/KanbanBoard.tsx` | Modify | Service badge per card; 3 action buttons (Check In / Start / Complete) with disabled logic by current `serviceStatus` |
| `server/__tests__/notifications.integration.test.ts` | New | POST → notification row, status change → row, unchanged → no row, dismiss 204/404 |
| `server/__tests__/service-tracking.integration.test.ts` | New | All 3 transitions; 409 on invalid |
| `src/__tests__/notifications-queries.test.ts` | New | row mappers |

### PR#5 — `feat/whatsapp-auto-send-and-wa-fallback` (~350 lines)

| File | Action | Notes |
|---|---|---|
| `src/lib/whatsapp.ts` | New | `buildWhatsAppMessage({ paymentMethod, language, reservation }): string`; `buildWhatsappUrl(message, whatsappNumber): string` (sanitizes digits, encodes text) |
| `src/lib/__tests__/whatsapp.test.ts` | New | All 6 templates; digit sanitization; URL escaping |
| `src/components/booking/StepSummary.tsx` | Modify | Replace existing `getWhatsAppLink` prop with `buildWhatsappUrl(buildWhatsAppMessage(...), businessConfig.whatsappNumber)`; primary "Enviar a WhatsApp" anchor uses helper |
| `src/components/BookingSection.tsx` | Modify | Drop the local 80-line `getWhatsAppLink` blob; use the helper |
| `src/components/admin/KanbanBoard.tsx` | Modify | +"Reenviar WhatsApp" button per card using helper + card's payment method |
| `src/utils/translations.ts` | Modify | +keys for `whatsapp.send`, `whatsapp.resend` (small) |
| `package.json` | Modify | No new deps |

## API Surface (cumulative)

| Method | Path | Auth | Zod schema | Success | Errors |
|---|---|---|---|---|---|
| GET | `/api/menu-categories` | public | — | 200 rows ordered | — |
| GET | `/api/table-areas` | public | — | 200 rows ordered | — |
| POST | `/api/admin/menu-categories` | session | `createMenuCategorySchema` | 201 row | 400 / 409 |
| PUT | `/api/admin/menu-categories/:id` | session | `updateMenuCategorySchema` | 200 row | 400 / 404 |
| DELETE | `/api/admin/menu-categories/:id` | session | — | 204 (hard) or 409 (soft guard) | 404 |
| POST | `/api/admin/table-areas` | session | `createTableAreaSchema` | 201 row | 400 / 409 |
| PUT | `/api/admin/table-areas/:id` | session | `updateTableAreaSchema` | 200 row | 400 / 404 |
| DELETE | `/api/admin/table-areas/:id` | session | — | 204 (hard) or 409 (soft) | 404 |
| POST | `/api/admin/uploads` | session | multer `file` | 201 `{ url }` | 413 / 415 / 401 |
| DELETE | `/api/admin/uploads/:filename` | session | — | 204 | 404 |
| GET | `/uploads/:filename` | public | express.static | 200 | 404 |
| POST | `/api/admin/qr` | session | multer `file` | 200 `{ transfer_qr_url }` | 413 / 415 / 401 |
| DELETE | `/api/admin/qr` | session | — | 204 | — |
| GET | `/api/admin/notifications?limit=` | session | query limit | 200 rows | 400 if limit out of range |
| POST | `/api/admin/notifications/:id/dismiss` | session | — | 204 | 404 |
| POST | `/api/admin/reservations/:id/checkin` | session | — | 200 reservation | 404 / 409 |
| POST | `/api/admin/reservations/:id/start-service` | session | — | 200 reservation | 404 / 409 |
| POST | `/api/admin/reservations/:id/complete-service` | session | — | 200 reservation | 404 / 409 |

## Interfaces / Contracts

```ts
// server/db/schema.ts (additive)
export const serviceStatusEnum = pgEnum('service_status', [
  'not_checked_in', 'checked_in', 'in_service', 'completed'
]);

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

export const notifications = pgTable('notifications', {
  id: bigserial('id', { mode: 'number' }).primaryKey(),
  type: text('type').notNull(), // 'reservation_created' | 'reservation_status_changed'
  titleEs: text('title_es').notNull(),
  titleEn: text('title_en').notNull(),
  bodyEs: text('body_es').notNull(),
  bodyEn: text('body_en').notNull(),
  sourceReservationId: text('source_reservation_id'),
  dismissedAt: timestamp('dismissed_at'),
  createdAt: timestamp('created_at').notNull().defaultNow()
});

// reservations: add
serviceStatus: serviceStatusEnum('service_status').notNull().default('not_checked_in'),
checkedInAt: timestamp('checked_in_at'),
serviceStartedAt: timestamp('service_started_at'),
serviceCompletedAt: timestamp('service_completed_at'),

// business_config: add
transferQrUrl: text('transfer_qr_url'),
```

```ts
// src/lib/whatsapp.ts (PR#5)
export function buildWhatsAppMessage(args: {
  paymentMethod: 'card' | 'transfer' | 'cash';
  language: 'es' | 'en';
  reservation: { id: string };
}): string;
export function buildWhatsappUrl(message: string, whatsappNumber: string): string;
// Returns: https://wa.me/<digits-only>?text=<encoded>
// Strips all non-digits from the number; the input is E.164-validated upstream.
```

## Testing Strategy

| Layer | What | How |
|---|---|---|
| Unit (server) | `validation.ts` E.164, QR schema, notification body builders | `server/lib/__tests__/validation.test.ts` (extend) |
| Unit (client) | `rowToMenuCategory`, `rowToTableArea`, `buildWhatsAppMessage`, `buildWhatsappUrl` | `src/__tests__/categories-queries.test.ts`, `src/lib/__tests__/whatsapp.test.ts` |
| Integration | All new admin routes with `TEST_DATABASE_URL` | `server/__tests__/*.integration.test.ts` per PR; skip when env unset |
| E2E (manual) | D5 staleTime=0: admin edits WhatsApp, BookingSection wa.me updates | Manual smoke |
| E2E (manual) | PR#3: upload QR, choose transfer in PaymentModal, see image | Manual smoke |
| E2E (manual) | PR#4: book → notification row, change status → notification row | Manual smoke |

Each PR's `npm test -- --run` must stay green. Build (`npm run build`) must stay clean.

## Migration / Rollout

Drizzle `ALTER TABLE` migrations are additive:

- PR#1: `CREATE TABLE menu_categories`, `CREATE TABLE table_areas`
- PR#2: none (no schema change)
- PR#3: `ALTER TABLE business_config ADD COLUMN transfer_qr_url text`
- PR#4: `CREATE TYPE service_status AS ENUM (...)`, `ALTER TABLE reservations ADD COLUMN ...`, `CREATE TABLE notifications`
- PR#5: none

Rollback per PR is a `git revert` of the merge commit. The PR#4 migration is fully additive — Drizzle generates `IF NOT EXISTS` in raw SQL via the manual SQL block in the migration file. No destructive `ALTER`. Full schema rollback (worst case): `DROP TABLE notifications; DROP TYPE service_status; ALTER TABLE reservations DROP COLUMN ...; ALTER TABLE business_config DROP COLUMN transfer_qr_url; DROP TABLE menu_categories; DROP TABLE table_areas;`.

D3 (`INITIAL_CATEGORIES` delete) happens at the END of PR#1, after all consumers have been migrated. The grep check (`rg INITIAL_CATEGORIES src/`) MUST return 0 before merge.

## Risks

- **R1 / Carryover**: No CSRF on admin routes — out of scope; flag separately
- **R2 / Carryover**: `/api/uploads/*` is enumerable — UUID filenames mitigate; behind admin auth
- **R3 / Carryover**: Menu hard-delete + image orphan — PR#2 cascade-deletes local file in `useDeleteMenuProduct` when `image.startsWith('/uploads/')`
- **R4 / Carryover**: Postgres enum migration — only `service_status` ADD; no `ALTER` of existing
- **R5 / Carryover**: Vercel Blob migration deferred
- **R6 / D5**: `useBusinessConfigQuery.staleTime: 0` — acceptable; config is small, in-memory cache is cheap
- **R7 / D4**: Notification volume under load — `useNotificationsQuery` paginates `limit=50`, index on `(created_at DESC)` via the Drizzle bigserial PK
- **R8 / PR#4**: Reservation type bumps — fully additive; old rows default to `not_checked_in`
- **R9 / D2**: WhatsApp delivery is client-side — mitigated by primary CTA in Step 4 + clipboard fallback already present
- **R10 / PR#2**: Local disk + serverless deploys — `server/uploads/` is ephemeral on Vercel. Acceptable for current deploy target; document in README
- **R11 / PR#2**: `.gitignore` does NOT yet exclude `server/uploads/` — PR#2 MUST add `server/uploads/*` (with `!server/uploads/.gitkeep` keep) to `.gitignore` to avoid committing uploaded files

## Open Questions

None. All 5 locked decisions (D1-D5) inherited from orchestrator preflight. D6/D7/D9/D10 carried from explore, not flagged for re-open.

## Next Phase

`sdd-tasks` — break the 5-PR chain into 30-40 task items, grouped per PR, with hierarchical numbering (1.1, 1.2, …, 2.1, …).
