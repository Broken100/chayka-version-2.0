# Spec: notifications

> **Change**: `admin-polish-and-extras` (PR#4)
> **Source proposal**: engram `sdd/admin-polish-and-extras/proposal` (#399)
> **Mode**: hybrid (engram + OpenSpec)
> **Depends on**: PR#1 (`category-management`) for shared TanStack Query infrastructure

## Purpose

Persist every reservation-related event in a `notifications` table so the admin can audit what happened, when, and why. Two events are wired up (D4): `reservation_created` (fired by `POST /api/reservations`) and `reservation_status_changed` (fired by `PATCH /api/admin/reservations/:id/status`). The admin panel MUST surface a "Notificaciones" tab with a list, read/unread indicators, and a dismiss action.

## Requirements

### Requirement: Notifications are persisted in the database

The system MUST persist `notifications` in Postgres with columns: `id` (bigserial PK), `type` (text, NOT NULL — one of `reservation_created` or `reservation_status_changed`), `title_es` (text, NOT NULL), `title_en` (text, NOT NULL), `body_es` (text, NOT NULL), `body_en` (text, NOT NULL), `source_reservation_id` (text, nullable — references `reservations.id`), `dismissed_at` (timestamp, nullable), `created_at` (timestamp, NOT NULL, default now). The text MUST be stored bilingual per D9.

#### Scenario: Table has the required columns

- GIVEN the migration has run
- WHEN an admin inspects the `notifications` schema
- THEN the columns listed above MUST exist with the right types and nullability

### Requirement: Two events write notification rows

The system MUST insert a notification row in the same transaction (or right after the primary write succeeds) when: (1) `POST /api/reservations` creates a reservation — type `reservation_created`, with title/body summarizing the customer and date; (2) `PATCH /api/admin/reservations/:id/status` succeeds and the new status differs from the previous — type `reservation_status_changed`, with title/body showing old → new status. If the status is unchanged, no row is written.

#### Scenario: POST /api/reservations writes a notification

- GIVEN a valid reservation body
- WHEN `POST /api/reservations` is called and returns 201
- THEN a new `notifications` row MUST exist with `type = 'reservation_created'` and `source_reservation_id` matching the new reservation id

#### Scenario: Status change writes a notification

- GIVEN reservation RES-123456 has `status = 'pending'`
- WHEN `PATCH /api/admin/reservations/RES-123456/status` is called with `{ "status": "confirmed" }`
- THEN a new `notifications` row MUST exist with `type = 'reservation_status_changed'`, `source_reservation_id = 'RES-123456'`, and body showing `pending → confirmed`

#### Scenario: Unchanged status does not write a notification

- GIVEN reservation RES-123456 has `status = 'confirmed'`
- WHEN `PATCH /api/admin/reservations/RES-123456/status` is called with `{ "status": "confirmed" }`
- THEN no new `notifications` row MUST be created (count remains the same)

### Requirement: Admin can list notifications

The system MUST expose `GET /api/admin/notifications?limit=50` (default 50, max 200) returning the most recent rows first, ordered by `created_at DESC`. The endpoint MUST require an active admin session. Unread notifications are those with `dismissed_at IS NULL`.

#### Scenario: GET returns the most recent 50 rows

- GIVEN the table holds 60 notifications
- WHEN `GET /api/admin/notifications` is called
- THEN the response MUST be HTTP 200 and a JSON array of 50 rows in `created_at DESC` order

#### Scenario: Limit query parameter is respected

- GIVEN the table holds 60 notifications
- WHEN `GET /api/admin/notifications?limit=10` is called
- THEN the response MUST be a JSON array of 10 rows

### Requirement: Admin can dismiss a notification

The system MUST accept `POST /api/admin/notifications/:id/dismiss` setting `dismissed_at = now()`. The endpoint MUST require an active admin session and return HTTP 204 on success, HTTP 404 if the id does not exist.

#### Scenario: Dismissing sets dismissed_at

- GIVEN a notification with `dismissed_at IS NULL` exists
- WHEN `POST /api/admin/notifications/<id>/dismiss` is called
- THEN the response MUST be HTTP 204 and the row's `dismissed_at` MUST be set to the current time

#### Scenario: Dismissing missing id returns 404

- GIVEN no row matches the id
- WHEN `POST /api/admin/notifications/99999/dismiss` is called
- THEN the response MUST be HTTP 404 and `{ "error": "Notification not found" }`

### Requirement: AdminPanel "Notificaciones" tab renders the list

`AdminPanel` MUST add a "Notificaciones" tab alongside the existing four. The tab MUST render a `NotificationHistory` list with one row per notification, showing the localized title and body (es/en based on the current language), a relative timestamp, a read/unread indicator (a filled dot when `dismissed_at IS NULL`), and a "Dismiss" button that calls the dismiss mutation. On success, the row MUST visually fade.

#### Scenario: Unread notification shows a dot

- GIVEN a notification with `dismissed_at IS NULL` is in the list
- WHEN the list renders
- THEN that row MUST show a filled dot indicator

#### Scenario: Dismiss button removes the dot

- GIVEN an unread notification is in the list
- WHEN the admin clicks its "Dismiss" button
- THEN the dot MUST disappear within 1s of the mutation success
