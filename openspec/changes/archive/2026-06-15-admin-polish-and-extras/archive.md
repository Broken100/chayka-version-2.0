# Archive: admin-polish-and-extras

> **Archived on**: 2026-06-15
> **Project**: chayka-version-2.0
> **Mode**: hybrid (Engram + OpenSpec)
> **Verdict**: PASS WITH WARNINGS (no critical issues; one cosmetic task-count discrepancy)
> **Tasks completed**: 63/63 (all checkboxes `[x]` in `tasks.md`)

---

## What shipped

5-PR force-chained feature branch chain implementing 7 features (6 ADDED + 1 MODIFIED), ~2,850 net lines across 5 PRs.

| # | Branch | PR | Tasks | Surface |
|---|--------|----|----|---------|
| PR#1 | `feat/category-management` | #16 | 17 | DB-backed menu categories + table areas, public GETs, admin CRUD, `CategoryManager` UI, deletes `INITIAL_CATEGORIES` (D3), lands D5 (`useBusinessConfigQuery.staleTime: 0`) |
| PR#2 | `feat/image-uploads` | #18 | 13 | multer + local disk (`server/uploads/`), admin upload/delete, `MenuManager` file picker, E.164 zod (D6, D10) |
| PR#3 | `feat/qr-and-transfer-settings` | #19 | 8 | `transfer_qr_url` column, `POST/DELETE /api/admin/qr`, "Pagos" section, `PaymentModal` QR render |
| PR#4 | `feat/notifications-and-service-tracking` | #20 | 17 | `notifications` table + 2 events (D4), `service_status` enum + 4 reservation columns, `NotificationHistory` view, Kanban service badge + 3 buttons, "Currently In Service" KPI |
| PR#5 | `feat/whatsapp-auto-send-and-wa-fallback` | #21 | 8 | Pure client `wa.me/<digits>?text=...` URL builder, 6 message templates, `StepSummary` primary CTA, Kanban "Resend WhatsApp" button — no Cloud API, no env vars (D2) |

**Tracker**: PR#17 (draft)

## Locked decisions (all followed)

| # | Decision | Choice |
|---|----------|--------|
| D1 | Image storage | **Local disk** (`server/uploads/` + `express.static`) — swappable to Vercel Blob via one-file change in `server/lib/uploads.ts` |
| D2 | WhatsApp delivery | **`wa.me/<number>?text=...` only** — no Cloud API, no Twilio, no env vars; client builds the URL, admin clicks it |
| D3 | `INITIAL_CATEGORIES` | **Deleted from `src/data.ts`** in PR#1 (D3 grep check returns 0) |
| D4 | Notification events | **2 events**: `reservation_created`, `reservation_status_changed`. No `service_status_changed` event for now |
| D5 | `useBusinessConfigQuery.staleTime` | **0** for instant reflection of admin edits to business config (WhatsApp number, bank details, QR URL) |

**Carried from explore** (also locked): D6 strict E.164 on WhatsApp number, D7 soft-delete + UI guard for categories, D9 bilingual notification text, D10 E.164 on `customerPhone`.

## Verification summary

| Metric | Value |
|--------|-------|
| Unit tests | 86 passed / 44 skipped / 0 failed |
| Build | clean (`npm run build` — 618 kB pre-existing chunk-size warning, not introduced by this chain) |
| Type check | clean (`tsc --noEmit`) |
| Locked decisions followed | 5/5 |
| Cross-PR invariants upheld | 3/3 (additive migrations, integration-skip behavior, `.gitignore` excludes) |
| Spec compliance | 23 scenarios COMPLIANT via unit tests, 33 scenarios DEFERRED to integration suites that skip cleanly without `TEST_DATABASE_URL`, 0 FAILING, 0 UNTESTED |
| Verify branch | `verify/admin-polish-and-extras` (deleted after archive — see Archive Operations) |

Full verify report: `verify-report.md` (this folder) · engram `sdd/admin-polish-and-extras/verify-report`.

## Spec sync results

### Created (6 new domain specs)

