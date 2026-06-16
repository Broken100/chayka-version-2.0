# Exploration: admin-polish-and-extras

> **Read-only investigation.** No code is written in this phase. All findings below were verified against the working tree at `main` (HEAD: `d03077a`) and the current OpenSpec spec at `openspec/specs/backend-and-admin/spec.md`.

## Purpose

Investigate 7 new feature requests to extend the Chayka Coffee v2.0 admin and reservation systems beyond the recently-archived `backend-and-admin-fixes` change. Identify the right cut points, surface architecture decisions that need user input, and propose a chained-PR structure that respects the 800-line-per-PR review budget set in this session's preflight.

## Current State (post-archive)

| Area | State on `main` (`d03077a`) |
|---|---|
| Backend | Express + Drizzle + Neon Postgres, 5 routes (`public`, `admin`, `payments`), 5-second timeout, integration tests for `/api/payments/simulate` and `/api/admin/login` |
| Schema | `menu_items`, `tables`, `reservations`, `business_config` (id=1), `admin_sessions` (auth). 2 enums: `table_area`, `kanban_stage`, `payment_status` |
| Auth | Server-side session table, UUID cookie, 24h expiry, env-based passwords |
| Frontend | React 19 + Vite + TanStack Query 5; `useMenuQuery`/`useTablesQuery`/`useBusinessConfigQuery`/`useReservationsQuery`/`useAdminAuth`; `useCreateMenuProduct`/`useUpdateMenuProduct`/`useDeleteMenuProduct`/`useUpdateBusinessConfig` already wired |
| Reservations | `useReservationsQuery` calls `/admin/reservations` (was 404 before `d03077a`). Lifecycle stages: `pending` / `confirmed` / `cancelled` only |
| Menu manager | Hard delete, bilingual form, fallback image, active/special flags. Image is a free-text URL field |
| Settings panel | 4 sections, per-section Save button, WhatsApp number editable |
| Payment modal | Card / Transfer / Cash branches, bank details hardcoded (`Banco Pichincha`, account `2201928471`, holder `Chayka Coffee S.A.S.`, RUC `1003948576001`) |
| Booking WhatsApp | `BookingSection.getWhatsAppLink` (line 193) reads `businessConfig.whatsappNumber` from `useReservation()` context, which wraps `useBusinessConfigQuery`. **Already dynamic** — feature #2 is essentially already satisfied end-to-end |
| Notifications | Client-side toast stack in `NotificationToast.tsx`, fed from `addNotification` in `ReservationContext`. No persistence, no history view, no admin surfacing |
| Categories | `INITIAL_CATEGORIES` in `src/data.ts:16-53`, hardcoded, passed as a prop from `App.tsx` to `AdminPanel` and from there to `MenuManager` |
| Table areas | `tableAreaEnum` in `server/db/schema.ts:3-8` — 4 fixed values (`waterfall_deck`, `fireplace_cozy`, `indoor_premium`, `terrace_panoramic`) |
| Image storage | `image` column on `menu_items` is a free-text URL. Currently 8 drink_*.jpg files live in `src/assets/`. Fallback URL `https://images.unsplash.com/photo-1495474472287-4d71bcdd2085…` is hardcoded in `MenuManager.tsx:70` |
| WhatsApp API | None. The current `BookingSection` opens `https://wa.me/<number>?text=...` (client-side link) |
| QR images | None. The transfer section of `PaymentModal` shows bank details but no QR |

## Feature Analysis

### 1. Image server for menu items

**Current**: `MenuManager` accepts an image URL string. The only on-disk images are the 8 seed `drink_*.jpg` files in `src/assets/`. The DB stores URLs.

**Affected files**:
- `server/db/schema.ts` — add `image_uploaded_at` (optional) or rely on URL alone
- `server/routes/admin.ts` — add `POST /api/admin/uploads` (multipart), `DELETE /api/admin/uploads/:filename`
- `server/lib/uploads.ts` (NEW) — multer config, filesystem write, content-type sniffing, size cap, filename randomizer
- `server/__tests__/uploads.integration.test.ts` (NEW) — happy path, oversize, wrong mime
- `src/lib/mutations.ts` — add `useUploadImage`, `useDeleteUploadedImage`
- `src/components/admin/MenuManager.tsx:212-215` — replace URL text input with `<input type="file">` + upload progress + thumbnail preview
- `src/components/booking/StepDateTime.tsx` and `MenuSection.tsx` — already consume `image` URL, no change
- `package.json` — add `multer` + `@types/multer`

