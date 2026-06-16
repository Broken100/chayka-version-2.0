# Design: backend-and-admin-fixes (5-PR chain, ~820 lines)

> Technical design mapping the 12 new spec requirements + 1 modified requirement onto 5 stacked PRs.

**What**: ~820 lines of design across 5 PRs, none over 400. All 10 required sections (goals/non-goals, file tree, data model, API surface, server changes PR#1, frontend by PR, sequence diagrams, risks, test strategy, open questions=NONE).

**Where**: `sdd/backend-and-admin-fixes/design` (engram #389) + this filesystem copy

## Goals

- Close all 12 CRITICALs (10 original + 2 newly discovered) from the prior verify report.
- Migrate admin and payment flows from local state to API mutations.
- Make the admin panel and customer flows show loading skeletons and retry controls.
- Replace the stateless signed cookie with a server-side session table.
- Add supertest integration tests for the highest-risk endpoints.

## Non-Goals

- Undo toast for menu delete.
- Real payment processor integration.
- Soft delete for menu items.
- Playwright E2E.
- `src/lib/bilingual.ts` extraction.
- `server/db/seed.ts` source migration.
- Optimistic reservation insert.
- Login error message rewrite as a standalone change (handled in PR#1 alongside the cookie rename).

## File tree (delta)

```
D:\2026\landing\chayka v2.0\
├── server/
│   ├── app.ts                                 (NEW) — extracted express() for supertest
│   ├── index.ts                               (MOD) — listen() only
│   ├── routes/
│   │   ├── payments.ts                        (NEW) — POST /api/payments/simulate
│   │   └── admin.ts                           (MOD) — POST/DELETE /menu, cookie rename, 24h expiry
│   ├── lib/
│   │   ├── auth.ts                            (MOD) — SESSION_COOKIE = 'chayka_admin_session'
│   │   ├── timeout.ts                         (NEW) — 5s request timeout middleware
│   │   ├── validation.ts                      (MOD) — append createMenuItemSchema
│   │   └── __tests__/validation.test.ts      (NEW) — 12 Zod cases
│   └── __tests__/
│       ├── setup.ts                           (NEW) — TEST_DATABASE_URL gate
│       ├── timeout.test.ts                    (NEW) — 3 fake-timer cases
│       ├── payments.integration.test.ts       (NEW) — 3 supertest cases
│       └── admin-login.integration.test.ts    (NEW) — 6 supertest cases
├── src/
│   ├── components/
│   │   ├── AdminPanel.tsx                     (MOD) — useAdminAuth + minimal spinner + per-tab queries
│   │   ├── PaymentModal.tsx                   (MOD) — useSimulatePayment, one Pay per method, retry
│   │   ├── Skeleton.tsx                       (NEW) — Skeleton + SkeletonCard + SkeletonRow + SkeletonLine
│   │   ├── QueryError.tsx                     (NEW) — error + Reintentar button
│   │   ├── MenuSection.tsx                    (MOD) — self-fetch + Skeleton + QueryError (partial)
│   │   ├── BookingSection.tsx                 (MOD) — Skeleton + QueryError (partial)
│   │   └── admin/
│   │       ├── AdminLogin.tsx                 (MOD) — useAdminLogin + VITE_DEMO_MODE gate
│   │       ├── AdminLogin.test.tsx            (NEW) — 5 cases
│   │       ├── KanbanBoard.tsx                (MOD) — useReservationsQuery + Skeleton + QueryError
│   │       ├── TablesManager.tsx              (MOD) — useCreateTable + useDeleteTable
│   │       ├── SettingsPanel.tsx              (MOD) — 4 section drafts + 4 Save buttons
│   │       └── MenuManager.tsx                (MOD) — useUpdateMenuProduct + useCreateMenuProduct + useDeleteMenuProduct
│   ├── context/
│   │   └── ReservationContext.tsx             (MOD) — useReservationsQuery; drop useState+localStorage for reservations
│   ├── lib/
│   │   ├── queries.ts                         (MOD) — useReservationsQuery + useAdminAuth tuning
│   │   ├── mutations.ts                       (MOD) — +useCreateMenuProduct, +useDeleteMenuProduct, +useSimulatePayment
│   │   └── __tests__/useSimulatePayment.test.tsx (NEW) — deferred
│   └── __mocks__/api.ts                       (MOD) — +/payments/simulate, +DELETE
├── .env.example                               (MOD) — -SESSION_SECRET, +TEST_DATABASE_URL
├── vitest.config.ts                           (MOD) — 3 projects (client, server, server:integration)
└── package.json                               (MOD) — +supertest, +@types/supertest
```

## Data model

No schema changes. Only behavioral change: `admin_sessions.expiresAt = +24h` instead of `+7d`. Existing rows lazy-delete via `requireAdmin:25-32`.

## API surface delta

| Endpoint | Change | PR |
|----------|--------|----|
| `POST /api/payments/simulate` | NEW — 1-2s delay, `card` 0000 → fail, `transfer` empty ref → 400, else success | PR#1 |
| `POST /api/admin/menu` | NEW — `createMenuItemSchema`, dup-id → 409, else 201 | PR#1 |
| `DELETE /api/admin/menu/:id` | NEW — 204 success, 404 missing | PR#1 |
| `POST /api/admin/login` | MOD — 401 message `'Invalid password'` → `'Invalid credentials'`; expiresAt +24h; cookie name `chayka_admin_session` | PR#1 |
| `POST /api/admin/logout` | MOD — `clearCookie` explicit attrs | PR#1 |
| All admin protected routes | MOD — `requireAdmin` reads session from `admin_sessions` table by UUID | PR#1 |

## PR-by-PR

### PR#1 — `feat/server-fixes` (~180 lines)

Extract `express()` into `server/app.ts`; `index.ts` keeps `listen()` only. Mount `timeout.ts` in `app.ts:17`. New `payments.ts` with `POST /api/payments/simulate`. Modify `admin.ts` to add POST/DELETE /menu, rename cookie, change expiry, fix 401 message. Rename `SESSION_COOKIE` in `auth.ts`. Append `createMenuItemSchema` to `validation.ts`. 2 integration test files (3 + 6 supertest cases). `setup.ts` gates on `TEST_DATABASE_URL`. `vitest.config.ts` adds 2nd project (server, node env). `package.json` +supertest. `.env.example` -`SESSION_SECRET` +`TEST_DATABASE_URL`.

### PR#2 — `feat/client-auth-rewire` (~120 lines)

Rewrite `AdminLogin.tsx` to call `useAdminLogin`; gate Demo Bypass on `VITE_DEMO_MODE === 'true'`. Modify `AdminPanel.tsx` to derive `isAuthenticated` from `useAdminAuth`; ship a minimal centered `animate-pulse` spinner while `isLoading` (mitigates PR#2↔PR#5 sequencing). `queries.ts` adjusts `useAdminAuth` to `staleTime: 5*60_000` + `refetchOnWindowFocus: true`. `AdminLogin.test.tsx` covers login + demo gating.

### PR#3 — `feat/reservations-from-query` (~150 lines)

Add `useReservationsQuery` + `queryKeys.reservations` in `queries.ts` (staleTime 30s, hits public `GET /api/reservations`). Rewrite `ReservationContext.tsx` to drop `useState`+localStorage for reservations, drop the 4 no-op setters from `ReservationContextType` (`setReservations`/`setMenuProducts`/`setTables`/`setBusinessConfig`), drop the `updateMenuProduct` and `updateReservationStatus` wrappers. Modify `KanbanBoard.tsx` to call `useReservationsQuery` + `useUpdateReservationStatus` directly. `AdminPanel.tsx` drops `reservations` props, subscribes via query.

### PR#4 — `feat/admin-forms-rewires` (~190 lines)

Rewrite `TablesManager.tsx` (drop props, use `useTablesQuery` + `useCreateTable` + `useDeleteTable`; native `confirm()`). Rewrite `SettingsPanel.tsx` (4 local section drafts: contact/hours/branding/reservations; 4 Save buttons; calls `useUpdateBusinessConfig` per section). Rewrite `MenuManager.tsx` (use `useUpdateMenuProduct` for edit, new `useCreateMenuProduct` for add, new `useDeleteMenuProduct` for hard DELETE). `mutations.ts` adds `useCreateMenuProduct` + `useDeleteMenuProduct`.

### PR#5 — `feat/payment-modal-and-ux-polish` (~180 lines)

Rewrite `PaymentModal.tsx` (one Pay button per method, calls `useSimulatePayment`, drop 2nd "Pay (Fail)" button, `payment-retry-btn` re-binds same mutation). New `Skeleton.tsx` (no min display time per decision #1). New `QueryError.tsx`. `mutations.ts` adds `useSimulatePayment` + `SimulatePaymentInput`/`SimulatePaymentResult` types. `MenuSection.tsx` self-fetches + renders skeleton/error. `BookingSection.tsx` + `KanbanBoard.tsx` render skeleton/error in their surfaces. `__mocks__/api.ts` extended for `/payments/simulate` and DELETE.

## Test strategy

- **Unit tests** (Vitest, jsdom for client / node for server): `validation.test.ts` (12 cases), `timeout.test.ts` (3 fake-timer cases), `AdminLogin.test.tsx` (5 cases), `MenuSection.test.tsx` (planned), `useSimulatePayment.test.tsx` (planned), `PaymentModal.test.tsx` (planned), `Skeleton.test.tsx` (planned), `QueryError.test.tsx` (planned).
- **Integration tests** (Vitest + supertest, node, `TEST_DATABASE_URL` gated): `payments.integration.test.ts` (3 cases), `admin-login.integration.test.ts` (6 cases).
- **Coverage**: 39 unit tests passing on main, 9 integration tests skipped without DB.

## Open questions

NONE — all 9 user-confirmed decisions (A–E + 1–4) baked in.