| Domain | Source | Action | Requirements | Scenarios |
|--------|--------|--------|--------------|-----------|
| `category-management` | delta `specs/category-management/spec.md` | **Created** at `openspec/specs/category-management/spec.md` | 5 | 12 |
| `image-uploads` | delta `specs/image-uploads/spec.md` | **Created** at `openspec/specs/image-uploads/spec.md` | 5 | 11 |
| `payment-qr` | delta `specs/payment-qr/spec.md` | **Created** at `openspec/specs/payment-qr/spec.md` | 4 | 9 |
| `notifications` | delta `specs/notifications/spec.md` | **Created** at `openspec/specs/notifications/spec.md` | 5 | 10 |
| `service-tracking` | delta `specs/service-tracking/spec.md` | **Created** at `openspec/specs/service-tracking/spec.md` | 5 | 10 |
| `whatsapp-link-generation` | delta `specs/whatsapp-link-generation/spec.md` | **Created** at `openspec/specs/whatsapp-link-generation/spec.md` | 5 | 9 |

### Modified (1 existing spec merged with delta)

| Domain | Source delta | Target | Action | Net effect |
|--------|--------------|--------|--------|------------|
| `backend-and-admin` | `specs/backend-and-admin/spec.md` (D5) | `openspec/specs/backend-and-admin/spec.md` | **1 requirement extended** with `staleTime: 0` sentence + 1 new scenario ("useBusinessConfigQuery refetches immediately after admin edit") | No requirement count change (21 → 21); scenario count on the touched requirement: 2 → 3 |

**Total post-archive spec count**: 7 domains (was 1).

## Archive Operations

1. ✅ Synced 6 delta specs to `openspec/specs/{category-management,image-uploads,payment-qr,notifications,service-tracking,whatsapp-link-generation}/spec.md`
2. ✅ Merged `backend-and-admin` delta into `openspec/specs/backend-and-admin/spec.md` (extended "Frontend uses TanStack Query for data fetching" requirement, added 1 scenario, refreshed change history)
3. ✅ Moved change folder from `openspec/changes/admin-polish-and-extras/` → `openspec/changes/archive/2026-06-15-admin-polish-and-extras/`
4. ✅ Saved archive report to engram topic key `sdd/admin-polish-and-extras/archive-report`
5. ✅ Cleaned up local `verify/admin-polish-and-extras` branch (`git branch -D`)

## Source of truth — post-archive

The following specs now reflect the new behavior as the source of truth:

- `openspec/specs/category-management/spec.md` (NEW)
- `openspec/specs/image-uploads/spec.md` (NEW)
- `openspec/specs/payment-qr/spec.md` (NEW)
- `openspec/specs/notifications/spec.md` (NEW)
- `openspec/specs/service-tracking/spec.md` (NEW)
- `openspec/specs/whatsapp-link-generation/spec.md` (NEW)
- `openspec/specs/backend-and-admin/spec.md` (MODIFIED — D5 staleTime: 0)

## Known warnings (carried from verify, not blocking)

1. **Pre-existing build warning**: 618 kB JS chunk > 500 kB. Not introduced by this chain; pre-dates PR#1. Tracked outside this archive scope.
2. **Task-count arithmetic mismatch** (cosmetic): User-facing prompt and engram tasks artifact reference "69 tasks" but `tasks.md` contains 63 rows (17+13+8+17+8). All 63 task rows exist; the "69" figure is an engram/apply-progress narrative count. No tasks are missing. Resolved at archive time: every checkbox is `[x]`.

## SDD Cycle Complete

The `admin-polish-and-extras` change has been fully planned, implemented across 5 force-chained PRs, verified, and archived. Ready for the next change.

---

## Archive Contents

- `proposal.md` ✅
- `exploration.md` ✅
- `design.md` ✅
- `tasks.md` ✅ (63/63 marked complete)
- `verify-report.md` ✅ (verdict: PASS WITH WARNINGS)
- `specs/` ✅
  - `category-management/spec.md`
  - `image-uploads/spec.md`
  - `payment-qr/spec.md`
  - `notifications/spec.md`
  - `service-tracking/spec.md`
  - `whatsapp-link-generation/spec.md`
  - `backend-and-admin/spec.md` (delta; merged into main spec)
- `archive.md` ✅ (this file)
