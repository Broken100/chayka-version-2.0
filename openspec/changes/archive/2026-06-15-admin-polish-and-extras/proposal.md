# Proposal: admin-polish-and-extras

**What**: Aggregate the 7 new feature requests from explore into one change shipped as 5 force-chained PRs (~2,600 lines total). Adds DB-backed categories/areas, local image uploads, transfer QR settings, notification history, service tracking, and client-side WhatsApp link generation per payment method. WhatsApp Cloud API is explicitly **out** — D2 locks delivery to `wa.me/<number>?text=...`.

**Why**: The current app hardcodes categories in `src/data.ts:16-53`, table areas in a Postgres enum, image URLs as free-text, bank details, and offers no service tracking. The user wants admin CRUD over categories, image uploads, QR-driven bank transfers, notification history, service status, and a cleaner WhatsApp handoff per payment method.

**Where**: engram `sdd/admin-polish-and-extras/proposal` (#TBD) + `openspec/changes/admin-polish-and-extras/proposal.md`. Reads: engram #397 (explore), engram #372 (backend-and-admin spec).

## Locked decisions (D1–D5 — DO NOT re-open)

| # | Decision | Choice |
|---|---|---|
| D1 | Image storage | **Local disk** (`server/uploads/` + `express.static`); swappable to Vercel Blob later via one-file change in `server/lib/uploads.ts` |
| D2 | WhatsApp delivery | **`wa.me/<number>?text=...` only**. No Cloud API, no Twilio, no env vars. Client builds the URL; admin clicks it. |
| D3 | `INITIAL_CATEGORIES` | **Delete in PR#1**. Migrate everything to DB. |
| D4 | Notification events | **2 events**: `reservation_created`, `reservation_status_changed`. (No `service_status_changed` — add in follow-up if needed.) |
| D5 | `useBusinessConfigQuery.staleTime` | **0** for instant reflection after the admin edits WhatsApp number / bank details / QR |

Sub-decisions carried from explore (also locked): D6 strict E.164 on WhatsApp number (`^\+\d{8,15}$`), D7 soft-delete + UI guard for categories, D9 store notification text bilingual (es + en) server-side, D10 enforce E.164 on `customerPhone`.

## Approach — 5 PRs, force-chained

| # | Branch | ~lines | Surface | Depends on |
|---|---|---|---|---|
| 1 | `feat/category-management` | ~700 | New `menu_categories` + `table_areas` tables, public GETs, admin CRUD (POST/PUT/DELETE), `useMenuCategoriesQuery` / `useTableAreasQuery`, `MenuManager` + `TableSelector` + `MenuSection` consume queries, delete `INITIAL_CATEGORIES` from `src/data.ts`, integration tests | — |
| 2 | `feat/image-uploads` | ~700 | `server/lib/uploads.ts` (multer, local disk, UUID filenames, 5 MB cap, mime allowlist), `POST/DELETE /api/admin/uploads`, `useUploadImage` / `useDeleteUploadedImage`, `MenuManager` image picker (replaces text URL with file input + thumbnail + progress), tighten `whatsappNumber` zod regex (D6), `SettingsPanel` input `type="tel"`, integration tests | — |
| 3 | `feat/qr-and-transfer-settings` | ~350 | `transfer_qr_url` column on `business_config`, `POST /api/admin/qr` reuses PR#2 upload pipeline, new "Pagos" section in `SettingsPanel` (file picker + preview + Save), `PaymentModal` renders QR above reference input when method=transfer AND url present, integration tests | PR#2 |
| 4 | `feat/notifications-and-service-tracking` | ~750 | New `notifications` table (bilingual title/message, severity, dismissed_at); `service_status` enum (`not_checked_in` / `checked_in` / `in_service` / `completed`) + 3 timestamp columns on `reservations`; routes: `GET /api/admin/notifications`, `PATCH /api/admin/notifications/:id/dismiss`, `POST /api/admin/reservations/:id/checkin`, `…/start-service`, `…/complete-service`; hooks in `POST /api/reservations` and `PATCH /api/admin/reservations/:id/status` write notification rows; `AdminPanel` "Notifications" tab + "Currently In Service" KPI tile; `NotificationHistory` view; `KanbanBoard` "Service" badge + 3 action buttons per card; integration tests | PR#1 |
| 5 | `feat/whatsapp-auto-send-and-wa-fallback` | ~350 | Pure client-side. `useSendWhatsappLink` helper builds `wa.me/<number>?text=…` per payment method (card / transfer / cash — different message templates, bilingual). `BookingSection` Step 4 surfaces a primary "Enviar a WhatsApp" button + clipboard fallback (already exists, kept). `KanbanBoard` adds "Resend WhatsApp" button per card that copies a fresh `wa.me` link with the reservation summary. **No** Cloud API client, **no** env vars, **no** rate limiter needed (D2 keeps everything client-side). | PR#3, PR#4 |

**Total**: ~2,600 lines. PR#1, #2, #4 are tight (~700-750). All under 800.

### Dependency graph

```
PR#1 (categories)  ─────────────────────────┐
PR#2 (uploads)     ─────────┐               │
PR#3 (QR)          ─────────┴── PR#2        │
PR#4 (notif+svc)   ──────────────────────────┴── PR#1
PR#5 (wa links)    ─────────────────────────────┴── PR#3, PR#4
```

PR#1 and PR#2 are independent (parallel-friendly). PR#3 needs PR#2 (reuses multer). PR#4 needs PR#1 (NotificationHistory dropdown filters by category). PR#5 needs PR#3 (message template includes QR link) and PR#4 (service status in card).

## Capabilities (contract with sdd-spec)

### New Capabilities (5)
- `category-management` — DB-backed menu categories + table areas, public GETs, admin CRUD, replaces `INITIAL_CATEGORIES`
- `image-uploads` — multer + local disk, admin upload/delete, MenuManager picker, hardened WhatsApp zod regex
- `payment-qr` — transfer QR upload (reuses image-uploads), business_config.transfer_qr_url, PaymentModal QR rendering
- `notifications` — notifications table, 2 events (created + status_changed), list/dismiss routes, admin UI tab
- `service-tracking` — service_status enum + reservation columns, checkin/start/complete routes, KanbanBoard service actions, KPI tile
- `whatsapp-link-generation` — per-payment-method message templates (bilingual), client-side wa.me URL builder, KanbanBoard "Resend" + BookingSection primary send button (D2 = no backend, no Cloud API)

### Modified Capabilities
- `backend-and-admin` — add `useBusinessConfigQuery.staleTime: 0` (D5) so admin edits are reflected immediately. One-line MODIFIED requirement.

## Affected Areas

| Area | Impact | Notes |
|---|---|---|
| `server/db/schema.ts` | Modified | +`menu_categories`, +`table_areas`, +`notifications`, +`service_status` enum, +3 reservation timestamp columns, +`business_config.transfer_qr_url` |
| `server/lib/uploads.ts` | New | multer config, UUID filenames, content-type sniffing, 5 MB cap |
| `server/lib/validation.ts` | Modified | tighten `whatsappNumber` + `customerPhone` to E.164; add schemas for category, table-area, notification, service-status, QR |
| `server/routes/admin.ts` | Modified | +CRUD for categories/areas; +upload routes; +QR upload; +notification list/dismiss; +service checkin/start/complete |
| `server/routes/public.ts` | Modified | +`GET /api/menu-categories`, +`GET /api/table-areas`; `POST /api/reservations` writes notification row; `PATCH /api/admin/reservations/:id/status` writes notification row |
| `server/index.ts` | Modified | mount `express.static('server/uploads')` |
| `src/data.ts` | Modified | delete `INITIAL_CATEGORIES`; `INITIAL_TABLES` and `DEFAULT_BUSINESS_CONFIG` stay (still used as seed) |
| `src/types.ts` | Modified | add `MenuCategory`, `TableAreaRow`, `Notification`, `ServiceStatus` |
| `src/lib/queries.ts` | Modified | +`useMenuCategoriesQuery`, +`useTableAreasQuery`, +`useNotificationsQuery`; `useBusinessConfigQuery.staleTime: 0` |
| `src/lib/mutations.ts` | Modified | +`useCreateCategory/Update/Delete` (×2 for areas); +`useUploadImage/Delete`; +`useDismissNotification`; +`useCheckInReservation/StartService/CompleteService` |
| `src/components/admin/MenuManager.tsx` | Modified | category dropdown from query; image picker; thumbnail |
| `src/components/admin/SettingsPanel.tsx` | Modified | new "Pagos" section (QR), WhatsApp input `type="tel"` |
| `src/components/admin/AdminPanel.tsx` | Modified | +"Notifications" tab, +"Currently In Service" KPI |
| `src/components/admin/NotificationHistory.tsx` | New | list, filter chips, dismiss, relative timestamps |
| `src/components/admin/KanbanBoard.tsx` | Modified | service badge + 3 action buttons; "Resend WhatsApp" |
| `src/components/MenuSection.tsx` | Modified | consume `useMenuCategoriesQuery` instead of `INITIAL_CATEGORIES` |
| `src/components/booking/TableSelector.tsx` | Modified | consume `useTableAreasQuery` instead of enum |
| `src/components/BookingSection.tsx` | Modified | primary "Enviar a WhatsApp" button on Step 4 |
| `src/components/PaymentModal.tsx` | Modified | render QR above reference input when `transfer` + URL present |
| `server/db/seed.ts` | Modified | seed `menu_categories` (3 rows) + `table_areas` (4 rows) from `INITIAL_CATEGORIES` / `tableAreaEnum` |
| `server/__tests__/` | New | uploads, categories-crud, qr-settings, notifications, service-tracking — all `.skip` when `TEST_DATABASE_URL` unset |
| `package.json` | Modified | +`multer`, +`@types/multer` |
| `openspec/specs/backend-and-admin/spec.md` | Modified | MODIFIED: `useBusinessConfigQuery.staleTime: 5*60_000 → 0` (D5) |

## Risks (carried from explore #397, mostly unchanged)

| # | Risk | Mitigation |
|---|---|---|
| R1 | No CSRF on admin routes | Out of scope; separate security PR |
| R2 | `/api/uploads/*` enumerable | UUID filenames — already in design |
| R3 | MenuManager hard-delete + image orphan | Cascade-delete local file in `useDeleteMenuProduct` (PR#2) when URL starts with `/uploads/` |
| R4 | Postgres enum migration | Only ADD `service_status` — no ALTER. Safe. |
| R5 | Vercel Blob migration | Deferred — no Vercel deploy target. One-file swap in `server/lib/uploads.ts`. |
| R6 | `useBusinessConfigQuery.staleTime: 0` increases refetch pressure | Acceptable — config is small, cached aggressively by TanStack Query after first hit. Worst case: extra 1-2 KB per refetch. |
| R7 | Notification volume under load (every reservation + every status change) | 2 events only (D4). `useNotificationsQuery` paginates `limit=50`. Index on `(created_at DESC)`. |
| R8 | PR#4 bumps Reservation type (new fields) | `src/types.ts` Reservation is fully additive. Old query results (no service_status) gracefully default to `not_checked_in`. |
| R9 | D2 means WhatsApp delivery is fully client-side | If admin forgets to click "Resend", customer never gets the link. Mitigated by clear CTA on Step 4 + clipboard fallback already present. |

## Rollback Plan

- **Per-PR revert**: each PR is a single branch off `main`; `git revert -m 1 <merge-sha>` reverts cleanly. Schema migrations are additive (no destructive ALTERs) so rollback does NOT lose data.
- **Schema rollback** (worst case, all 5 PRs in flight): `DROP TABLE notifications; DROP TABLE menu_categories; DROP TABLE table_areas; ALTER TABLE reservations DROP COLUMN service_status, checked_in_at, service_started_at, service_completed_at; DROP TYPE service_status; ALTER TABLE business_config DROP COLUMN transfer_qr_url;` — all in one migration, fully reversible.
- **D5 staleTime rollback**: trivial, one line in `src/lib/queries.ts`. No data impact.

## Success Criteria

- [ ] Admin can create, edit, soft-delete, and re-order menu categories from `CategoryManager`
- [ ] Admin can create, edit, soft-delete, and re-order table areas from `CategoryManager`
- [ ] Admin can upload a menu item image (jpg/png/webp ≤ 5 MB) and see a thumbnail preview
- [ ] Admin can upload a transfer QR; PaymentModal shows it when method=transfer
- [ ] WhatsApp number edits in `SettingsPanel` reflect in `BookingSection` wa.me link within 1s (D5)
- [ ] `POST /api/reservations` writes a notification row visible in `NotificationHistory` within 1s
- [ ] `PATCH /api/admin/reservations/:id/status` writes a notification row on every status change
- [ ] KanbanBoard card has Check In / Start / Complete buttons; each writes a timestamp
- [ ] "Currently In Service" KPI tile in AdminPanel shows count of `service_status='in_service'`
- [ ] KanbanBoard "Resend WhatsApp" opens `wa.me/<number>?text=…` with the correct bilingual template per payment method
- [ ] All `npm test -- --run` pass; all 5 new integration suites skip gracefully without `TEST_DATABASE_URL`
- [ ] `npm run build` clean
- [ ] `INITIAL_CATEGORIES` no longer in `src/data.ts`
- [ ] No Cloud API code, no Twilio code, no WhatsApp env vars in `.env.example`

## Open Questions

**NONE** — all 5 architecture decisions (D1-D5) locked by the orchestrator preflight. D6/D7/D9/D10 inherited from explore and not flagged for re-open.

## Next Phase

`sdd-spec` — write 5 new domain specs (`category-management`, `image-uploads`, `payment-qr`, `notifications`, `service-tracking`, `whatsapp-link-generation`) plus 1 MODIFIED requirement on the existing `backend-and-admin` spec (D5 staleTime).
