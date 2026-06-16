# Proposal: backend-and-admin-fixes

**What**: Follow-up to the `backend-and-admin` change. Closes the 10 original CRITICALs from the prior verify report plus 2 newly discovered CRITICALs (missing `POST /api/admin/menu` and `DELETE /api/admin/menu/:id`).

**Why**: The previous change shipped the server routes and read-side of the frontend, but the write-side (admin forms, payment simulation, integration tests) and the missing menu endpoints were never implemented. A delta spec amending the existing `backend-and-admin` spec is the cleanest path forward — 1 requirement is modified (cookie auth), 12 new requirements are added.

**Where**: `sdd/backend-and-admin-fixes/proposal` (engram #387) + `openspec/changes/archive/YYYY-MM-DD-backend-and-admin-fixes/proposal.md` (filesystem)

**Decisions (all user-confirmed)**:
- A. Cookie signing: **server-side session table** (UUID token, looked up in `admin_sessions`). `SESSION_SECRET` env var removed.
- B. Demo Bypass: **gated** behind `VITE_DEMO_MODE === 'true'`.
- C. SettingsPanel: **per-section Save** (4 buttons: contact, branding, hours, reservations).
- D. MenuManager: **hard DELETE** (no soft delete).
- E. Integration tests: **yes, in PR#1** (supertest, gated by `TEST_DATABASE_URL`).
- 1. Skeleton: **no minimum display time** (no flash suppression; render only while genuinely fetching).
- 2. Reservations: **no optimistic insert** (refetch-only).
- 3. Auth query: `staleTime: 5*60_000`, `refetchOnWindowFocus: true`.
- 4. Tests: **3 vitest projects** (client jsdom, server node, server:integration node with skip-when-no-DB).

**PR chain (locked)**:
- PR#1 `feat/server-fixes` (~180 lines) — depends on nothing
- PR#2 `feat/client-auth-rewire` (~120 lines) — depends on PR#1
- PR#3 `feat/reservations-from-query` (~150 lines) — depends on PR#1
- PR#4 `feat/admin-forms-rewires` (~190 lines) — depends on PR#1
- PR#5 `feat/payment-modal-and-ux-polish` (~180 lines) — depends on PR#1

**Review budget**: 5 PRs × ~180 lines avg = all under 400. No need for `ask-always` split.

**Open questions**: NONE — all 5 architecture decisions confirmed by user.

**Risks called out**:
- R1 PR#2↔PR#5 sequencing: PR#2 ships a minimal spinner to avoid unauthenticated flash before PR#5's Skeleton lands.
- R2 Cookie rename invalidates active admin sessions on deploy.
- R3 PR#4 must land after PR#1 (depends on new menu endpoints).
- R4 No-op setters removal in PR#3 changes `ReservationContextType` shape.
- R5 5s timeout may abort long queries (intentional; covered by supertest).
- R6 `TEST_DATABASE_URL` may be unset in CI — integration suite `.skip`s.
- R7 vitest 2-project (then 3-project) shape change.

**Out of scope (re-confirmed)**: undo toast, real payment processor, soft delete, Playwright E2E, `src/lib/bilingual.ts` extraction, `server/db/seed.ts` source change, optimistic reservation insert.

**Next phase**: sdd-spec (delta spec amending `backend-and-admin`).
