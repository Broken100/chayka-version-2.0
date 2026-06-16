# Spec: backend-and-admin (post-archive, merged)

> **Source of truth** for the Chayka Coffee v2.0 backend and admin functionality.
> Last merged from delta: `admin-polish-and-extras` (2026-06-15) — D5 staleTime: 0.

## Purpose

Replace client-side localStorage state with a Neon Postgres + Express API backend, add a server-side simulated payment endpoint, and add admin session auth via a server-side session table (cookie carries an opaque UUID token, looked up in `admin_sessions`). Add TanStack Query to the frontend for data fetching, loading, and error states. Fresh-start migration (no localStorage carryover). Backend service includes a 5-second request timeout, full menu CRUD for admins, and integration test coverage for the highest-risk endpoints.

## Requirements

### Requirement: API server exposes versioned REST endpoints

The backend MUST expose a JSON API under `/api/*` returning UTF-8 responses with `Content-Type: application/json`. All routes MUST respond within 5 seconds or return HTTP 504.

#### Scenario: Unknown route returns 404 JSON

- GIVEN a request to any path not matching a defined route
- WHEN the request reaches the server
- THEN it MUST respond with HTTP 404 and a JSON body `{ "error": "Not Found" }`

### Requirement: Menu items are persisted in the database

The system MUST persist `menu_items` in Postgres and MUST seed the initial catalog from `src/data.ts` on first run. The API MUST expose `GET /api/menu` returning all items.

#### Scenario: GET /api/menu returns all seeded items

- GIVEN the database has been seeded with `INITIAL_PRODUCTS`
- WHEN a client requests `GET /api/menu`
- THEN it MUST respond with HTTP 200 and a JSON array of at least the seeded items

#### Scenario: Empty database returns empty array

- GIVEN the database has no `menu_items` rows
- WHEN a client requests `GET /api/menu`
- THEN it MUST respond with HTTP 200 and an empty JSON array

### Requirement: Tables are persisted in the database

The system MUST persist `tables` in Postgres and MUST seed from `INITIAL_TABLES` on first run. The API MUST expose `GET /api/tables`.

#### Scenario: GET /api/tables returns all seeded tables

- GIVEN the database has been seeded with `INITIAL_TABLES`
- WHEN a client requests `GET /api/tables`
- THEN it MUST respond with HTTP 200 and a JSON array containing all seeded tables

### Requirement: Reservations are persisted on creation

The system MUST create a reservation row when `POST /api/reservations` is called with a valid body. The server MUST generate the `id` as `RES-XXXXXX` (6 random digits) and set `created_at` to the current timestamp.

#### Scenario: Valid reservation creation returns the new id

- GIVEN the request body has `customerName`, `customerEmail`, `customerPhone`, `date`, `timeSlot`, `tableId`, `area`, `guestsCount`
- WHEN `POST /api/reservations` is called
- THEN it MUST respond with HTTP 201 and the created reservation object including the generated `id` and `created_at`

#### Scenario: Missing required field returns 400

- GIVEN the request body omits `customerEmail`
- WHEN `POST /api/reservations` is called
- THEN it MUST respond with HTTP 400 and a JSON body `{ "error": "customerEmail is required" }`

### Requirement: Business config is a single-row entity

The system MUST persist `business_config` as a single row (id=1) and MUST expose `GET /api/business-config` returning the current config.

#### Scenario: GET returns the seeded default

- GIVEN the database has been seeded with `DEFAULT_BUSINESS_CONFIG`
- WHEN `GET /api/business-config` is called
- THEN it MUST respond with HTTP 200 and the config object

#### Scenario: GET with no row returns defaults

- GIVEN the `business_config` table is empty
- WHEN `GET /api/business-config` is called
- THEN it MUST respond with HTTP 200 and a config object built from `DEFAULT_BUSINESS_CONFIG`

### Requirement: Simulated payment endpoint

The system MUST expose `POST /api/payments/simulate` accepting `{ method, amount, reference? }`. Card method with a `reference` starting with `0000` MUST return `{ status: "failed", reason: "Card declined" }`; all other successful payloads return `{ status: "success", reference: "PAY-XXXXXXXXX" }`. Transfer method MUST return HTTP 400 when `reference` is empty or missing. The endpoint MUST respond between 1 and 2 seconds of wall-clock time.

#### Scenario: Card with valid number succeeds

