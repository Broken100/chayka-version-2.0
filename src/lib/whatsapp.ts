/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * PR#5: Client-side WhatsApp link generation (D2 — wa.me only).
 *
 * No backend, no third-party SDK, no env vars, no server changes. The browser
 * opens `https://wa.me/<digits>?text=<encoded>` directly and the OS hands the
 * URL to the WhatsApp app / web client.
 *
 * Templates are stored as constants below; if a language other than `es` / `en`
 * is passed the function falls back to Spanish (D2 / spec Req 1).
 */

import { useCallback } from 'react';
import { useReservation } from '../context/ReservationContext';

export type WhatsappPaymentMethod = 'card' | 'transfer' | 'cash';

/**
 * Bilingual message templates. The `{id}` placeholder is replaced with the
 * reservation id at call time. Strings are kept tight on purpose — the wa.me
 * URL length budget is shared with the encoded message and the browser limit
 * is ~2,000 chars.
 */
const TEMPLATES: Record<WhatsappPaymentMethod, { es: string; en: string }> = {
  card: {
    es: 'Confirmación de reserva {id}. Pago con tarjeta aprobado. ¡Gracias!',
    en: 'Reservation {id} confirmed. Card payment approved. Thank you!'
  },
  cash: {
    es: 'Reserva {id} confirmada. Recuerda llevar efectivo para tu consumo. ¡Te esperamos!',
    en: 'Reservation {id} confirmed. Remember to bring cash for your consumption. See you soon!'
  },
  transfer: {
    es: 'Reserva {id} confirmada. Realiza la transferencia a Chayka Coffee. ¡Gracias!',
    en: 'Reservation {id} confirmed. Make the transfer to Chayka Coffee. Thank you!'
  }
};

/**
 * Build a localized, per-payment-method WhatsApp message for a reservation.
 *
 * Unknown languages fall back to Spanish. The reservation only needs its `id`
 * — the rest of the booking context is irrelevant to this short message.
 */
export function buildWhatsAppMessage(args: {
  paymentMethod: WhatsappPaymentMethod;
  language: 'es' | 'en' | string;
  reservation: { id: string };
}): string {
  const lang = args.language === 'en' ? 'en' : 'es';
  const template = TEMPLATES[args.paymentMethod][lang];
  return template.replace('{id}', args.reservation.id);
}

/**
 * Build a `wa.me` URL from a message and an E.164 phone number.
 *
 * All non-digit characters are stripped from the phone so upstream callers can
 * pass the value as it sits in the DB (`+593987163354`, with spaces, dashes,
 * or a leading `+`). The final URL path contains digits only.
 */
export function buildWhatsappUrl(message: string, whatsappNumber: string): string {
  const digits = whatsappNumber.replace(/\D/g, '');
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}

export interface SendWhatsappLinkParams {
  paymentMethod: WhatsappPaymentMethod;
  reservationId: string;
  whatsappNumber: string;
}

/**
 * React hook that returns a function to open the wa.me URL for a reservation
 * in a new tab. Pure browser-side: no network I/O is initiated by this module
 * — the browser hands the URL to the OS which launches WhatsApp.
 *
 * The current UI language is read from `useReservation()` for the message.
 * The `whatsappNumber` is passed in so unit tests can pin it deterministically
 * and so the KanbanBoard can supply the admin's business config number.
 */
export function useSendWhatsappLink(): (params: SendWhatsappLinkParams) => void {
  const { language } = useReservation();
  return useCallback(
    ({ paymentMethod, reservationId, whatsappNumber }: SendWhatsappLinkParams) => {
      const message = buildWhatsAppMessage({
        paymentMethod,
        language,
        reservation: { id: reservationId }
      });
      const url = buildWhatsappUrl(message, whatsappNumber);
      // `noopener` is implied by `window.open`'s second arg ('_blank') in modern
      // browsers, but the link rendered in StepSummary also carries an explicit
      // `rel="noopener noreferrer"` for clarity.
      window.open(url, '_blank');
    },
    [language]
  );
}
