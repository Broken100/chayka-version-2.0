import { describe, it, expect } from 'vitest';
import {
  simulatePaymentSchema,
  createMenuItemSchema,
  updateBusinessConfigSchema,
  createReservationSchema
} from '../validation.js';

describe('simulatePaymentSchema', () => {
  it('accepts a valid card payment', () => {
    const parsed = simulatePaymentSchema.safeParse({ method: 'card', amount: 10 });
    expect(parsed.success).toBe(true);
  });

  it('accepts a transfer with reference', () => {
    const parsed = simulatePaymentSchema.safeParse({
      method: 'transfer',
      amount: 50,
      reference: 'TR-001'
    });
    expect(parsed.success).toBe(true);
  });

  it('accepts cash without reference', () => {
    const parsed = simulatePaymentSchema.safeParse({ method: 'cash', amount: 1 });
    expect(parsed.success).toBe(true);
  });

  it('rejects an unknown payment method', () => {
    const parsed = simulatePaymentSchema.safeParse({ method: 'crypto', amount: 10 });
    expect(parsed.success).toBe(false);
  });

  it('rejects a non-positive amount', () => {
    const parsed = simulatePaymentSchema.safeParse({ method: 'cash', amount: 0 });
    expect(parsed.success).toBe(false);
  });
});

describe('createMenuItemSchema', () => {
  it('accepts a minimal valid payload', () => {
    const parsed = createMenuItemSchema.safeParse({
      id: 'espresso',
      name: { es: 'Espresso', en: 'Espresso' },
      price: 1.6,
      category: 'hot_drinks'
    });
    expect(parsed.success).toBe(true);
  });

  it('accepts a full payload with optional fields', () => {
    const parsed = createMenuItemSchema.safeParse({
      id: 'special_latte',
      name: { es: 'Latte Especial', en: 'Special Latte' },
      description: { es: 'Una delicia', en: 'A delight' },
      price: 3.5,
      category: 'hot_drinks',
      image: '/assets/latte.jpg',
      active: true,
      ingredients: { es: ['Leche', 'Espresso'], en: ['Milk', 'Espresso'] },
      isSpecial: true,
      preparationTime: 5
    });
    expect(parsed.success).toBe(true);
  });

  it('rejects a missing id', () => {
    const parsed = createMenuItemSchema.safeParse({
      name: { es: 'X', en: 'Y' },
      price: 1,
      category: 'c'
    });
    expect(parsed.success).toBe(false);
  });

  it('rejects a non-positive price', () => {
    const parsed = createMenuItemSchema.safeParse({
      id: 'a',
      name: { es: 'X', en: 'Y' },
      price: -1,
      category: 'c'
    });
    expect(parsed.success).toBe(false);
  });

  it('rejects a missing category', () => {
    const parsed = createMenuItemSchema.safeParse({
      id: 'a',
      name: { es: 'X', en: 'Y' },
      price: 1
    });
    expect(parsed.success).toBe(false);
  });

  it('rejects a missing Spanish name', () => {
    const parsed = createMenuItemSchema.safeParse({
      id: 'a',
      name: { en: 'Y' },
      price: 1,
      category: 'c'
    });
    expect(parsed.success).toBe(false);
  });

  it('rejects a missing English name', () => {
    const parsed = createMenuItemSchema.safeParse({
      id: 'a',
      name: { es: 'X' },
      price: 1,
      category: 'c'
    });
    expect(parsed.success).toBe(false);
  });
});

describe('E.164 phone validation (D6 / D10)', () => {
  describe('whatsappNumber (updateBusinessConfigSchema)', () => {
    it('accepts a valid E.164 number', () => {
      const parsed = updateBusinessConfigSchema.safeParse({
        whatsappNumber: '+593987163354'
      });
      expect(parsed.success).toBe(true);
    });

    it('accepts the minimum-length E.164 number (8 digits)', () => {
      const parsed = updateBusinessConfigSchema.safeParse({
        whatsappNumber: '+12345678'
      });
      expect(parsed.success).toBe(true);
    });

    it('accepts the maximum-length E.164 number (15 digits)', () => {
      const parsed = updateBusinessConfigSchema.safeParse({
        whatsappNumber: '+123456789012345'
      });
      expect(parsed.success).toBe(true);
    });

    it('rejects a number without the leading +', () => {
      const parsed = updateBusinessConfigSchema.safeParse({
        whatsappNumber: '0987163354'
      });
      expect(parsed.success).toBe(false);
    });

    it('rejects a number with spaces, dashes, or parentheses', () => {
      const parsed = updateBusinessConfigSchema.safeParse({
        whatsappNumber: '+593 98-716-3354'
      });
      expect(parsed.success).toBe(false);
    });

    it('rejects a number that is too short (<8 digits)', () => {
      const parsed = updateBusinessConfigSchema.safeParse({
        whatsappNumber: '+1234567'
      });
      expect(parsed.success).toBe(false);
    });

    it('rejects a number that is too long (>15 digits)', () => {
      const parsed = updateBusinessConfigSchema.safeParse({
        whatsappNumber: '+1234567890123456'
      });
      expect(parsed.success).toBe(false);
    });

    it('rejects a number containing letters', () => {
      const parsed = updateBusinessConfigSchema.safeParse({
        whatsappNumber: '+59398ABC1234'
      });
      expect(parsed.success).toBe(false);
    });
  });

  describe('customerPhone (createReservationSchema)', () => {
    const baseReservation = {
      customerName: 'Alice',
      customerEmail: 'alice@example.com',
      date: '2026-07-15',
      timeSlot: '10:00',
      tableId: 't1',
      area: 'waterfall_deck' as const,
      guestsCount: 2
    };

    it('accepts a valid E.164 phone', () => {
      const parsed = createReservationSchema.safeParse({
        ...baseReservation,
        customerPhone: '+593987163354'
      });
      expect(parsed.success).toBe(true);
    });

    it('rejects a phone without the leading +', () => {
      const parsed = createReservationSchema.safeParse({
        ...baseReservation,
        customerPhone: '987163354'
      });
      expect(parsed.success).toBe(false);
    });

    it('rejects a phone with spaces, dashes, or parentheses', () => {
      const parsed = createReservationSchema.safeParse({
        ...baseReservation,
        customerPhone: '+593 (98) 716-3354'
      });
      expect(parsed.success).toBe(false);
    });

    it('rejects a phone that is too short', () => {
      const parsed = createReservationSchema.safeParse({
        ...baseReservation,
        customerPhone: '+1234567'
      });
      expect(parsed.success).toBe(false);
    });

    it('rejects a phone that is too long', () => {
      const parsed = createReservationSchema.safeParse({
        ...baseReservation,
        customerPhone: '+1234567890123456'
      });
      expect(parsed.success).toBe(false);
    });
  });
});