- GIVEN method is `card` and amount is positive
- WHEN `POST /api/payments/simulate` is called
- THEN it MUST respond with HTTP 200 after 1-2s with `{ status: "success", reference: "PAY-XXXXXXXXX" }`

#### Scenario: Card with reference starting 0000 fails

- GIVEN method is `card` and `reference` starts with `0000`
- WHEN `POST /api/payments/simulate` is called
- THEN it MUST respond with HTTP 200 and `{ status: "failed", reason: "Card declined" }`

#### Scenario: Transfer with empty reference is rejected

- GIVEN method is `transfer` and `reference` is empty or missing
- WHEN `POST /api/payments/simulate` is called
- THEN it MUST respond with HTTP 400 and `{ "error": "reference is required" }`

### Requirement: Admin auth uses env-based passwords and a server-side session table

The system MUST validate admin login by checking the submitted password against a comma-separated list in the `ADMIN_PASSWORDS` env var. On success, the server MUST validate the password, create a row in the `admin_sessions` table, and set a cookie named `chayka_admin_session` with `httpOnly`, `sameSite=lax`, and a 24-hour expiry. The cookie value MUST be a UUID token that the server looks up in the `admin_sessions` table on every protected request.

#### Scenario: Correct password sets the cookie

- GIVEN `ADMIN_PASSWORDS=secret1,secret2` is set
- WHEN `POST /api/admin/login` is called with `{ "password": "secret1" }`
- THEN it MUST respond with HTTP 200, set the cookie, and return `{ "ok": true }`

#### Scenario: Wrong password returns 401

- GIVEN `ADMIN_PASSWORDS=secret1,secret2` is set
- WHEN `POST /api/admin/login` is called with `{ "password": "wrong" }`
- THEN it MUST respond with HTTP 401 and `{ "error": "Invalid credentials" }`; the cookie MUST NOT be set

#### Scenario: Admin routes require the cookie

- GIVEN a request to `PUT /api/admin/business-config` has no `chayka_admin_session` cookie
- WHEN the request reaches the server
- THEN it MUST respond with HTTP 401 and `{ "error": "Unauthorized" }`

#### Scenario: Logout clears the cookie

- GIVEN the client has a valid session cookie
- WHEN `POST /api/admin/logout` is called
- THEN it MUST respond with HTTP 200 and set the cookie with `Max-Age=0`

### Requirement: Admin can update business config

The system MUST accept `PUT /api/admin/business-config` with a complete config body and update the single row.

#### Scenario: Valid update persists

- GIVEN the client is authenticated and the body is a valid `BusinessConfig`
- WHEN `PUT /api/admin/business-config` is called
- THEN it MUST respond with HTTP 200 and the updated config

### Requirement: Admin can create, update, and delete tables

The system MUST accept `POST /api/admin/tables`, `PUT /api/admin/tables/:id`, and `DELETE /api/admin/tables/:id` for the admin to manage the table catalog.

#### Scenario: Create table with unique id

- GIVEN the id `t_deck_99` does not exist
- WHEN `POST /api/admin/tables` is called with that id and a valid body
- THEN it MUST respond with HTTP 201 and the created table

#### Scenario: Duplicate id returns 409

- GIVEN the id `t_deck_1` already exists
- WHEN `POST /api/admin/tables` is called with the same id
- THEN it MUST respond with HTTP 409 and `{ "error": "Table id already exists" }`

### Requirement: Admin menu items have full CRUD

The system MUST expose `POST /api/admin/menu` and `DELETE /api/admin/menu/:id` (in addition to the existing `PUT /api/admin/menu/:id`). `POST` MUST validate the body, reject duplicate ids with HTTP 409, and insert the row. `DELETE` MUST return HTTP 404 if no row matches the id, and HTTP 204 on success.

#### Scenario: Create menu item with unique id

- GIVEN the id does not exist in `menu_items`
- WHEN `POST /api/admin/menu` is called with that id and a valid body
- THEN it MUST respond with HTTP 201 and the created menu item

#### Scenario: Duplicate id returns 409

- GIVEN the id already exists in `menu_items`
- WHEN `POST /api/admin/menu` is called with the same id
- THEN it MUST respond with HTTP 409 and `{ "error": "Menu id already exists" }`

#### Scenario: Delete missing id returns 404

- GIVEN the id does not exist in `menu_items`
- WHEN `DELETE /api/admin/menu/:id` is called
- THEN it MUST respond with HTTP 404 and `{ "error": "Menu item not found" }`

