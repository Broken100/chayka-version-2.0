# Spec (delta) — backend-and-admin-fixes

> Delta spec amending the existing `backend-and-admin` spec. This is the source delta that was merged into the main spec at `openspec/specs/backend-and-admin/spec.md` on archive.

## Purpose

Delta spec amending the existing `backend-and-admin` spec (engram `sdd/backend-and-admin/spec`). Adds 12 new requirements covering the 12 CRITICALs from the verify report (10 original + 2 newly discovered missing menu endpoints) and modifies 1 requirement (the cookie-auth requirement) to reflect decision A: server-side session table instead of HMAC-signed cookie.

## ADDED Requirements

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

## MODIFIED Requirements

### Requirement: Admin auth uses env-based passwords and a server-side session table

The system MUST validate admin login by checking the submitted password against a comma-separated list in the `ADMIN_PASSWORDS` env var. On success, the server MUST validate the password, create a row in the `admin_sessions` table, and set a cookie named `chayka_admin_session` with `httpOnly`, `sameSite=lax`, and a 24-hour expiry. The cookie value MUST be a UUID token that the server looks up in the `admin_sessions` table on every protected request.

(Previously: cookie was stateless, validated via HMAC signature ("signed cookie"). Now stateful, validated against the `admin_sessions` table; cookie value is the session token, not a signed payload. Free revocation; `SESSION_SECRET` env var is no longer required.)

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

## REMOVED Requirements

None.

## RENAMED Requirements

None.
