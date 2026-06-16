import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { createElement, type ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  buildWhatsAppMessage,
  buildWhatsappUrl,
  useSendWhatsappLink
} from '../whatsapp';
import { ReservationProvider } from '../../context/ReservationContext';

const SAMPLE_RES = { id: 'RES-123456' };
const SAMPLE_RES_2 = { id: 'RES-654321' };

// ─── buildWhatsAppMessage ───────────────────────────────────────────────────

describe('buildWhatsAppMessage — bilingual templates (Req 1)', () => {
  it('renders the Card / Spanish template verbatim with the reservation id', () => {
    expect(
      buildWhatsAppMessage({
        paymentMethod: 'card',
        language: 'es',
        reservation: SAMPLE_RES
      })
    ).toBe('Confirmación de reserva RES-123456. Pago con tarjeta aprobado. ¡Gracias!');
  });

  it('renders the Card / English template verbatim with the reservation id', () => {
    expect(
      buildWhatsAppMessage({
        paymentMethod: 'card',
        language: 'en',
        reservation: SAMPLE_RES
      })
    ).toBe('Reservation RES-123456 confirmed. Card payment approved. Thank you!');
  });

  it('renders the Cash / Spanish template verbatim', () => {
    expect(
      buildWhatsAppMessage({
        paymentMethod: 'cash',
        language: 'es',
        reservation: SAMPLE_RES
      })
    ).toBe(
      'Reserva RES-123456 confirmada. Recuerda llevar efectivo para tu consumo. ¡Te esperamos!'
    );
  });

  it('renders the Cash / English template verbatim', () => {
    expect(
      buildWhatsAppMessage({
        paymentMethod: 'cash',
        language: 'en',
        reservation: SAMPLE_RES
      })
    ).toBe(
      'Reservation RES-123456 confirmed. Remember to bring cash for your consumption. See you soon!'
    );
  });

  it('renders the Transfer / Spanish template verbatim', () => {
    expect(
      buildWhatsAppMessage({
        paymentMethod: 'transfer',
        language: 'es',
        reservation: SAMPLE_RES
      })
    ).toBe(
      'Reserva RES-123456 confirmada. Realiza la transferencia a Chayka Coffee. ¡Gracias!'
    );
  });

  it('renders the Transfer / English template verbatim', () => {
    expect(
      buildWhatsAppMessage({
        paymentMethod: 'transfer',
        language: 'en',
        reservation: SAMPLE_RES_2
      })
    ).toBe(
      'Reservation RES-654321 confirmed. Make the transfer to Chayka Coffee. Thank you!'
    );
  });

  it('falls back to Spanish when the language is not "es" or "en"', () => {
    const out = buildWhatsAppMessage({
      paymentMethod: 'card',
      language: 'fr' as never,
      reservation: SAMPLE_RES
    });
    expect(out).toBe(
      'Confirmación de reserva RES-123456. Pago con tarjeta aprobado. ¡Gracias!'
    );
  });

  it('falls back to Spanish for an empty string language', () => {
    const out = buildWhatsAppMessage({
      paymentMethod: 'cash',
      language: '',
      reservation: SAMPLE_RES
    });
    expect(out).toBe(
      'Reserva RES-123456 confirmada. Recuerda llevar efectivo para tu consumo. ¡Te esperamos!'
    );
  });
});

// ─── buildWhatsappUrl ───────────────────────────────────────────────────────

describe('buildWhatsappUrl — digit sanitization (Req 2)', () => {
  it('strips the leading "+" from an E.164 number', () => {
    const url = buildWhatsappUrl('hi', '+593987163354');
    expect(url.startsWith('https://wa.me/593987163354?text=')).toBe(true);
  });

  it('strips spaces, dashes, and parentheses from a human-formatted number', () => {
    const url = buildWhatsappUrl('hi', '+593 98-716-3354');
    expect(url).toBe('https://wa.me/593987163354?text=hi');
  });

  it('URL-encodes special characters in the message', () => {
    const url = buildWhatsappUrl('¡Hola! Reserva confirmada.', '+593987163354');
    // ¡, !, spaces, and . all get percent-encoded
    expect(url).toBe(
      'https://wa.me/593987163354?text=%C2%A1Hola!%20Reserva%20confirmada.'
    );
  });

  it('returns a well-formed wa.me URL with no "+" or separators in the path', () => {
    const url = buildWhatsappUrl('test', '+1 (415) 555-2671');
    const path = url.split('?')[0];
    expect(path).toBe('https://wa.me/14155552671');
  });

  it('always returns the wa.me host (no api.whatsapp.com or any other domain)', () => {
    const url = buildWhatsappUrl('x', '+593987163354');
    expect(url.startsWith('https://wa.me/')).toBe(true);
  });
});

// ─── useSendWhatsappLink ────────────────────────────────────────────────────

/**
 * Wraps the hook under test with a fresh `QueryClient` (so the
 * `ReservationProvider`'s `useMenuQuery` etc. don't blow up) and a
 * `ReservationProvider` whose language is pinned via `localStorage`.
 */
