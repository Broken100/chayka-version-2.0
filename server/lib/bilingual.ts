export interface BilingualText {
  es: string;
  en: string;
}

export interface BilingualList {
  es: string[];
  en: string[];
}

/**
 * Pack a BilingualText from the API layer into a row for insertion.
 * Returns the row with split `es`/`en` columns.
 */
export function packBilingual(text: BilingualText): { es: string; en: string } {
  return { es: text.es, en: text.en };
}

export function packBilingualList(list: BilingualList): { es: string[]; en: string[] } {
  return { es: list.es, en: list.en };
}

/**
 * Unpack a row with split `es`/`en` columns into a BilingualText.
 * Returns null if both columns are empty.
 */
export function unpackBilingual(es: string | null, en: string | null): BilingualText {
  return {
    es: es ?? '',
    en: en ?? ''
  };
}

export function unpackBilingualList(
  es: string[] | null,
  en: string[] | null
): BilingualList {
  return {
    es: es ?? [],
    en: en ?? []
  };
}