### Requirement: Frontend uses TanStack Query for data fetching

The system MUST wrap `GET /api/menu`, `GET /api/tables`, `GET /api/business-config` with `useQuery` and MUST replace the `useState` reads in `ReservationContext` for these resources. The system MUST keep `useState` for `language`, `activeView`, and `notifications` only. The `useBusinessConfigQuery` hook MUST set `staleTime: 0` so admin edits to the business config (WhatsApp number, bank details, QR URL) are reflected in the consuming views within one render of the next mount or focus event, with no 5-minute delay.

#### Scenario: Loading state shows skeleton

- GIVEN `useQuery(['menu'])` is fetching for the first time
- WHEN the data has not yet arrived
- THEN the components that depend on menu MUST render a loading skeleton

#### Scenario: Error state shows retry

- GIVEN the network request failed
- WHEN the error is caught by `useQuery`
- THEN the components MUST render an error message with a retry button

#### Scenario: useBusinessConfigQuery refetches immediately after admin edit

- GIVEN the admin is authenticated and edits `whatsappNumber` via `SettingsPanel` and clicks Save
- WHEN the `PUT /api/admin/business-config` mutation returns 200
- THEN `useBusinessConfigQuery` MUST refetch on the next mount / focus event with no observable delay beyond the network round-trip; the new value MUST be visible in `BookingSection` and `KanbanBoard` within 1 second

### Requirement: Frontend mutations invalidate queries on success

The system MUST wrap `addReservation`, `updateMenuProduct`, `setTables`, and `setBusinessConfig` with `useMutation` and MUST invalidate the relevant query keys on success.

#### Scenario: Adding a reservation refreshes the admin list

- GIVEN the admin is viewing reservations
- WHEN a new reservation is created via mutation
- THEN the reservations list MUST refetch within 1s of the mutation success

### Requirement: Frontend rewires the auth flow

`AdminLogin` MUST call `POST /api/admin/login` via the `useAdminLogin` mutation and MUST NOT validate the password against a local array. `AdminPanel` MUST derive `isAuthenticated` from the `useAdminAuth` query and refetch on focus. The "Direct Access (Demo)" button MUST be gated behind `VITE_DEMO_MODE === 'true'` (see the dedicated demo-mode requirement).

#### Scenario: Submitting a valid password logs the admin in via the API

- GIVEN the user types a password into the login form
- WHEN they click the login button
- THEN the system MUST call `POST /api/admin/login` and, on 200, transition the panel to authenticated view

#### Scenario: Non-2xx response keeps the form open and shows an error

- GIVEN `POST /api/admin/login` returns a non-2xx response
- WHEN the mutation `onError` fires
- THEN the login form MUST display the error message and MUST NOT transition to authenticated view

### Requirement: Frontend rewires the payment flow

`PaymentModal` MUST call `POST /api/payments/simulate` via the `useSimulatePayment` mutation. The modal MUST show a single "Pay" button per payment method. On `status: "failed"` the modal MUST stay open and surface a retry control bound to the same mutation. On `status: "success"` the modal MUST close and the success path MUST receive the server-generated reference.

#### Scenario: Successful card payment closes the modal and surfaces the reference

- GIVEN the user confirms a card payment
- WHEN the mutation resolves with `{ status: "success", reference: "PAY-..." }`
- THEN the modal MUST close and the success path MUST be invoked with the server reference

#### Scenario: Failed card payment keeps the modal open with a retry control

- GIVEN the user confirms a card payment
- WHEN the mutation resolves with `{ status: "failed", reason: "Card declined" }`
- THEN the modal MUST remain open and MUST render a retry control bound to the same mutation

### Requirement: Frontend rewires the admin table form

`TablesManager` MUST call `useCreateTable` for new rows and `useDeleteTable` for removals. The component MUST NOT call any local `setTables` setter; the data flow MUST be query → mutation → invalidation only.

#### Scenario: Adding a new table persists via the API

- GIVEN the admin types a new table id and saves
- WHEN the form submits
- THEN the system MUST call `POST /api/admin/tables`; on 201, the table MUST appear in the rendered list within 1s

#### Scenario: Deleting a table persists via the API

- GIVEN the admin confirms deletion of a table row
- WHEN the delete action fires
- THEN the system MUST call `DELETE /api/admin/tables/:id`; on 204, the row MUST disappear from the rendered list within 1s