**Estimated lines**: ~550 (server ~250, client ~200, tests ~100).

**Storage recommendation** (user asked for one):

| Option | Pros | Cons | Verdict |
|---|---|---|---|
| **Local disk (`server/uploads/`, served via `express.static`)** | Zero new deps beyond `multer`. Free. Full control. Works offline. | Doesn't scale across Vercel-style serverless deploys. Manual backup. CDN-less. | **Recommended for now** — the project runs as a long-lived Node process locally and on a single VM. When/if it moves to serverless, swap to Vercel Blob (already in their stack or one click away). |
| **Vercel Blob** | First-class on Vercel, 100 MB free, CDN-backed, `@vercel/blob` SDK. Immutable pathnames. | Adds Vercel-only coupling. Free tier uploads count as advanced operations. Requires `BLOB_READ_WRITE_TOKEN` env var. | Strong second choice. Defer until deploy target is Vercel. |
| **Cloudinary** | Free 25 GB / 25 credits/mo. Built-in transforms. | Vendor lock-in, requires cloud name + API key + preset. Overkill for ~30 images. | Reject — complexity not justified. |
| **Supabase Storage** | Postgres-native feel, 1 GB free. | New vendor on top of Neon. We don't use Supabase for the DB. | Reject — would introduce a second storage backend. |

**Architecture decision required (D1)**: Local disk vs Vercel Blob. Recommend **local disk** for this change, with the route surface designed so swapping in `@vercel/blob` is a one-file change in `server/lib/uploads.ts`.

**Decisions to surface to user**:
- File size cap: 2 MB? 5 MB? (multer config + zod)
- Mime allowlist: `image/jpeg`, `image/png`, `image/webp` only
- Image dimensions: enforce max width/height? Or trust the source? (Recommend: trust + `object-cover` in CSS as today)
- Public URL shape: `/api/uploads/<random>.jpg` (served by express.static) vs `/uploads/<filename>`
- Cleanup: when a menu item is hard-deleted, leave the file orphan (simpler) vs cascade-delete (requires storing the filename in the DB)

### 2. WhatsApp number sync

**Current**: Already wired. `BookingSection.getWhatsAppLink` reads `businessConfig.whatsappNumber` from context, which is backed by `useBusinessConfigQuery`. `SettingsPanel` updates via `useUpdateBusinessConfig` and invalidates the `business-config` query key. Every `useBusinessConfigQuery` consumer re-renders with the new value within the 5-second staleness window.

**What this feature actually is**: A regression test that proves the wiring works. Plus making the input a proper `<input type="tel">` and adding validation in `zod` (currently `updateBusinessConfigSchema.whatsappNumber` is `z.string().optional()` — accepts any garbage).

**Affected files**:
- `server/lib/validation.ts` — tighten `whatsappNumber` to accept only `+` and digits, length 8-15
- `src/components/booking/StepSummary.tsx` — already uses `getWhatsAppLink()`; no change
- `src/components/admin/SettingsPanel.tsx:42-45` — add `type="tel"`, error message, validation
- `server/__tests__/whatsapp-config.integration.test.ts` (NEW) — set WA, fetch `/api/business-config`, assert

