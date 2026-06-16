# Spec: payment-qr

> **Source of truth** for the Chayka Coffee v2.0 transfer-QR upload and rendering flow.
> Last merged from delta: `admin-polish-and-extras` (2026-06-15) — PR#3.

## Purpose

Add a transfer-QR upload feature so customers paying by bank transfer can scan the merchant's QR code directly from the PaymentModal. The QR image is stored on `business_config.transfer_qr_url` (reusing the PR#2 upload pipeline for the file write). When the customer picks "Transfer" in the PaymentModal, the QR renders above the reference input — but only if the URL is set.

## Requirements

### Requirement: Business config stores a transfer QR URL

The `business_config` table MUST have a nullable `transfer_qr_url` text column. The `GET /api/business-config` response MUST include this field. When unset, the field MUST be `null`.

#### Scenario: Config returns transfer_qr_url when set

- GIVEN `business_config.transfer_qr_url = "/uploads/qr-abc.jpg"`
- WHEN `GET /api/business-config` is called
- THEN the response MUST include `transfer_qr_url: "/uploads/qr-abc.jpg"`

#### Scenario: Config returns null when unset

- GIVEN `business_config.transfer_qr_url IS NULL`
- WHEN `GET /api/business-config` is called
- THEN the response MUST include `transfer_qr_url: null`

### Requirement: Admin can upload a transfer QR

The system MUST accept `POST /api/admin/qr` accepting a single `image/*` file part (≤ 5 MB), persist it via the same multer pipeline as PR#2, and update `business_config.transfer_qr_url` to the returned URL. The endpoint MUST require an active admin session. The previous QR file (if any) MUST be removed from `server/uploads/`.

#### Scenario: First QR upload persists the URL

- GIVEN `business_config.transfer_qr_url` is null
- WHEN `POST /api/admin/qr` is called with a 500 KB PNG
- THEN the server MUST respond HTTP 200 with `{ "transfer_qr_url": "/uploads/<uuid>.png" }` and `business_config.transfer_qr_url` MUST equal that URL

#### Scenario: Re-upload replaces the previous file

- GIVEN the previous QR is at `/uploads/qr-old.png`
- WHEN `POST /api/admin/qr` is called with a new PNG
- THEN `server/uploads/qr-old.png` MUST be removed and `business_config.transfer_qr_url` MUST point to the new file

#### Scenario: Admin can clear the QR

- GIVEN a QR is currently set
- WHEN `DELETE /api/admin/qr` is called
- THEN the file MUST be removed and `business_config.transfer_qr_url` MUST be `null`; the response MUST be HTTP 204

### Requirement: SettingsPanel exposes a "Pagos" section

The `SettingsPanel` MUST render a new "Pagos" / "Payments" section with: a current-QR preview (rendered as `<img src={transfer_qr_url} />` at 200×200), a file input that posts to `/api/admin/qr`, and a "Remove QR" button that calls `DELETE /api/admin/qr`. The section MUST show a placeholder when no QR is set.

#### Scenario: Empty state shows a placeholder

- GIVEN `transfer_qr_url` is null
- WHEN the "Pagos" section renders
- THEN a placeholder rectangle with the text "Sin QR" / "No QR" MUST appear in place of the image

#### Scenario: Removing the QR clears the preview

- GIVEN a QR is set and the admin clicks "Remove QR"
- WHEN the delete mutation succeeds
- THEN the preview MUST disappear and the placeholder MUST render

### Requirement: PaymentModal renders the QR for transfer payments

When the PaymentModal's selected method is `transfer` AND `businessConfig.transfer_qr_url` is a non-empty string, the modal MUST render the QR as a 200×200 `<img>` above the reference-number input. When the method is NOT `transfer` or the URL is empty, the QR MUST NOT render.

#### Scenario: Transfer with QR shows the image

- GIVEN the customer selects "Transfer" and `transfer_qr_url = "/uploads/qr-abc.jpg"`
- WHEN the PaymentModal renders the transfer section
- THEN an `<img>` with `src="/uploads/qr-abc.jpg"` MUST appear above the reference input

#### Scenario: Card method hides the QR

- GIVEN the customer is on the card method
- WHEN the modal renders
- THEN the transfer-QR image MUST NOT be present in the DOM