### Requirement: Frontend rewires the admin settings and menu forms

`SettingsPanel` MUST call `useUpdateBusinessConfig` once per section via an explicit "Save" button (no live-write, no debounce). `MenuManager` MUST call `useUpdateMenuProduct` for edits, `useCreateMenuProduct` for new rows, and `useDeleteMenuProduct` (hard delete) for removals. None of these components MUST call local `setBusinessConfig` or `setMenuProducts` setters.

#### Scenario: SettingsPanel save persists a section

- GIVEN the admin edits the hours section and clicks its Save button
- WHEN the click handler fires
- THEN the system MUST call `PUT /api/admin/business-config` with that section's payload; on 200, a success toast MUST appear

#### Scenario: MenuManager add persists a new product

- GIVEN the admin types a new menu item id and saves
- WHEN the form submits
- THEN the system MUST call `POST /api/admin/menu`; on 201, the item MUST appear in the list within 1s

#### Scenario: MenuManager delete is a hard delete

- GIVEN the admin confirms deletion of a menu item
- WHEN the delete action fires
- THEN the system MUST call `DELETE /api/admin/menu/:id`; on 204, the row MUST be removed permanently from the list

### Requirement: Reservations are loaded from the API

A new `useReservationsQuery` hook MUST fetch `GET /api/reservations` and expose `{ data, isLoading, isError, refetch }`. `ReservationContext` MUST consume that hook and MUST NOT keep reservations in `useState` or `localStorage`. Consumers (`AdminPanel`, `KanbanBoard`, `BookingSection`) MUST receive reservations from the context and MUST refetch on query invalidation.

#### Scenario: Initial load fetches reservations from the API

- GIVEN the app starts
- WHEN `useReservationsQuery` mounts
- THEN the system MUST call `GET /api/reservations`; the context MUST expose the returned data to consumers

#### Scenario: Creating a reservation refreshes the admin list

- GIVEN the admin is viewing reservations
- WHEN a new reservation is created via mutation
- THEN the reservations list MUST refetch within 1s of the mutation success

### Requirement: API server enforces a 5-second request timeout

The server MUST wrap every request handler with middleware that aborts the response with HTTP 504 `{ "error": "Request timeout" }` if the handler has not completed within 5 seconds.

#### Scenario: Slow handler is aborted with 504

- GIVEN a route handler does not respond within 5 seconds
- WHEN the timeout middleware fires
- THEN the server MUST respond with HTTP 504 and `{ "error": "Request timeout" }`

#### Scenario: Fast handler is unaffected

- GIVEN a route handler responds in 200ms
- WHEN the timeout middleware checks the elapsed time
- THEN the response MUST be passed through unchanged

### Requirement: Loading skeletons show during query fetch

Components that consume `useMenuQuery`, `useTablesQuery`, `useBusinessConfigQuery`, and `useReservationsQuery` MUST render a `Skeleton` primitive while `isLoading` is true. The skeleton MUST match the layout of the rendered content (no full-page spinner).

#### Scenario: Menu view shows skeleton while menu is loading

- GIVEN `useMenuQuery` is fetching for the first time
- WHEN the data has not yet arrived
- THEN the menu surface MUST render `Skeleton` placeholders shaped like menu cards

#### Scenario: Reservations view shows skeleton while reservations are loading

- GIVEN `useReservationsQuery` is fetching for the first time
- WHEN the data has not yet arrived
- THEN the reservations surface MUST render `Skeleton` placeholders shaped like reservation rows

### Requirement: Query errors show a retry UI

Components that consume `useMenuQuery`, `useTablesQuery`, `useBusinessConfigQuery`, and `useReservationsQuery` MUST render a `QueryError` primitive when `isError` is true. The primitive MUST display the error message and a retry button bound to `refetch`.

#### Scenario: Failed menu query shows retry UI

- GIVEN `useMenuQuery` has `isError` true
- WHEN the component renders
- THEN it MUST display `QueryError` with an error message and a retry button

#### Scenario: Clicking retry re-fetches the query

- GIVEN `QueryError` is visible
- WHEN the user clicks the retry button
- THEN the system MUST call `refetch()`; while the refetch is in flight the component MUST render the loading skeleton

### Requirement: Demo mode is explicit and opt-in

