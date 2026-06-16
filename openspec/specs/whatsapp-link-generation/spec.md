# Spec: whatsapp-link-generation

> **Source of truth** for the Chayka Coffee v2.0 client-side WhatsApp link generation flow.
> Last merged from delta: `admin-polish-and-extras` (2026-06-15) — PR#5.

## Purpose

Replace the current single getWhatsAppLink() blob inside `BookingSection` with a per-payment-method templating layer that produces a tight, bilingual message per method (card / cash / transfer). Surface a primary "Enviar a WhatsApp" button on BookingSection's Step 4 AND a "Reenviar WhatsApp" button on every KanbanBoard card. Delivery stays 100% client-side (per D2): the admin's browser opens `wa.me/<number>?text=...`.

## Requirements

### Requirement: Per-payment-method message templates are bilingual and parameterized

The system MUST provide a pure `buildWhatsAppMessage(args)` helper that returns a localized message based on `(paymentMethod, language, reservation)`. The system MUST define at least these three templates, all parameterizing `{id}` (the reservation id):

- **Card** (es): "Confirmación de reserva {id}. Pago con tarjeta aprobado. ¡Gracias!"
- **Card** (en): "Reservation {id} confirmed. Card payment approved. Thank you!"
- **Cash** (es): "Reserva {id} confirmada. Recuerda llevar efectivo para tu consumo. ¡Te esperamos!"
- **Cash** (en): "Reservation {id} confirmed. Remember to bring cash for your consumption. See you soon!"
- **Transfer** (es): "Reserva {id} confirmada. Realiza la transferencia a Chayka Coffee. ¡Gracias!"
- **Transfer** (en): "Reservation {id} confirmed. Make the transfer to Chayka Coffee. Thank you!"

If the language is not `es` or `en`, the template MUST default to `es`.

#### Scenario: Card template in Spanish

- GIVEN a reservation with `id = 'RES-123456'` and `paymentStatus = 'success'`
- WHEN `buildWhatsAppMessage({ paymentMethod: 'card', language: 'es', reservation })` is called
- THEN the returned string MUST equal "Confirmación de reserva RES-123456. Pago con tarjeta aprobado. ¡Gracias!"

#### Scenario: Transfer template in English

- GIVEN a reservation with `id = 'RES-654321'` and `paymentMethod = 'transfer'`
- WHEN the helper is called with `language: 'en'`
- THEN the returned string MUST equal "Reservation RES-654321 confirmed. Make the transfer to Chayka Coffee. Thank you!"

### Requirement: The helper builds a wa.me URL

The helper MUST compose `https://wa.me/<digits>?text=<urlencoded>` where `<digits>` is `businessConfig.whatsappNumber` with all non-digit characters removed (must already be E.164 per D6 / image-uploads spec). The number MUST NOT contain `+` or any separator in the final URL path.

#### Scenario: wa.me URL is well-formed

- GIVEN `businessConfig.whatsappNumber = "+593987163354"`
- WHEN the helper is called with the card/es template
- THEN the returned URL MUST start with `https://wa.me/593987163354?text=` and the text segment MUST be the URL-encoded template

#### Scenario: Phone number is sanitized

- GIVEN `businessConfig.whatsappNumber = "+593 98-716-3354"`
- WHEN the helper builds the URL
- THEN the phone segment MUST be `593987163354` (digits only) and the URL MUST parse as a valid wa.me link

### Requirement: BookingSection Step 4 surfaces a primary "Enviar a WhatsApp" button

`StepSummary` (rendered on Step 4) MUST render the "Enviar a WhatsApp" anchor as the primary visual CTA when a `completedBooking` exists, using the helper's per-method template. The clipboard-fallback "Copy Receipt" button MUST remain. The primary button MUST be an `<a target="_blank" rel="noopener noreferrer">` so the admin's browser opens the wa.me URL in a new tab.

#### Scenario: Primary button opens wa.me

- GIVEN the customer just paid with `card` and reached Step 4
- WHEN the admin clicks "Enviar a WhatsApp"
- THEN the browser MUST open a new tab whose URL starts with `https://wa.me/` and contains the card/es template text

#### Scenario: Cash payment uses cash template

- GIVEN `completedBooking.paymentStatus === 'unpaid'` (cash at venue)
- WHEN the admin clicks "Enviar a WhatsApp"
- THEN the wa.me URL's text segment MUST be the URL-encoded cash template

### Requirement: KanbanBoard exposes a "Reenviar WhatsApp" button per card

`KanbanBoard` MUST render a "Reenviar WhatsApp" / "Resend WhatsApp" button on every reservation card. Clicking the button MUST open a wa.me URL in a new tab using the helper with the reservation's payment method, the current `language`, and `businessConfig.whatsappNumber`.

#### Scenario: Card button is present on every card

- GIVEN the Kanban board renders 5 reservation cards
- WHEN the DOM is inspected
- THEN at least 5 "Reenviar WhatsApp" buttons MUST be visible (one per card)

#### Scenario: Resend opens the wa.me URL

- GIVEN a card with payment method `transfer` and the admin's language is `en`
- WHEN the admin clicks "Reenviar WhatsApp"
- THEN the browser MUST open a new tab whose URL's text segment is the URL-encoded transfer/en template

### Requirement: WhatsApp link generation makes no server calls

The `buildWhatsAppMessage` helper and both button handlers MUST NOT call `fetch`, `XMLHttpRequest`, or any TanStack Query mutation. Delivery is 100% browser-side (D2): the admin's browser opens `wa.me/...` directly. No Cloud API client, no Twilio client, no env var reads on the frontend.

#### Scenario: No network calls during generation

- GIVEN a clean dev-tools network panel
- WHEN the admin clicks "Enviar a WhatsApp" or "Reenviar WhatsApp"
- THEN the network panel MUST show zero new XHR / fetch requests from the app before the new tab opens