function makeWrapper(lang: 'es' | 'en') {
  window.localStorage.setItem('chayka_language', lang);
  return function Wrapper({ children }: { children: ReactNode }) {
    const client = new QueryClient({
      defaultOptions: { queries: { retry: false, gcTime: 0 } }
    });
    return createElement(
      QueryClientProvider,
      { client },
      createElement(ReservationProvider, null, children)
    );
  };
}

describe('useSendWhatsappLink — browser-side dispatch (Req 3, Req 5)', () => {
  let openSpy: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    openSpy = vi.fn();
    // Replace window.open for the duration of each test
    vi.stubGlobal('open', openSpy);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('opens a wa.me URL in a new tab with the card/es template', () => {
    const { result } = renderHook(() => useSendWhatsappLink(), {
      wrapper: makeWrapper('es')
    });
    result.current({
      paymentMethod: 'card',
      reservationId: 'RES-123456',
      whatsappNumber: '+593987163354'
    });
    expect(openSpy).toHaveBeenCalledTimes(1);
    const [url, target] = openSpy.mock.calls[0] as [string, string];
    expect(target).toBe('_blank');
    expect(url.startsWith('https://wa.me/593987163354?text=')).toBe(true);
    // The text segment must URL-decode back to the Spanish card template
    const text = decodeURIComponent(url.split('?text=')[1] ?? '');
    expect(text).toBe(
      'Confirmación de reserva RES-123456. Pago con tarjeta aprobado. ¡Gracias!'
    );
  });

  it('opens the transfer/en template when the current language is English', () => {
    const { result } = renderHook(() => useSendWhatsappLink(), {
      wrapper: makeWrapper('en')
    });
    result.current({
      paymentMethod: 'transfer',
      reservationId: 'RES-654321',
      whatsappNumber: '+593987163354'
    });
    const [url] = openSpy.mock.calls[0] as [string, string];
    const text = decodeURIComponent(url.split('?text=')[1] ?? '');
    expect(text).toBe(
      'Reservation RES-654321 confirmed. Make the transfer to Chayka Coffee. Thank you!'
    );
  });

  it('opens the cash template with proper URL encoding (spaces + accents)', () => {
    const { result } = renderHook(() => useSendWhatsappLink(), {
      wrapper: makeWrapper('es')
    });
    result.current({
      paymentMethod: 'cash',
      reservationId: 'RES-1',
      whatsappNumber: '+5491112345678'
    });
    const [url] = openSpy.mock.calls[0] as [string, string];
    expect(url).toContain('https://wa.me/5491112345678?text=');
    // ¡ should be percent-encoded as %C2%A1
    expect(url).toContain('%C2%A1');
  });

  it('strips the leading "+" from the number before composing the URL', () => {
    const { result } = renderHook(() => useSendWhatsappLink(), {
      wrapper: makeWrapper('en')
    });
    result.current({
      paymentMethod: 'cash',
      reservationId: 'RES-9',
      whatsappNumber: '+1 415 555 2671'
    });
    const [url] = openSpy.mock.calls[0] as [string, string];
    // No "+" or spaces in the path
    expect(url.startsWith('https://wa.me/14155552671?text=')).toBe(true);
  });
});

// ─── Static analysis: no server calls / no mutations (D2) ──────────────────

/**
 * Strip block + line comments so JSDoc chatter doesn't trip the static checks.
 * The module under test describes the *contract* ("we don't do X") in comments
 * — those references are intentional, not real code, and must be ignored.
 */
function stripComments(src: string): string {
  return src
    .replace(/\/\*[\s\S]*?\*\//g, '') // block comments (incl. JSDoc)
    .replace(/^\s*\/\/.*$/gm, ''); // line comments
}

describe('whatsapp.ts static-analysis — no network / no mutations (D2)', () => {
  const source = stripComments(
    readFileSync(resolve(__dirname, '..', 'whatsapp.ts'), 'utf8')
  );

  it('does not import or call fetch()', () => {
    expect(source).not.toMatch(/from\s+['"]node:fetch['"]/);
    expect(source).not.toMatch(/import\s+.*\bfetch\b/);
    expect(source).not.toMatch(/[^\w$]fetch\s*\(/);
  });

  it('does not reference XMLHttpRequest', () => {
    expect(source).not.toMatch(/XMLHttpRequest/);
  });

  it('does not import any TanStack Query mutation hook', () => {
    // Reject any useMutation symbol, mutationFn option, or call to useMutation().
    expect(source).not.toMatch(/\buseMutation\b/);
    expect(source).not.toMatch(/\bmutationFn\b/);
  });

  it('does not import the api wrapper (D2: no backend integration)', () => {
    expect(source).not.toMatch(/from\s+['"]\.\/api['"]/);
    expect(source).not.toMatch(/from\s+['"]\.\.\/lib\/api['"]/);
  });

  it('does not import the mutations module (D2: no TanStack mutations)', () => {
    expect(source).not.toMatch(/from\s+['"]\.\/mutations['"]/);
    expect(source).not.toMatch(/from\s+['"]\.\.\/lib\/mutations['"]/);
  });

  it('does not reference any non-wa.me host', () => {
    // Defense-in-depth: the URL builder must use wa.me only.
    expect(source).not.toMatch(/api\.whatsapp\.com/);
    expect(source).not.toMatch(/graph\.facebook\.com/);
    expect(source).not.toMatch(/twilio\.com/);
  });
});