The `AdminLogin` "Direct Access (Demo)" button MUST be rendered only when `import.meta.env.VITE_DEMO_MODE === 'true'`. When the env var is unset or holds any other value, the button MUST NOT be rendered.

#### Scenario: Demo button is hidden when the env var is unset

- GIVEN `VITE_DEMO_MODE` is unset or not equal to `'true'`
- WHEN `AdminLogin` renders
- THEN the "Direct Access (Demo)" button MUST NOT be present in the DOM

#### Scenario: Demo button is visible when the env var is set

- GIVEN `VITE_DEMO_MODE === 'true'`
- WHEN `AdminLogin` renders
- THEN the "Direct Access (Demo)" button MUST be present and MUST bypass server auth

### Requirement: Integration tests cover the highest-risk endpoints

The repo MUST include Vitest+supertest integration tests for `POST /api/payments/simulate` and `POST /api/admin/login`. The tests MUST run against a separate test database URL and MUST execute under `npm test`.

#### Scenario: Card success path is covered

- GIVEN a request to `POST /api/payments/simulate` with method `card` and a positive amount
- WHEN the test runs
- THEN it MUST assert HTTP 200 with `{ status: "success", reference: /^PAY-/ }`

#### Scenario: Card 0000 fail path is covered

- GIVEN a request to `POST /api/payments/simulate` with method `card` and a reference starting `0000`
- WHEN the test runs
- THEN it MUST assert HTTP 200 with `{ status: "failed", reason: "Card declined" }`

#### Scenario: Transfer missing reference is covered

- GIVEN a request to `POST /api/payments/simulate` with method `transfer` and no reference
- WHEN the test runs
- THEN it MUST assert HTTP 400

#### Scenario: Admin login correct password is covered

- GIVEN `ADMIN_PASSWORDS` is configured in the test environment
- WHEN `POST /api/admin/login` is called with a valid password
- THEN the test MUST assert HTTP 200, the `chayka_admin_session` cookie is set, and a row exists in `admin_sessions`

#### Scenario: Admin login wrong password is covered

- GIVEN `ADMIN_PASSWORDS` is configured
- WHEN `POST /api/admin/login` is called with an invalid password
- THEN the test MUST assert HTTP 401 and `{ error: "Invalid credentials" }`

#### Scenario: Admin route without cookie is covered

- GIVEN no `chayka_admin_session` cookie is present
- WHEN a request to a protected admin route is sent
- THEN the test MUST assert HTTP 401 and `{ error: "Unauthorized" }`

## REMOVED Requirements

### Requirement: localStorage-based persistence

(Reason: replaced by API persistence; localStorage is no longer the source of truth.)
(Migration: existing localStorage keys are ignored in this phase. Users with cached data will see a fresh database on first load.)

## Coverage notes

- Happy paths: covered for all 6 domains
- Edge cases: duplicate id (tables, menu), missing required fields (reservations, transfer), empty database (menu, config)
- Error states: 401 unauthenticated, 400 invalid input, 404 unknown route / missing item, 409 duplicate, 504 request timeout, 500 server error (implicit)
- Out of scope: real payment processor, customer accounts, email notifications, multi-tenant, real-time updates, production deploy
- Behavioral contracts pinned by tests: `POST /api/payments/simulate` (3 cases), `POST /api/admin/login` (6 cases), 5-second timeout (3 cases), `useAdminAuth`/`useAdminLogin` (5 cases), `VITE_DEMO_MODE` gating (2 cases)

## Change history

| Date | Change | Source delta | Net effect |
|------|--------|--------------|------------|
| 2026-06-14 | Initial spec | `backend-and-admin` (#372) | 11 requirements added; localStorage persistence removed |
| 2026-06-15 | Server-side session table + 5s timeout + menu CRUD + frontend rewires + Skeleton/QueryError + integration tests | `backend-and-admin-fixes` (#388) | 12 requirements added; 1 modified (admin auth) |
| 2026-06-15 | D5: `useBusinessConfigQuery.staleTime: 0` — admin edits to business config reflect in consuming views without 5-minute cache delay | `admin-polish-and-extras` | 1 scenario added to the "Frontend uses TanStack Query for data fetching" requirement (now 3 scenarios) |

**Final requirement count**: 21 active requirements (11 from initial + 12 from delta, with 2 originals replaced by delta versions); the "Frontend uses TanStack Query for data fetching" requirement was extended (not replaced) with 1 additional scenario.
