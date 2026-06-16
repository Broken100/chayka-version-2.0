# Tasks: admin-polish-and-extras

> **Change**: `admin-polish-and-extras` — 5 force-chained PRs, 7 features (6 ADDED + 1 MODIFIED)
> **Source artifacts**: engram `sdd/admin-polish-and-extras/{proposal,spec,design}` (#399, #400, #402)
> **Locked decisions**: D1 local disk · D2 wa.me only · D3 delete INITIAL_CATEGORIES · D4 2 notification events · D5 staleTime=0
> **Tests gate**: `npm test -- --run` + `npm run build` must stay green per PR; integration suites `.skip` when `TEST_DATABASE_URL` unset

## Review Workload Forecast

| Metric | Value |
|---|---|
| Total lines (sum of PR estimates) | **~2,850** (700 + 700 + 350 + 750 + 350) |
| Largest PR | **PR#4** at ~750 line budget (task list below trends higher, ~950, due to 3 service routes + 2 integration suites) |
| 800-line budget risk | **Low** — all 5 PRs at or below 800 in the user's stated budget; PR#4's actual content may exceed its budget and warrants a re-split check at end of PR#4 |
| Chained PRs recommended | **Yes — force-chained**: `PR#1 ∥ PR#2` → `PR#3 ← PR#2` → `PR#4 ← PR#1` → `PR#5 ← PR#3, PR#4` |
| Decision needed before apply | **No** — D1-D5 locked; D6/D7/D9/D10 inherited from explore; no open questions |

---

## PR#1 — `feat/category-management` (~700 lines)

**Depends on**: —
**Implements**: `category-management` spec (5 req / 12 scenarios) + D3 (delete `INITIAL_CATEGORIES`) + D5 (`useBusinessConfigQuery.staleTime: 0`)
**Surface**: new `menu_categories` + `table_areas` tables, public GETs, admin CRUD, 2 TanStack Query hooks, `CategoryManager` view, integration tests

### Table

| ID | Task | Files | Est. Δ |
|---|---|---|---|
| 1.1 | Add `menuCategories` table to Drizzle schema (`id` PK, `name_es`, `name_en`, `display_order`, `active`, `updated_at`) | `server/db/schema.ts` | 30 |
| 1.2 | Add `tableAreas` table (`id` PK, `name_es`, `name_en`, `description_es`, `description_en`, `display_order`, `active`, `updated_at`) | `server/db/schema.ts` | 35 |
| 1.3 | Add bilingual zod schemas (`createMenuCategorySchema`, `updateMenuCategorySchema`, `createTableAreaSchema`, `updateTableAreaSchema`) | `server/lib/validation.ts` | 50 |
| 1.4 | Seed `menu_categories` (3 rows: `hot_drinks`, `frappes`, `soft_drinks`) and `table_areas` (4 rows, one per existing `tableAreaEnum` value) in seed runner | `server/db/seed.ts` | 40 |
| 1.5 | Add public `GET /api/menu-categories` and `GET /api/table-areas` (ordered by `display_order ASC`) | `server/routes/public.ts` | 40 |
| 1.6 | Add admin CRUD × 2: `POST/PUT/DELETE /api/admin/menu-categories` and `/api/admin/table-areas`; 409 on duplicate id; 409 on soft-delete guard with `{"error":"X items use this category"}`; soft-delete (set `active=false`) when referenced, hard-delete otherwise | `server/routes/admin.ts` | 120 |
| 1.7 | Add `MenuCategory` + `TableAreaRow` types; add `rowToMenuCategory` / `rowToTableArea` mappers | `src/types.ts` | 30 |
| 1.8 | Add `useMenuCategoriesQuery` and `useTableAreasQuery` hooks; set `useBusinessConfigQuery.staleTime: 0` (D5) | `src/lib/queries.ts` | 50 |
| 1.9 | Add CRUD mutations: `useCreateMenuCategory`, `useUpdateMenuCategory`, `useDeleteMenuCategory` (and the 3 table-area twins) | `src/lib/mutations.ts` | 70 |
| 1.10 | Update `MenuManager` to read category dropdown from `useMenuCategoriesQuery` (excludes `active=false`) | `src/components/admin/MenuManager.tsx` | 40 |
| 1.11 | Update `TableSelector` to consume `useTableAreasQuery` (replaces enum) | `src/components/booking/TableSelector.tsx` | 40 |
| 1.12 | Update `MenuSection` to render category chips from query in `display_order` order | `src/components/MenuSection.tsx` | 30 |
| 1.13 | Create `CategoryManager.tsx` view: two ordered tabs ("Menu Categories" / "Table Areas"), Add/Edit/Delete controls, drag-handle re-order, "X items use this" guard prompt | `src/components/admin/CategoryManager.tsx` (NEW) | 100 |
| 1.14 | Wire `CategoryManager` into admin nav in `App.tsx` | `src/App.tsx` | 15 |
| 1.15 | DELETE `INITIAL_CATEGORIES` from `src/data.ts` (D3); grep check `rg INITIAL_CATEGORIES src/` MUST return 0 | `src/data.ts` | 10 |
| 1.16 | Add `categories-crud.integration.test.ts` (skip when `TEST_DATABASE_URL` unset): GET seeded/empty, POST 201/409, DELETE 409 soft-guard, DELETE 204 hard | `server/__tests__/categories-crud.integration.test.ts` (NEW) | 80 |
| 1.17 | Add `categories-queries.test.ts` (mappers + query hook shape) | `src/__tests__/categories-queries.test.ts` (NEW) | 30 |

### Checklist

- [x] 1.1 Add `menuCategories` table to Drizzle schema
- [x] 1.2 Add `tableAreas` table to Drizzle schema
- [x] 1.3 Add bilingual zod schemas for both tables
- [x] 1.4 Seed 3 menu categories + 4 table areas
- [x] 1.5 Add public GET routes for both tables
- [x] 1.6 Add admin CRUD × 2 with 409 guards
- [x] 1.7 Add types + mappers for both tables
- [x] 1.8 Add query hooks + D5 staleTime: 0
- [x] 1.9 Add CRUD mutations for both tables
- [x] 1.10 Wire `MenuManager` category dropdown to query
- [x] 1.11 Wire `TableSelector` to query
- [x] 1.12 Wire `MenuSection` chips to query
- [x] 1.13 Build `CategoryManager` two-tab view
- [x] 1.14 Wire `CategoryManager` into admin nav
- [x] 1.15 Delete `INITIAL_CATEGORIES` from `src/data.ts`
- [x] 1.16 Add categories integration test suite
- [x] 1.17 Add categories-queries unit test

---

## PR#2 — `feat/image-uploads` (~700 lines)

**Depends on**: —
**Implements**: `image-uploads` spec (5 req / 11 scenarios) — D1 (local disk) + D6 (E.164 regex) + D10 (E.164 on `customerPhone`)
**Surface**: multer + `server/uploads/` + `express.static`, admin upload/delete, `MenuManager` picker, tightened E.164

### Table

| ID | Task | Files | Est. Δ |
|---|---|---|---|
| 2.1 | Add `multer` + `@types/multer` to dependencies | `package.json` | 5 |
| 2.2 | Create `server/uploads/.gitkeep`; add `server/uploads/*` (with `!.gitkeep` exception) to `.gitignore` (R11) | `server/uploads/.gitkeep` (NEW), `.gitignore` | 5 |
| 2.3 | Create multer config in `server/lib/uploads.ts`: UUID v4 filenames, 5 MB cap, mime allowlist (`image/jpeg`, `image/png`, `image/webp`) | `server/lib/uploads.ts` (NEW) | 90 |
| 2.4 | Mount `express.static('server/uploads')` at `/uploads/:filename` in `server/index.ts` with 1-year `Cache-Control: public, max-age=31536000`; 404 on missing | `server/index.ts` | 25 |
| 2.5 | Add `POST /api/admin/uploads` (multipart, field `file`; 201 `{url}`; 413 oversize; 415 mime; 401 unauth) | `server/routes/admin.ts` | 70 |
| 2.6 | Add `DELETE /api/admin/uploads/:filename` (204 existing, 404 missing; 401 unauth) | `server/routes/admin.ts` | 40 |
| 2.7 | Tighten `whatsappNumber` zod to `^\+\d{8,15}$` (D6); apply same regex to `customerPhone` in `createReservationSchema` (D10) | `server/lib/validation.ts` | 30 |
| 2.8 | Add `useUploadImage` (FormData, returns URL) and `useDeleteUploadedImage` mutations | `src/lib/mutations.ts` | 60 |
| 2.9 | Update `MenuManager` image field: file input + on-change upload + 96×96 thumbnail + "Remove image" button that calls delete when current URL starts with `/uploads/`; keep legacy absolute URL paste path | `src/components/admin/MenuManager.tsx` | 110 |
| 2.10 | Update `SettingsPanel` WhatsApp input: `type="tel"` + `pattern="^\\+\\d{8,15}$"` | `src/components/admin/SettingsPanel.tsx` | 20 |
| 2.11 | Update `CheckoutForm` customer phone input: `type="tel"` + E.164 pattern | `src/components/booking/CheckoutForm.tsx` | 20 |
| 2.12 | Add `uploads.integration.test.ts` (skip when no `TEST_DATABASE_URL`): valid JPEG 201, oversize 413, mime 415, delete 204/404, static GET 200 with cache header | `server/__tests__/uploads.integration.test.ts` (NEW) | 150 |
| 2.13 | Extend `validation.test.ts` with E.164 accept/reject cases for `whatsappNumber` and `customerPhone` | `server/lib/__tests__/validation.test.ts` | 30 |

### Checklist

- [x] 2.1 Add multer + types to package.json
- [x] 2.2 Create `server/uploads/.gitkeep` + gitignore
- [x] 2.3 Create multer config with UUID + mime + size cap
- [x] 2.4 Mount express.static on `/uploads/:filename`
- [x] 2.5 Add `POST /api/admin/uploads` (201/413/415/401)
- [x] 2.6 Add `DELETE /api/admin/uploads/:filename` (204/404)
- [x] 2.7 Tighten E.164 regex on `whatsappNumber` + `customerPhone`
- [x] 2.8 Add `useUploadImage` / `useDeleteUploadedImage`
- [x] 2.9 Build MenuManager file picker + thumbnail + Remove
- [x] 2.10 SettingsPanel WhatsApp input `type="tel"`
- [x] 2.11 CheckoutForm customer phone input `type="tel"`
- [x] 2.12 Add uploads integration test suite
- [x] 2.13 Extend validation test for E.164

---

## PR#3 — `feat/qr-and-transfer-settings` (~350 lines)

**Depends on**: PR#2 (reuses multer)
**Implements**: `payment-qr` spec (4 req / 9 scenarios)
**Surface**: `transfer_qr_url` column on `business_config`, `POST/DELETE /api/admin/qr`, "Pagos" section in `SettingsPanel`, QR render in `PaymentModal`

### Table

| ID | Task | Files | Est. Δ |
|---|---|---|---|
| 3.1 | Add nullable `transfer_qr_url` text column to `businessConfig` table | `server/db/schema.ts` | 10 |
| 3.2 | Add `POST /api/admin/qr` (reuses multer from PR#2; updates `business_config.transfer_qr_url`; removes previous file from `server/uploads/` when present; 200 `{transfer_qr_url}`; 401 unauth) | `server/routes/admin.ts` | 70 |
| 3.3 | Add `DELETE /api/admin/qr` (removes file, sets column to null; 204; 401 unauth) | `server/routes/admin.ts` | 25 |
| 3.4 | Expose `transfer_qr_url` in `GET /api/business-config` response (null when unset) | `server/routes/public.ts` | 5 |
| 3.5 | Add `useUploadQr` and `useDeleteQr` mutations; extend `BusinessConfigRow` type + mapper with `transfer_qr_url` | `src/lib/queries.ts`, `src/lib/mutations.ts` | 50 |
| 3.6 | Add "Pagos" section to `SettingsPanel`: 200×200 QR preview `<img>`, file picker (calls `useUploadQr`), "Remove QR" button (calls `useDeleteQr`), placeholder rectangle with "Sin QR" / "No QR" when unset | `src/components/admin/SettingsPanel.tsx` | 80 |
| 3.7 | Update `PaymentModal`: render 200×200 `<img src={transfer_qr_url}>` above reference input only when `method === 'transfer'` AND URL is non-empty | `src/components/PaymentModal.tsx` | 40 |
| 3.8 | Add `qr-settings.integration.test.ts` (skip when no `TEST_DATABASE_URL`): first upload persists, re-upload replaces previous file, delete clears to null | `server/__tests__/qr-settings.integration.test.ts` (NEW) | 80 |

### Checklist

- [x] 3.1 Add `transfer_qr_url` column to `businessConfig`
- [x] 3.2 Add `POST /api/admin/qr` with previous-file cleanup
- [x] 3.3 Add `DELETE /api/admin/qr`
- [x] 3.4 Expose `transfer_qr_url` in business-config GET
- [x] 3.5 Add QR upload/delete mutations + row mapper extension
- [x] 3.6 Add "Pagos" section to `SettingsPanel`
- [x] 3.7 Render QR in `PaymentModal` for transfer method
- [x] 3.8 Add QR settings integration test suite

---

## PR#4 — `feat/notifications-and-service-tracking` (~750 lines)

**Depends on**: PR#1
**Implements**: `notifications` spec (5 req / 10 scenarios) + `service-tracking` spec (5 req / 10 scenarios) + D4 (2 events) + D9 (bilingual text)
**Surface**: `notifications` table, `service_status` enum + 3 timestamp cols on `reservations`, notification writes in 2 routes, 2 admin notification routes, 3 service routes, `NotificationHistory` view, "Notificaciones" tab + KPI tile in `AdminPanel`, service badge + 3 buttons in `KanbanBoard`

> **Workload note**: task list below trends higher than the 750-line budget (~950) because PR#4 ships 5 new routes, 2 integration suites, a new component, a tab + KPI, and 3 Kanban actions. Acceptable but worth flagging at the end of PR#4.

### Table

| ID | Task | Files | Est. Δ |
|---|---|---|---|
| 4.1 | Add `serviceStatusEnum` to Drizzle schema: `not_checked_in`, `checked_in`, `in_service`, `completed` (ADD-only migration) | `server/db/schema.ts` | 15 |
| 4.2 | Add `service_status` column (enum, default `not_checked_in`) + 3 nullable timestamp columns (`checked_in_at`, `service_started_at`, `service_completed_at`) on `reservations` | `server/db/schema.ts` | 20 |
| 4.3 | Add `notifications` table (`bigserial` id, `type`, `title_es`/`title_en`, `body_es`/`body_en`, `source_reservation_id`, `dismissed_at`, `created_at`) + index on `created_at DESC` | `server/db/schema.ts` | 50 |
| 4.4 | Add `notificationListQuerySchema` (limit default 50, max 200) | `server/lib/validation.ts` | 15 |
| 4.5 | In `POST /api/reservations` write notification row (type `reservation_created`, bilingual es+en text, `source_reservation_id` set) | `server/routes/public.ts` | 50 |
| 4.6 | In `PATCH /api/admin/reservations/:id/status` write notification row when `old !== new` (type `reservation_status_changed`, body shows `old → new`); no row when unchanged | `server/routes/admin.ts` | 50 |
| 4.7 | Add `GET /api/admin/notifications?limit=` (default 50, ordered `created_at DESC`) + `POST /api/admin/notifications/:id/dismiss` (204/404) | `server/routes/admin.ts` | 50 |
| 4.8 | Add 3 service routes: `POST /api/admin/reservations/:id/checkin`, `/start-service`, `/complete-service`; each transitions `service_status` and stamps the corresponding timestamp; 200/404/409 invalid transition | `server/routes/admin.ts` | 100 |
| 4.9 | Add `ServiceStatus` and `Notification` types; extend `Reservation` with `serviceStatus` + 3 timestamps | `src/types.ts` | 30 |
| 4.10 | Add `useNotificationsQuery`; extend `ReservationRow` + mapper; expose in-service count helper | `src/lib/queries.ts` | 50 |
| 4.11 | Add `useDismissNotification`, `useCheckIn`, `useStartService`, `useCompleteService` mutations | `src/lib/mutations.ts` | 50 |
| 4.12 | Create `NotificationHistory.tsx`: list rows, filled dot when `dismissed_at IS NULL`, relative timestamp, localized title/body, "Dismiss" button with fade on success | `src/components/admin/NotificationHistory.tsx` (NEW) | 100 |
| 4.13 | Add "Notificaciones" tab + "Currently In Service" KPI tile (count of `service_status = 'in_service'`) to `AdminPanel` | `src/components/admin/AdminPanel.tsx` | 60 |
| 4.14 | Add service badge to each `KanbanBoard` card (4 colors: gray/blue/amber/emerald) + 3 action buttons ("Check In" / "Start Service" / "Complete Service"); disable buttons when transition invalid | `src/components/admin/KanbanBoard.tsx` | 100 |
| 4.15 | Add `notifications.integration.test.ts` (skip when no `TEST_DATABASE_URL`): POST writes a row, status-change writes when old!==new, no write when unchanged, GET returns 50 DESC, `?limit=10` returns 10, dismiss 204/404 | `server/__tests__/notifications.integration.test.ts` (NEW) | 100 |
| 4.16 | Add `service-tracking.integration.test.ts` (skip when no `TEST_DATABASE_URL`): checkin/start/complete happy paths, 409 on invalid transition, 404 on missing reservation | `server/__tests__/service-tracking.integration.test.ts` (NEW) | 100 |
| 4.17 | Add `notifications-queries.test.ts` (mapper + query hook) | `src/__tests__/notifications-queries.test.ts` (NEW) | 30 |

### Checklist

- [x] 4.1 Add `serviceStatusEnum` (ADD-only)
- [x] 4.2 Add `service_status` + 3 timestamp cols on `reservations`
- [x] 4.3 Add `notifications` table + `created_at DESC` index
- [x] 4.4 Add `notificationListQuerySchema` (limit 50/200)
- [x] 4.5 Write notification on `POST /api/reservations`
- [x] 4.6 Write notification on status PATCH (only when changed)
- [x] 4.7 Add admin notifications GET + dismiss POST
- [x] 4.8 Add 3 service routes (checkin/start/complete) with 409
- [x] 4.9 Add `ServiceStatus` + `Notification` types; extend `Reservation`
- [x] 4.10 Add `useNotificationsQuery` + in-service count
- [x] 4.11 Add 4 service/notification mutations
- [x] 4.12 Build `NotificationHistory` view
- [x] 4.13 Add "Notificaciones" tab + "In Service" KPI to `AdminPanel`
- [x] 4.14 Add service badge + 3 buttons to `KanbanBoard`
- [x] 4.15 Add notifications integration test suite
- [x] 4.16 Add service-tracking integration test suite
- [x] 4.17 Add notifications-queries unit test

> **PR#4 actual size: 1279 insertions, 52 deletions (15 files) ≈ 1331 net lines — 66% over the 800-line review budget.** Documented as a size:exception in the PR body. PR#1 took the same exception; the chain is force-chained so a mid-chain base change would re-open PR#5.

---

## PR#5 — `feat/whatsapp-auto-send-and-wa-fallback` (~350 lines)

**Depends on**: PR#3, PR#4
**Implements**: `whatsapp-link-generation` spec (5 req / 9 scenarios) — D2 (wa.me only, no Cloud API, no env vars)
**Surface**: pure client `wa.me/<digits>?text=` URL builder, primary "Enviar a WhatsApp" CTA in `StepSummary`, "Reenviar WhatsApp" button on Kanban cards, no server changes

### Table

| ID | Task | Files | Est. Δ |
|---|---|---|---|
| 5.1 | Create `buildWhatsAppMessage({paymentMethod, language, reservation})` in `src/lib/whatsapp.ts`: 3 templates × 2 langs (card/cash/transfer × es/en), `{id}` parameter, default `es` for unknown lang | `src/lib/whatsapp.ts` (NEW) | 80 |
| 5.2 | Add `buildWhatsappUrl(message, whatsappNumber)` in same file: strips all non-digits from number, returns `https://wa.me/<digits>?text=<encoded>` | `src/lib/whatsapp.ts` | 30 |
| 5.3 | Add `useSendWhatsappLink` hook (composes URL + `window.open(_, '_blank')`); no `fetch`/`XMLHttpRequest`/mutation calls | `src/lib/whatsapp.ts` | 20 |
| 5.4 | Update `StepSummary.tsx`: render "Enviar a WhatsApp" as primary `<a target="_blank" rel="noopener noreferrer" href={...}>` using `useSendWhatsappLink`; keep "Copy Receipt" clipboard fallback | `src/components/booking/StepSummary.tsx` | 30 |
| 5.5 | Drop the 80-line `getWhatsAppLink` blob from `BookingSection.tsx`; pass helper down to `StepSummary` | `src/components/booking/BookingSection.tsx` | -10 (deletion) |
| 5.6 | Add "Reenviar WhatsApp" / "Resend WhatsApp" button to each `KanbanBoard` card using `useSendWhatsappLink` | `src/components/admin/KanbanBoard.tsx` | 30 |
| 5.7 | Add small translation keys for the new button label in `src/utils/translations.ts` (es + en) | `src/utils/translations.ts` | 10 |
| 5.8 | Add `whatsapp.test.ts`: 3 templates × 2 langs = 6 message assertions; phone sanitization strips `+`, spaces, dashes; URL well-formedness; default `es` for unknown lang; verifies no `fetch`/`XHR`/mutation calls (static-analysis check) | `src/lib/__tests__/whatsapp.test.ts` (NEW) | 100 |

### Checklist

- [x] 5.1 Build `buildWhatsAppMessage` (3 × 2 templates)
- [x] 5.2 Build `buildWhatsappUrl` (digits-only sanitization)
- [x] 5.3 Add `useSendWhatsappLink` hook (no network)
- [x] 5.4 Render primary "Enviar a WhatsApp" CTA in `StepSummary`
- [x] 5.5 Drop `getWhatsAppLink` blob from `BookingSection`
- [x] 5.6 Add "Reenviar WhatsApp" to each Kanban card
- [x] 5.7 Add translation keys (es + en)
- [x] 5.8 Add `whatsapp.test.ts` unit suite

---

## Implementation Order (force-chained)

```
PR#1 (categories)  ─────────────────────────┐
PR#2 (uploads)     ─────────┐               │
PR#3 (QR)          ─────────┴── PR#2        │
PR#4 (notif+svc)   ──────────────────────────┴── PR#1
PR#5 (wa links)    ─────────────────────────────┴── PR#3, PR#4
```

- **Apply batch 1**: PR#1 + PR#2 in parallel branches (no shared files)
- **Apply batch 2**: PR#3 (after PR#2 merges); PR#4 (after PR#1 merges)
- **Apply batch 3**: PR#5 (after both PR#3 and PR#4 merge)

## Cross-PR invariants

- All 5 PRs MUST keep `npm test -- --run` + `npm run build` green
- All 5 integration suites MUST `.skip` gracefully when `TEST_DATABASE_URL` is unset (per `openspec/config.yaml`)
- Per-PR merge: `git revert -m 1 <merge-sha>` is safe because every migration is ADD-only (no destructive ALTERs)
- Full schema rollback: `DROP TABLE notifications; DROP TYPE service_status; ALTER TABLE reservations DROP COLUMN service_status, checked_in_at, service_started_at, service_completed_at; ALTER TABLE business_config DROP COLUMN transfer_qr_url; DROP TABLE menu_categories; DROP TABLE table_areas;` — all reversible in one migration
- D5 (`useBusinessConfigQuery.staleTime: 0`) lands in PR#1 (task 1.8); the change is one line and independent of the other PRs
- D3 grep check `rg INITIAL_CATEGORIES src/` MUST return 0 before PR#1 merges

## Total task count: 69 tasks across 5 PRs
- PR#1: 17 tasks
- PR#2: 13 tasks
- PR#3: 8 tasks
- PR#4: 17 tasks
- PR#5: 8 tasks

## Next Phase
`sdd-apply` — open one PR at a time, in force-chain order.
