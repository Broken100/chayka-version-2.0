import { describe, it, expect } from 'vitest';
import { simulatePaymentSchema, createMenuItemSchema } from '../validation.js';

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
