# Spec: image-uploads

> **Change**: `admin-polish-and-extras` (PR#2)
> **Source proposal**: engram `sdd/admin-polish-and-extras/proposal` (#399)
> **Mode**: hybrid (engram + OpenSpec)

## Purpose

Add an admin-facing image upload pipeline backed by local disk storage. Replaces the free-text image URL field in `MenuManager` with a real file picker, thumbnail preview, upload progress, and delete control. Tighten the existing `whatsappNumber` zod schema to strict E.164 (per D6) so the wa.me link builder can never produce a malformed URL.

## Requirements

### Requirement: Admin can upload image files to local disk

The system MUST accept `POST /api/admin/uploads` accepting a single `multipart/form-data` file part named `file`, with mime type restricted to `image/jpeg`, `image/png`, `image/webp`, and maximum size 5 MB. The server MUST persist the file to `server/uploads/` with a UUID v4 filename plus the original extension. The response MUST be HTTP 201 and JSON `{ "url": "/uploads/<filename>" }`. The endpoint MUST require an active admin session.

#### Scenario: Valid JPEG upload succeeds

- GIVEN the admin is authenticated and submits a 2 MB `image/jpeg` file
- WHEN `POST /api/admin/uploads` is called
- THEN the server MUST respond HTTP 201 with `{ "url": "/uploads/<uuid>.jpg" }` and write the file to `server/uploads/<uuid>.jpg`

#### Scenario: Oversized file is rejected

- GIVEN the admin submits a 6 MB image
- WHEN `POST /api/admin/uploads` is called
- THEN the server MUST respond HTTP 413 and `{ "error": "File too large (max 5 MB)" }`

#### Scenario: Disallowed mime type is rejected

- GIVEN the admin submits a `application/pdf` file
- WHEN `POST /api/admin/uploads` is called
- THEN the server MUST respond HTTP 415 and `{ "error": "Unsupported file type" }`

### Requirement: Admin can delete an uploaded image

The system MUST accept `DELETE /api/admin/uploads/:filename` removing the file from `server/uploads/`. The endpoint MUST require an active admin session. A successful delete MUST return HTTP 204. Deletion of a non-existent file MUST return HTTP 404.

#### Scenario: Existing file is removed

- GIVEN a file `server/uploads/abc-123.jpg` exists
- WHEN `DELETE /api/admin/uploads/abc-123.jpg` is called
- THEN the server MUST respond HTTP 204 and the file MUST be removed from disk

#### Scenario: Missing file returns 404

- GIVEN no file matches the given filename
- WHEN `DELETE /api/admin/uploads/ghost.jpg` is called
- THEN the server MUST respond HTTP 404 and `{ "error": "File not found" }`

### Requirement: Uploaded files are served as static assets

The server MUST mount `server/uploads/` at `GET /uploads/:filename` via `express.static`, returning the file with the original mime type and a 1-year `Cache-Control: public, max-age=31536000` header. Requests for missing files MUST return HTTP 404.

#### Scenario: Public URL serves the file

- GIVEN `server/uploads/abc-123.jpg` exists
- WHEN a browser requests `GET /uploads/abc-123.jpg`
- THEN the server MUST respond HTTP 200 with `Content-Type: image/jpeg` and the file body

### Requirement: MenuManager image picker uses the upload pipeline

`MenuManager` MUST replace its free-text image URL input with a file input that calls `useUploadImage` on change. On successful upload, the form MUST set the image field to the returned `url` and render a thumbnail preview (96×96). The component MUST also expose a "Remove image" button that calls `useDeleteUploadedImage` when the current URL starts with `/uploads/`. The component MUST still accept a pasted absolute URL for the legacy migration path.

#### Scenario: Picking a file uploads and shows a thumbnail

- GIVEN the admin picks a 1 MB JPEG in the MenuManager form
- WHEN the upload mutation succeeds
- THEN the form image field MUST equal the returned `/uploads/<uuid>.jpg` URL and a 96×96 thumbnail MUST render

#### Scenario: Remove button deletes the local file

- GIVEN the current image is `/uploads/abc-123.jpg`
- WHEN the admin clicks "Remove image"
- THEN the system MUST call `DELETE /api/admin/uploads/abc-123.jpg`; on 204, the form image field MUST be cleared

### Requirement: WhatsApp number validation is strict E.164

The `whatsappNumber` field in `updateBusinessConfigSchema` (server) and any frontend input bound to it MUST be validated against the regex `^\+\d{8,15}$` (D6). Invalid numbers MUST be rejected with HTTP 400 (server) or a form-level error (client). The `customerPhone` field in `createReservationSchema` MUST also enforce the same regex (D10).

#### Scenario: Server rejects non-E.164 WhatsApp number

- GIVEN the admin submits `whatsappNumber = "0987163354"` (missing +)
- WHEN `PUT /api/admin/business-config` is called
- THEN the server MUST respond HTTP 400 and `{ "error": "whatsappNumber must be E.164 format" }`

#### Scenario: Server rejects reservation with non-E.164 phone

- GIVEN the body has `customerPhone = "987163354"`
- WHEN `POST /api/reservations` is called
- THEN the server MUST respond HTTP 400 and `{ "error": "customerPhone must be E.164 format" }`

#### Scenario: SettingsPanel uses tel input

- GIVEN the admin opens the Settings panel
- WHEN the WhatsApp input renders
- THEN the input MUST have `type="tel"` and a `pattern="^\\+\\d{8,15}$"` attribute
