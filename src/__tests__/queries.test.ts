import { describe, it, expect } from 'vitest';
import { rowToMenuItem, rowToTable, rowToBusinessConfig } from '../lib/queries';

describe('row → domain mappers', () => {
  it('rowToMenuItem unpacks bilingual fields and coerces price', () => {
    const item = rowToMenuItem({
      id: 'espresso',
      nameEs: 'Espresso',
      nameEn: 'Espresso',
      descriptionEs: 'Un shot',
      descriptionEn: 'A shot',
      price: '1.60',
      category: 'hot_drinks',
      image: '/assets/drink_05.jpg',
      fallbackImage: null,
      active: true,
      ingredientsEs: ['Espresso'],
      ingredientsEn: ['Espresso'],
      isSpecial: false,
      preparationTime: 2,
      updatedAt: null
    });

    expect(item.name).toEqual({ es: 'Espresso', en: 'Espresso' });
    expect(item.price).toBe(1.6);
    expect(item.preparationTime).toBe(2);
  });

  it('rowToMenuItem handles nulls with safe defaults', () => {
    const item = rowToMenuItem({
      id: 'x',
      nameEs: 'A',
      nameEn: 'B',
      descriptionEs: null,
      descriptionEn: null,
      price: '0',
      category: 'misc',
      image: null,
      fallbackImage: null,
      active: null,
      ingredientsEs: null,
      ingredientsEn: null,
      isSpecial: null,
      preparationTime: null,
      updatedAt: null
    });
    expect(item.image).toBe('');
    expect(item.ingredients).toEqual({ es: [], en: [] });
    expect(item.active).toBe(true);
    expect(item.preparationTime).toBe(0);
  });

  it('rowToTable unpacks and coerces', () => {
    const t = rowToTable({
      id: 't_deck_1',
      nameEs: 'Mesa',
      nameEn: 'Table',
      capacity: 4,
      area: 'waterfall_deck',
      minimumConsumption: '20.00',
      updatedAt: null
    });
    expect(t.name).toEqual({ es: 'Mesa', en: 'Table' });
    expect(t.minimumConsumption).toBe(20);
  });

  it('rowToBusinessConfig handles nulls with empty defaults', () => {
    const c = rowToBusinessConfig({
      id: 1,
      name: null,
      location: null,
      locationLink: null,
      whatsappNumber: null,
      minPeopleReservation: null,
      maxPeopleReservation: null,
      schedules: null,
      timeSlots: null,
      transferQrUrl: null,
      updatedAt: null
    });
    expect(c.name).toBe('');
    expect(c.minPeopleReservation).toBe(1);
    expect(c.maxPeopleReservation).toBe(10);
    expect(c.timeSlots).toEqual([]);
    expect(c.transferQrUrl).toBeNull();
  });
});
