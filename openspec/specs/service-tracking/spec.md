# Spec: service-tracking

> **Source of truth** for the Chayka Coffee v2.0 reservation service lifecycle.
> Last merged from delta: `admin-polish-and-extras` (2026-06-15) — PR#4.

## Purpose

Add a service lifecycle to reservations that is orthogonal to the kanban `status` (which tracks admin workflow: pending → confirmed → cancelled). The new `service_status` tracks what the customer is physically doing on premises: not checked in yet → checked in → being served → done. Three timestamp columns capture when each transition happened, and three admin actions drive the transitions explicitly — no auto-timer, no background job.

## Requirements

### Requirement: Reservations carry a service_status and three timestamps

The `reservations` table MUST have a `service_status` column of type enum (`not_checked_in`, `checked_in`, `in_service`, `completed`) defaulting to `not_checked_in`, plus three nullable timestamp columns: `checked_in_at`, `service_started_at`, `service_completed_at`. The enum MUST be added without altering any existing enum values.

#### Scenario: New column is present

- GIVEN the migration has run
- WHEN an admin inspects the `reservations` schema
- THEN the four new columns MUST exist with the right types and defaults

#### Scenario: Existing rows default to not_checked_in

- GIVEN the migration just ran on a table with 10 existing rows
- WHEN the admin queries any of them
- THEN `service_status` MUST equal `not_checked_in` and all three timestamp columns MUST be `null`

### Requirement: Admin can check in, start service, and complete service

The system MUST accept `POST /api/admin/reservations/:id/checkin`, `POST /api/admin/reservations/:id/start-service`, and `POST /api/admin/reservations/:id/complete-service`. Each endpoint MUST set the corresponding timestamp AND transition the `service_status` enum. All three MUST require an active admin session. All three MUST return HTTP 200 with the updated reservation; HTTP 404 if the reservation does not exist. Calling an action that is invalid for the current state MUST return HTTP 409.

#### Scenario: Check-in from not_checked_in

- GIVEN a reservation with `service_status = 'not_checked_in'`
- WHEN `POST /api/admin/reservations/<id>/checkin` is called
- THEN the response MUST be HTTP 200, `service_status` MUST equal `checked_in`, and `checked_in_at` MUST be set to the current time

#### Scenario: Start service from checked_in

- GIVEN a reservation with `service_status = 'checked_in'`
- WHEN `POST /api/admin/reservations/<id>/start-service` is called
- THEN `service_status` MUST equal `in_service` and `service_started_at` MUST be set

#### Scenario: Complete service from in_service

- GIVEN a reservation with `service_status = 'in_service'`
- WHEN `POST /api/admin/reservations/<id>/complete-service` is called
- THEN `service_status` MUST equal `completed` and `service_completed_at` MUST be set

#### Scenario: Invalid transition returns 409

- GIVEN a reservation with `service_status = 'completed'`
- WHEN `POST /api/admin/reservations/<id>/checkin` is called
- THEN the response MUST be HTTP 409 and `{ "error": "Invalid service transition" }`; no timestamp MUST be updated

### Requirement: KanbanBoard shows a service badge per card

Each Kanban card MUST render a small service badge that reflects the current `service_status` (with a localized label for es/en). The badge MUST use distinct colors: gray for `not_checked_in`, blue for `checked_in`, amber for `in_service`, emerald for `completed`.

#### Scenario: Card shows the badge

- GIVEN a reservation with `service_status = 'in_service'`
- WHEN the Kanban card renders
- THEN a service badge MUST be visible reading "En servicio" (es) / "In service" (en) and rendered with the amber color class

### Requirement: Kanban card exposes three service action buttons

The Kanban card MUST render three buttons — "Check In", "Start Service", "Complete Service" — bound to the three service endpoints. The buttons MUST be disabled (and visually de-emphasized) when the action is invalid for the current `service_status`. The Kanban card MUST NOT auto-transition service status via a timer.

#### Scenario: Buttons reflect valid transitions

- GIVEN a reservation with `service_status = 'checked_in'`
- WHEN the card renders
- THEN the "Check In" button MUST be disabled, "Start Service" MUST be enabled, and "Complete Service" MUST be disabled

#### Scenario: Clicking a valid button fires the endpoint

- GIVEN a reservation with `service_status = 'checked_in'` and the "Start Service" button enabled
- WHEN the admin clicks it
- THEN the system MUST call `POST /api/admin/reservations/<id>/start-service`; on 200, the badge MUST update to "In service" within 1s of the mutation success

### Requirement: AdminPanel shows a "Currently In Service" KPI

`AdminPanel` MUST render a KPI tile in the dashboard header counting reservations where `service_status = 'in_service'`. The tile MUST update within 1s of any service-status change.

#### Scenario: KPI reflects in-service count

- GIVEN 3 reservations have `service_status = 'in_service'`
- WHEN the AdminPanel renders
- THEN the "Currently In Service" tile MUST show `3`
