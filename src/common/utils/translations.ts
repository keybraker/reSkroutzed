import { Language } from '../enums/Language.enum';

type TranslationKey = 'priceHistory.cheap' | 'priceHistory.normal' | 'priceHistory.expensive';

const translations: Record<TranslationKey, Partial<Record<Language, string>>> = {
  'priceHistory.cheap': {
    [Language.ENGLISH]: 'Good price compared to historical price',
    [Language.GREEK]: 'Καλή τιμή σε σχέση με το τελευταίο εξάμηνο',
    // Add other languages as needed
  },
  'priceHistory.normal': {
    [Language.ENGLISH]: 'Average price compared to historical price',
    [Language.GREEK]: 'Κανονική τιμή σε σχέση με το τελευταίο εξάμηνο',
    // Add other languages as needed
  },
  'priceHistory.expensive': {
    [Language.ENGLISH]: 'High price compared to historical price',
    [Language.GREEK]: 'Υψηλή τιμή σε σχέση με το τελευταίο εξάμηνο',
    // Add other languages as needed
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

  return locales[language] || 'en-GB'; // Default to English
}

/**
 * Translate a key to the specified language
 */
export function translate(key: TranslationKey, language: Language): string {
  // Fallback to English if the translation doesn't exist for the requested language
  return translations[key][language] || translations[key][Language.ENGLISH] || '';
}
