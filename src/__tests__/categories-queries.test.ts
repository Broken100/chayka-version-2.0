import { describe, it, expect } from 'vitest';
import { rowToMenuCategory, rowToTableArea } from '../lib/queries';

describe('rowToMenuCategory', () => {
  it('unpacks bilingual names and forwards displayOrder + active', () => {
    const c = rowToMenuCategory({
      id: 'hot_drinks',
      nameEs: 'Bebidas Calientes',
      nameEn: 'Hot Drinks',
      displayOrder: 1,
      active: true,
      updatedAt: null
    });
    expect(c.id).toBe('hot_drinks');
    expect(c.name).toEqual({ es: 'Bebidas Calientes', en: 'Hot Drinks' });
    expect(c.displayOrder).toBe(1);
    expect(c.active).toBe(true);
  });

  it('preserves active=false for soft-deleted categories', () => {
    const c = rowToMenuCategory({
      id: 'frappes',
      nameEs: 'Frappés',
      nameEn: 'Frappes',
      displayOrder: 2,
      active: false,
      updatedAt: null
    });
    expect(c.active).toBe(false);
  });
});

describe('rowToTableArea', () => {
  it('unpacks bilingual name and description with safe empty-string fallbacks', () => {
    const a = rowToTableArea({
      id: 'waterfall_deck',
      nameEs: 'Mirador Cascada',
      nameEn: 'Waterfall Deck',
      descriptionEs: 'Brisa y senderos',
      descriptionEn: 'Breeze and paths',
      displayOrder: 1,
      active: true,
      updatedAt: null
    });
    expect(a.id).toBe('waterfall_deck');
    expect(a.name).toEqual({ es: 'Mirador Cascada', en: 'Waterfall Deck' });
    expect(a.description).toEqual({
      es: 'Brisa y senderos',
      en: 'Breeze and paths'
    });
    expect(a.displayOrder).toBe(1);
  });

  it('returns empty description strings when columns are null', () => {
    const a = rowToTableArea({
      id: 'fireplace_cozy',
      nameEs: 'Chimenea',
      nameEn: 'Fireplace',
      descriptionEs: null,
      descriptionEn: null,
      displayOrder: 2,
      active: true,
      updatedAt: null
    });
    expect(a.description).toEqual({ es: '', en: '' });
  });
});