**Estimated lines**: ~80. Could be folded into the next PR touching SettingsPanel (likely #1 image upload in `feat/category-management`).

**Decisions to surface to user**:
- Validation strictness: regex `^\+\d{8,15}$`? Or keep loose and trust the admin?
- Should the booking confirmation page log a warning if `whatsappNumber` is empty? (Recommended: yes, since the link will break)

### 3. QR images for transfer payments

**Current**: `PaymentModal.tsx:365-391` renders bank details as a static list. No QR.

**Affected files**:
- `server/db/schema.ts` — add `transfer_qr_url` column to `business_config` (or new `payment_settings` table)
- `server/routes/admin.ts` — `POST /api/admin/qr` (image upload, reuses feature #1) + `PUT /api/admin/business-config` extended with `transferQrUrl`
- `server/lib/validation.ts` — extend `updateBusinessConfigSchema` with optional `transferQrUrl: z.string().url()`
- `src/lib/queries.ts` — extend `BusinessConfigRow` + `rowToBusinessConfig`
- `src/lib/mutations.ts` — extend `useUpdateBusinessConfig` payload
- `src/components/admin/SettingsPanel.tsx` — new "Pagos / Transferencia" section with file picker + preview + Save
- `src/components/PaymentModal.tsx:363` — when `method === 'transfer'`, fetch config, render `<img src={transferQrUrl} />` above the reference input if present

**Estimated lines**: ~280. **Depends on feature #1** (image upload infrastructure).

**Decisions to surface to user**:
- Single QR or per-bank-account QRs? (We have one bank account today. Recommend: single `transferQrUrl` field for now, schema can grow later.)
- When QR is missing, hide the section or show a placeholder telling the customer to use the bank account data? (Recommend: hide gracefully, but keep the bank details always visible.)
- Should the QR be public (anyone with the URL) or auth-gated? (Public is fine — a transfer QR is supposed to be shareable.)

### 4. Notification review from admin panel

**Current**: Toasts are client-side only, in `ReservationContext` state, no persistence, no history view.

**Affected files**:
- `server/db/schema.ts` — new `notifications` table (id, type, title_es/en, message_es/en, reservation_id nullable, severity, created_at, dismissed_at nullable)
- `server/routes/admin.ts` — `GET /api/admin/notifications?limit=50`, `PATCH /api/admin/notifications/:id/dismiss`
- `server/routes/public.ts` — `POST /api/reservations` already exists; add a hook to insert a "reservation created" notification in the same transaction (or right after — outbox pattern is overkill)
- `server/lib/validation.ts` — `notificationFilterSchema` (limit, severity, dismissed)
- `server/__tests__/notifications.integration.test.ts` (NEW) — list, dismiss, filter
- `src/lib/queries.ts` — `useNotificationsQuery`, `useDismissNotification`
- `src/lib/mutations.ts` — `useDismissNotification`
- `src/components/admin/AdminPanel.tsx` — add `notifications` to the tab list (5 tabs now)
- `src/components/admin/NotificationHistory.tsx` (NEW) — list view with filter chips, dismiss button, relative timestamps, empty state
- `src/components/NotificationToast.tsx` — optional: also reflect dismissals from the admin panel in the live toast stack

**Estimated lines**: ~450. Mostly independent.

**Decisions to surface to user**:
- Bilingual titles/messages: store both `es` and `en` server-side, render in current language on the client? (Recommended: yes — server is the source of truth for the user-facing string.)
- Auto-dismiss toasts: keep current behavior (manual dismiss) or add a 6s auto-dismiss? (Recommended: keep manual; the history view is the right place for "what happened")
- Should the bell icon in the header show a count of unread notifications? (Recommended: yes, polled by `useNotificationsQuery`. Future PR can wire to the existing bell.)
- Source events: just `reservation_created`? Or also `status_changed`, `image_uploaded`, `config_changed`? (Recommended: ship with `reservation_created` + `reservation_status_changed`; extend later. Too many events at once bloats the PR.)

### 5. Service tracking and check-in per reservation

**Current**: `kanbanStageEnum` has 3 values: `pending`, `confirmed`, `cancelled`. No concept of "guests arrived" or "service in progress" or "left".

**Affected files**:
- `server/db/schema.ts` — add `service_status` enum (`not_checked_in`, `checked_in`, `in_service`, `completed`), plus `checked_in_at`, `service_started_at`, `service_completed_at` timestamp columns on `reservations`. Migration.
- `server/lib/validation.ts` — new `updateServiceStatusSchema`
- `server/routes/admin.ts` — new routes: `POST /api/admin/reservations/:id/checkin`, `POST /api/admin/reservations/:id/start-service`, `POST /api/admin/reservations/:id/complete-service`
- `server/__tests__/service-tracking.integration.test.ts` (NEW)
- `src/types.ts` — extend `Reservation` with `serviceStatus`, `checkedInAt`, etc.
- `src/lib/queries.ts` — extend `ReservationRow` + `rowToReservation` (new helper)
- `src/lib/mutations.ts` — `useCheckInReservation`, `useStartService`, `useCompleteService`
- `src/components/admin/KanbanBoard.tsx` — replace single status select with a 4-button "stage" group (Pending / Confirmed / Checked-in / In Service / Completed) — actually the kanban is for the **lifecycle status** (booking status); service is a separate axis. Recommended: keep kanban for status, add a small "Service" badge + "Check In" action button on each card
- `src/components/admin/AdminPanel.tsx` — new KPI tile for "Currently In Service"

**Estimated lines**: ~400.

**Decisions to surface to user**:
- Service status is a new axis, not a replacement for the existing kanban status? Or merge them? (Recommended: **separate axis**. The kanban tracks the booking lifecycle; service tracks physical presence. They overlap but are distinct. UX stays clean.)
- Auto-transition: when status changes to `confirmed`, should the service status auto-init to `not_checked_in`? (Recommended: yes, default value.)
- When does "service in progress" auto-end? (Recommended: explicit "Complete Service" action only. No timer for now — a coffee shop visit can be 30 min to 3 hours.)
- Should `cancelled` reservations show in the service view? (Recommended: no. Service view = `confirmed` + `checked_in` + `in_service`.)

### 6. WhatsApp message on reservation (by payment method)

**Current**: `BookingSection` builds a `wa.me/<number>?text=...` link and the user has to click it. No automatic message is sent. `BookingSection.tsx:271`.

**Affected files**:
- `server/lib/whatsapp.ts` (NEW) — thin wrapper around the WhatsApp Cloud API (or `wa.me` link generator for the free-tier path)
- `server/routes/public.ts` — `POST /api/reservations` calls `whatsapp.sendConfirmation(reservation, paymentMethod)` after the DB insert (in `onSuccess` of the mutation, fire-and-forget — don't block the response on a 4xx from WA)
- `server/routes/admin.ts` — `POST /api/admin/reservations/:id/send-whatsapp` (manual re-send from KanbanBoard)
- `server/lib/validation.ts` — `sendWhatsappSchema` (method, reservationId)
- `server/__tests__/whatsapp-send.integration.test.ts` (NEW) — mock the WA client, assert message shape per payment method
- `src/lib/mutations.ts` — `useSendWhatsapp`
- `src/components/admin/KanbanBoard.tsx` — new "Resend WhatsApp" button per card
- `src/components/BookingSection.tsx` — remove the manual `Send to WhatsApp` button OR keep it as fallback. The success card currently has `<a id="whatsapp-confirm-anchor" href={getWhatsAppLink()}>`. **Keep the link** as a fallback ("If the message didn't arrive, click here") and add automatic send to the backend.

**Estimated lines**: ~500.

**WhatsApp delivery recommendation** (user asked for one):

| Option | Pros | Cons | Verdict |
|---|---|---|---|
| **WhatsApp Cloud API (Meta, free tier: 1000 service conversations/mo)** | Real outbound messages, no user action required, free up to a healthy volume, official. | Requires Meta Business account, app ID, phone number ID, access token, webhook setup. From-to-not-template messages are restricted. | **Recommended** — once configured, the admin can fully automate confirmations. The "1k free/mo" tier is generous. |
| **wa.me link (current)** | Zero infra, no auth, no rate limits, free forever. | Requires the user to click a link and press Send on their own WhatsApp. Not automatic. | Keep as a fallback, not the primary path. |
| **Twilio WhatsApp** | Reliable, well-documented, sandbox mode for dev. | Per-message cost (~$0.005 service + $0.0025 session in US). Sandbox numbers can't message real customers without verification. | Reject — extra cost for no benefit over Cloud API for this use case. |
| **CallMeBot / similar free gateways** | Free, no Meta setup. | Unreliable, ToS violations, gets shut down periodically. | Reject. |

**Message templates** (per payment method, bilingual — store templates in `server/lib/whatsapp-templates.ts`):

- **Card** (es): "✅ Tu reserva en Chayka Coffee está confirmada. Mesa {table}, {date} a las {time}. Referencia de pago: {ref}. ¡Te esperamos!"
- **Card** (en): "✅ Your reservation at Chayka Coffee is confirmed. Table {table}, {date} at {time}. Payment ref: {ref}. See you soon!"
- **Cash** (es): "💵 Reserva confirmada en Chayka Coffee. Mesa {table}, {date} a las {time}. Te recordamos traer efectivo para tu consumo mínimo de ${minFee}."
- **Transfer** (es): "🏦 Reserva confirmada. Transfiere ${amount} a Banco Pichincha, cuenta 2201928471, titular Chayka Coffee S.A.S., RUC 1003948576001. QR: {qrUrl}. Ref: {ref}."

**Architecture decision required (D2)**: WhatsApp Cloud API vs keep wa.me only. Recommend **Cloud API with a graceful degradation** — if the env vars are unset, the route logs a warning and the booking still succeeds. The user can flip the switch by adding `WHATSAPP_TOKEN` + `WHATSAPP_PHONE_ID` to `.env`.

**Decisions to surface to user**:
- Should the auto-send be opt-in per payment method? (Recommended: all three by default, behind a single feature flag `WHATSAPP_AUTO_SEND=true`.)
- What if the WA API is down — do we fail the reservation or silently skip? (Recommended: silently skip + server log + a `notifications` row with `severity: alert` for the admin.)
- Should the customer's phone number be validated? (Recommended: yes — `customerPhone` already exists in the schema; just enforce E.164 format on the way in. zod regex `^\+\d{8,15}$`.)

### 7. Category management from admin panel

**Current**: `INITIAL_CATEGORIES` in `src/data.ts:16-53` is hardcoded with 3 categories (`hot_drinks`, `frappes`, `soft_drinks`). It's passed from `App.tsx` to `AdminPanel` as a prop, then to `MenuManager`. There's no DB persistence. `tableArea` is an enum with 4 fixed values used by both the schema and the reservation flow.

**Affected files**:
- `server/db/schema.ts` — new `menu_categories` table (id, name_es, name_en, icon, description_es, description_en, display_order, active). New `table_areas` table (id, code, name_es, name_en, description_es, description_en, display_order, active). Migration step.
- `server/db/seed.ts` — seed both tables from the current constants
- `server/routes/public.ts` — `GET /api/menu-categories`, `GET /api/table-areas` (public, used by the booking flow)
- `server/routes/admin.ts` — full CRUD for both
- `server/lib/validation.ts` — schemas for create/update of each
- `server/__tests__/categories-crud.integration.test.ts` (NEW)
- `src/types.ts` — new `MenuCategory` and `TableArea` types
- `src/lib/queries.ts` — `useMenuCategoriesQuery`, `useTableAreasQuery`
- `src/lib/mutations.ts` — `useCreateCategory`, `useUpdateCategory`, `useDeleteCategory`, same for table areas
- `src/components/admin/AdminPanel.tsx` — add `categories` tab to the tab list, render `CategoryManager`
- `src/components/admin/CategoryManager.tsx` (NEW) — bilingual form, display order, active toggle, delete confirmation
- `src/components/admin/MenuManager.tsx:14` — replace the `INITIAL_CATEGORIES` default with `useMenuCategoriesQuery()`
- `src/components/MenuSection.tsx` — replace `INITIAL_CATEGORIES` import with query
- `src/components/booking/TableSelector.tsx` — replace hardcoded area enum with `useTableAreasQuery()` (keep the existing 4 codes for the seed)
- `src/data.ts` — remove `INITIAL_CATEGORIES` after the seed covers it; keep `DEFAULT_BUSINESS_CONFIG` and `INITIAL_TABLES` for one more release (or migrate too)

**Estimated lines**: ~700 (largest single feature).

**Decisions to surface to user**:
- Should categories be ordered? (Recommended: yes, `display_order` column.)
- Soft delete (`active = false`) or hard delete? Existing menu items reference the category id. Hard delete would cascade-fail. **Recommended: soft delete** + a "no items use this category" check on UI.
- Icon: store the Lucide name as a string (current `INITIAL_CATEGORIES` already does `icon: 'Coffee'`). Keep the pattern.
- For `table_areas`: do we keep the `tableAreaEnum` (4 fixed values) or migrate to a table? (Recommended: migrate — once areas are in a table, the `kanbanStageEnum` stays as an enum, but `area` becomes a foreign key.)
- Should `INITIAL_CATEGORIES` be deleted from `src/data.ts` after the seed? (Recommended: yes, after the seed migration lands in a follow-up step. Leaving it in the same PR bloats the diff.)

## Cross-cutting concerns

### A. Migration order

The new `menu_categories` and `table_areas` tables MUST be created before any of the other features that reference them (PR#1 only). The `service_status` enum and new reservation columns MUST be added before the service-tracking routes. Both migrations land in PR#1.

### B. Existing tests to extend

- `server/lib/__tests__/validation.test.ts` — add tests for the new schemas (whatsappNumber regex, menuCategory, tableArea, serviceStatus, notification)
- `server/__tests__/payments.integration.test.ts` — no change
- `server/__tests__/admin-login.integration.test.ts` — no change
- `server/__tests__/timeout.test.ts` — no change

### C. New env vars

| Var | Where | Used in PR |
|---|---|---|
| `UPLOADS_DIR` | `server/lib/uploads.ts` | PR#2 |
| `UPLOAD_MAX_BYTES` | `server/lib/uploads.ts` | PR#2 |
| `WHATSAPP_TOKEN` | `server/lib/whatsapp.ts` | PR#4 |
| `WHATSAPP_PHONE_ID` | `server/lib/whatsapp.ts` | PR#4 |
| `WHATSAPP_AUTO_SEND` | `server/routes/public.ts` | PR#4 |
| `PUBLIC_BASE_URL` | `server/lib/whatsapp.ts` (for QR links in messages) | PR#3 + PR#4 |

### D. Risks that surface from the code

1. **No CSRF protection on admin routes**. The cookie is httpOnly + sameSite=lax, which protects against most cross-site attacks, but a CSRF token would be the next step. Out of scope for this change but worth flagging.
2. **No rate limiting on `/api/reservations`**. With WhatsApp auto-send, a malicious user could trigger thousands of free Cloud API messages. Recommend: add a basic in-memory rate limiter (5 reqs / IP / minute) in PR#4. Trivial: ~15 lines.
3. **`/api/uploads/*` will be served by `express.static`**. This means the path becomes enumerable. Mitigation: use random UUID filenames (already in the recommendation) so the file URLs can't be guessed. For a coffee shop, this is fine.
4. **`MenuManager` hard-delete cascades to a dangling `image` URL**. The new `useDeleteMenuProduct` should also call `useDeleteUploadedImage(filename)` if the URL is local. PR#2 concern.
5. **The `kanbanStageEnum` and `tableAreaEnum` are Postgres enums**. Altering a Postgres enum in production requires `ALTER TYPE ... ADD VALUE` which is non-atomic with the rest of the migration. For this change, we **add** a new `service_status` enum — no existing enum is altered. Safe.
6. **Vercel Blob path**: the dev environment runs locally; if/when the project moves to Vercel, the file uploads will need to be migrated. Defer until then.

## Suggested PR Chain (5 PRs, force-chained, 800-line budget per PR)

| # | PR title | Surface | Approx lines | Depends on |
|---|---|---|---|---|
| 1 | `feat/category-management` | New `menu_categories` + `table_areas` tables, public GETs, admin CRUD, MenuManager + TableSelector consume queries, `INITIAL_CATEGORIES` removed, tests | ~700 | — |
| 2 | `feat/image-uploads` | `POST /api/admin/uploads` (multer, local disk), `DELETE /api/admin/uploads/:filename`, `useUploadImage`/`useDeleteUploadedImage`, MenuManager image picker + thumbnail preview, harden WhatsApp validation (feature #2), tests | ~700 | — |
| 3 | `feat/qr-and-transfer-settings` | `transfer_qr_url` on `business_config`, `POST /api/admin/qr` (reuses PR#2), SettingsPanel "Pagos" section, PaymentModal renders QR when transfer + URL present, tests | ~350 | PR#2 |
| 4 | `feat/notifications-and-service-tracking` | `notifications` table, `service_status` enum + reservation columns, all routes (list/dismiss/checkin/start/complete), AdminPanel "Notifications" tab + KPI tile, NotificationHistory view, KanbanBoard service actions, tests | ~750 | PR#1 |
| 5 | `feat/whatsapp-auto-send` | `server/lib/whatsapp.ts` (Cloud API client, graceful fallback to log+warn), `POST /api/admin/reservations/:id/send-whatsapp`, auto-send in `POST /api/reservations` behind `WHATSAPP_AUTO_SEND`, KanbanBoard "Resend" button, message templates, tests, basic rate limiter | ~600 | PR#3 + PR#4 |

**Total**: ~3,100 lines across 5 PRs. No single PR exceeds the 800-line budget (PR#1 and PR#2 are tight at ~700). With force-chained, each PR gets its own branch off `main` and is reviewed independently.

### PR dependency graph

```
PR#1 (categories)      ───────────────────────────┐
PR#2 (images)          ─────────┐                 │
PR#3 (QR)              ─────────┴── PR#2         │
PR#4 (notif+service)   ───────────────────────────┴── PR#1
PR#5 (WhatsApp send)   ─────────────────────────────┴── PR#3, PR#4
```

PR#1 and PR#2 can land in parallel (no overlap). PR#3 requires PR#2 (uploads infrastructure). PR#4 requires PR#1 (categories). PR#5 requires PR#3 (QR link) and PR#4 (notifications for delivery failures).

### Why this order

- **PR#1 first because** every later feature benefits from real DB-backed categories (notifications, WhatsApp templates, image picker dropdown).
- **PR#2 first because** QR uploads (PR#3) reuse the same multipart pipeline.
- **PR#4 before PR#5** so the WhatsApp-send PR can write to the notifications table on failure.
- **PR#5 last** because it's the riskiest (third-party API) and benefits from all the supporting infrastructure being in place.

## Architecture Decisions (require user input before propose)

| # | Decision | Recommendation | Why |
|---|---|---|---|
| D1 | Image storage backend | **Local disk** (`server/uploads/`, served via `express.static`) | Zero new vendor dependency, free, fits the current single-VM deploy. Swappable to Vercel Blob via a one-file change in `server/lib/uploads.ts`. |
| D2 | WhatsApp delivery | **Cloud API with graceful fallback** | 1k free service conversations/mo is more than enough for a coffee shop. Free until real growth. Fails closed if env vars missing — booking still succeeds, log line + notification row. |
| D3 | Image cleanup on menu item delete | **Leave orphan** (simpler) | The orphaned files are tiny and won't matter for a 30-item menu. Add a future "prune orphans" admin job if it becomes a problem. |
| D4 | Service status axis | **Separate from kanban status** | Lifecycle (pending/confirmed/cancelled) and service (not_checked_in/checked_in/in_service/completed) are different concerns. UI stays clean if they stay separated. |
| D5 | Notification source events | **reservation_created + reservation_status_changed** for now | Two events is enough to prove the value. Adding more later is a small PR. Avoids bloat. |
| D6 | WhatsApp number validation | **Strict** (`^\+\d{8,15}$`) | The number is part of every `wa.me/` link; bad input breaks the link. |
| D7 | Category delete | **Soft delete + UI guard** ("X items use this category — delete those first") | Prevents orphaning menu items. |
| D8 | Rate limiting on POST /reservations | **In-memory, 5 req/IP/min**, in PR#5 | Without it, PR#5's auto-send becomes a free WhatsApp spam vector. |
| D9 | Notification text language | **Store both es and en server-side** | Source of truth on the server; client picks. Future-proofs any new frontend. |
| D10 | E.164 phone format on reservations | **Enforce** | Prerequisite for D2. |

## Open Questions for the User

1. **D1 storage backend** — local disk vs Vercel Blob? (Recommended: local disk.)
2. **D2 WhatsApp delivery** — Cloud API with fallback vs keep wa.me only? (Recommended: Cloud API.)
3. **PR#1 scope** — should `INITIAL_CATEGORIES` be deleted from `src/data.ts` in the same PR, or moved to a follow-up cleanup? (Recommended: same PR, ~5 lines saved.)
4. **Notification events** — start with 2 (`reservation_created`, `reservation_status_changed`) or also add `service_status_changed` in PR#4? (Recommended: 2 for now, add the third in PR#5 when WhatsApp needs it.)
5. **Pre-existing `useBusinessConfigQuery` cache invalidation** — currently 5min staleTime. For "edit WhatsApp, see it on the next booking" to feel instant, do we need to drop it to 0 or force refetch on tab focus? (Recommended: keep 5min — the user can wait 5s for the query to refetch, and it's not in a hot path.)

## Total Estimated Lines

| Surface | Lines |
|---|---|
| Server (routes, schema, lib, tests) | ~1,300 |
| Client (queries, mutations, components, tests) | ~1,500 |
| Seed + migration | ~150 |
| Docs / spec changes | ~150 |
| **Total** | **~3,100** |

## Ready for Proposal

**Yes**, after the user confirms D1 (storage), D2 (WhatsApp), and D3-D10 (smaller choices). The PR chain is dependency-ordered, all under the 800-line budget, and the cross-cutting risks (CSRF, rate limiting, file cleanup) are flagged but addressed incrementally.

## Out of Scope (deliberate)

- CSRF tokens on admin routes (separate security PR)
- Soft delete for menu items (current `useDeleteMenuProduct` is hard; will revisit if needed)
- Image transformations (resize, format conversion) — defer to Vercel Blob or Cloudinary if/when added
- Real-time Kanban updates (WebSockets / SSE) — defer; the invalidation model is sufficient
- Per-customer accounts
- i18n for new admin strings — the existing `t('admin.*', language)` pattern carries through
