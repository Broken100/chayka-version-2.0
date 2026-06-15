import { describe, it, expect } from 'vitest';
import {
  packBilingual,
  unpackBilingual,
  packBilingualList,
  unpackBilingualList
} from '../bilingual.js';

describe('bilingual helpers', () => {
  it('packBilingual returns separate es/en fields', () => {
    expect(packBilingual({ es: 'Hola', en: 'Hello' })).toEqual({ es: 'Hola', en: 'Hello' });
  });

  it('unpackBilingual returns BilingualText with empty string for null', () => {
    expect(unpackBilingual(null, null)).toEqual({ es: '', en: '' });
    expect(unpackBilingual('Hola', 'Hello')).toEqual({ es: 'Hola', en: 'Hello' });
  });

  it('packBilingualList / unpackBilingualList handle arrays', () => {
    const list = { es: ['uno', 'dos'], en: ['one', 'two'] };
    expect(packBilingualList(list)).toEqual({ es: ['uno', 'dos'], en: ['one', 'two'] });
    expect(unpackBilingualList(null, null)).toEqual({ es: [], en: [] });
    expect(unpackBilingualList(['a'], ['b'])).toEqual({ es: ['a'], en: ['b'] });
  });
});
