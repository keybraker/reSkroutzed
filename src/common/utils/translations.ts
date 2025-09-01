import { Language } from '../enums/Language.enum';

type TranslationKey =
  | 'priceHistory.cheap'
  | 'priceHistory.normal'
  | 'priceHistory.expensive'
  | 'priceHistory.lifetimeCheap'
  | 'priceHistory.lifetimeNormal'
  | 'priceHistory.lifetimeExpensive'
  | 'priceHistory.lifetimeLabel';

const translations: Record<TranslationKey, Partial<Record<Language, string>>> = {
  'priceHistory.cheap': {
    [Language.ENGLISH]: 'Good price compared to historical price',
    [Language.GREEK]: 'Καλή τιμή σε σχέση με το τελευταίο εξάμηνο',
  },
  'priceHistory.normal': {
    [Language.ENGLISH]: 'Average price compared to historical price',
    [Language.GREEK]: 'Κανονική τιμή σε σχέση με το τελευταίο εξάμηνο',
  },
  'priceHistory.expensive': {
    [Language.ENGLISH]: 'High price compared to historical price',
    [Language.GREEK]: 'Υψηλή τιμή σε σχέση με το τελευταίο εξάμηνο',
  },
  'priceHistory.lifetimeCheap': {
    [Language.ENGLISH]: 'Good price compared to entire sales period',
    [Language.GREEK]: 'Καλή τιμή σε σχέση με όλη τη διάρκεια πώλησης',
  },
  'priceHistory.lifetimeNormal': {
    [Language.ENGLISH]: 'Average price compared to entire sales period',
    [Language.GREEK]: 'Μέση τιμή σε σχέση με όλη τη διάρκεια πώλησης',
  },
  'priceHistory.lifetimeExpensive': {
    [Language.ENGLISH]: 'High price compared to entire sales period',
    [Language.GREEK]: 'Υψηλή τιμή σε σχέση με όλη τη διάρκεια πώλησης',
  },
  'priceHistory.lifetimeLabel': {
    [Language.ENGLISH]: 'Lifetime assessment:',
    [Language.GREEK]: 'Αξιολόγηση διάρκειας ζωής:',
  },
};

/**
 * Get localization data for various languages
 */
export function getLocaleForLanguage(language: Language): string {
  const locales: Record<Language, string> = {
    [Language.ENGLISH]: 'en-GB',
    [Language.GREEK]: 'el-GR',
    [Language.ROMANIAN]: 'ro-RO',
    [Language.BULGARIAN]: 'bg-BG',
    [Language.GERMAN]: 'de-DE',
  };

  return locales[language] || 'en-GB';
}

/**
 * Translate a key to the specified language
 */
export function translate(key: TranslationKey, language: Language): string {
  return translations[key][language] || translations[key][Language.ENGLISH] || '';
}

export type { TranslationKey };
