import { Language } from '../enums/Language.enum';

/**
 * Translations for button texts and tooltips
 */
export const translations = {
  // Main ReSkroutzed button
  mainToggle: {
    [Language.ENGLISH]: 'ReSkroutzed Options',
    [Language.GREEK]: 'Επιλογές ReSkroutzed',
    [Language.ROMANIAN]: 'Opțiuni ReSkroutzed',
    [Language.BULGARIAN]: 'Опции на ReSkroutzed',
    [Language.GERMAN]: 'ReSkroutzed Optionen',
  },

  // Dark mode toggle
  darkModeOn: {
    [Language.ENGLISH]: 'Switch to Light Mode',
    [Language.GREEK]: 'Αλλαγή σε Φωτεινό Θέμα',
    [Language.ROMANIAN]: 'Comutare la Modul Luminos',
    [Language.BULGARIAN]: 'Превключване към Светъл Режим',
    [Language.GERMAN]: 'Zu hellem Modus wechseln',
  },
  darkModeOff: {
    [Language.ENGLISH]: 'Switch to Dark Mode',
    [Language.GREEK]: 'Αλλαγή σε Σκοτεινό Θέμα',
    [Language.ROMANIAN]: 'Comutare la Modul Întunecat',
    [Language.BULGARIAN]: 'Превключване към Тъмен Режим',
    [Language.GERMAN]: 'Zu dunklem Modus wechseln',
  },

  // Ad toggle
  adHide: {
    [Language.ENGLISH]: 'Hide Ads',
    [Language.GREEK]: 'Απόκρυψη Διαφημίσεων',
    [Language.ROMANIAN]: 'Ascunde Anunțurile',
    [Language.BULGARIAN]: 'Скриване на Реклами',
    [Language.GERMAN]: 'Werbung ausblenden',
  },
  adShow: {
    [Language.ENGLISH]: 'Show Ads',
    [Language.GREEK]: 'Εμφάνιση Διαφημίσεων',
    [Language.ROMANIAN]: 'Afișează Anunțurile',
    [Language.BULGARIAN]: 'Показване на Реклами',
    [Language.GERMAN]: 'Werbung anzeigen',
  },

  // Video toggle
  videoHide: {
    [Language.ENGLISH]: 'Hide Videos',
    [Language.GREEK]: 'Απόκρυψη Βίντεο',
    [Language.ROMANIAN]: 'Ascunde Videoclipurile',
    [Language.BULGARIAN]: 'Скриване на Видеоклипове',
    [Language.GERMAN]: 'Videos ausblenden',
  },
  videoShow: {
    [Language.ENGLISH]: 'Show Videos',
    [Language.GREEK]: 'Εμφάνιση Βίντεο',
    [Language.ROMANIAN]: 'Afișează Videoclipurile',
    [Language.BULGARIAN]: 'Показване на Видеоклипове',
    [Language.GERMAN]: 'Videos anzeigen',
  },

  // Sponsorship toggle
  sponsorshipHide: {
    [Language.ENGLISH]: 'Hide Sponsorships',
    [Language.GREEK]: 'Απόκρυψη Χορηγιών',
    [Language.ROMANIAN]: 'Ascunde Sponsorizările',
    [Language.BULGARIAN]: 'Скриване на Спонсорства',
    [Language.GERMAN]: 'Sponsoring ausblenden',
  },
  sponsorshipShow: {
    [Language.ENGLISH]: 'Show Sponsorships',
    [Language.GREEK]: 'Εμφάνιση Χορηγιών',
    [Language.ROMANIAN]: 'Afișează Sponsorizările',
    [Language.BULGARIAN]: 'Показване на Спонсорства',
    [Language.GERMAN]: 'Sponsoring anzeigen',
  },

  // Shelf product ad toggle
  shelfAdHide: {
    [Language.ENGLISH]: 'Hide Shelf Ads',
    [Language.GREEK]: 'Απόκρυψη Διαφημίσεων Ραφιού',
    [Language.ROMANIAN]: 'Ascunde Anunțurile de Raft',
    [Language.BULGARIAN]: 'Скриване на Реклами на Рафта',
    [Language.GERMAN]: 'Regalwerbung ausblenden',
  },
  shelfAdShow: {
    [Language.ENGLISH]: 'Show Shelf Ads',
    [Language.GREEK]: 'Εμφάνιση Διαφημίσεων Ραφιού',
    [Language.ROMANIAN]: 'Afișează Anunțurile de Raft',
    [Language.BULGARIAN]: 'Показване на Реклами на Рафта',
    [Language.GERMAN]: 'Regalwerbung anzeigen',
  },

  // AI Slop toggle
  aiSlopHide: {
    [Language.ENGLISH]: 'Hide AI Slop',
    [Language.GREEK]: 'Απόκρυψη AI Slop',
    [Language.ROMANIAN]: 'Ascunde AI Slop',
    [Language.BULGARIAN]: 'Скриване на AI Slop',
    [Language.GERMAN]: 'AI Slop ausblenden',
  },
  aiSlopShow: {
    [Language.ENGLISH]: 'Show AI Slop',
    [Language.GREEK]: 'Εμφάνιση AI Slop',
    [Language.ROMANIAN]: 'Afișează AI Slop',
    [Language.BULGARIAN]: 'Показване на AI Slop',
    [Language.GERMAN]: 'AI Slop anzeigen',
  },

  // Price difference
  minimumPriceDifference: {
    [Language.ENGLISH]: 'Minimum Percentage Difference',
    [Language.GREEK]: 'Ελάχιστη ποσοστιαία διαφορά',
    [Language.ROMANIAN]: 'Diferență procentuală minimă',
    [Language.BULGARIAN]: 'Минимална процентна разлика',
    [Language.GERMAN]: 'Minimale prozentuale Differenz',
  },
  minimumPriceDifferencePrompt: {
    [Language.ENGLISH]: 'Minimum percentage difference (%):',
    [Language.GREEK]: 'Ελάχιστη ποσοστιαία διαφορά (%):',
    [Language.ROMANIAN]: 'Diferență procentuală minimă (%):',
    [Language.BULGARIAN]: 'Минимална процентна разлика (%):',
    [Language.GERMAN]: 'Minimale prozentuale Differenz (%):',
  },
};

/**
 * Helper function to get translation text based on language and key
 * @param language Current language
 * @param key Translation key
 * @returns Translated text
 */
export function getTranslation(language: Language, key: keyof typeof translations): string {
  // Default to English if the requested language is not available
  return translations[key][language] || translations[key][Language.ENGLISH];
}

/**
 * Get conditional translation based on state
 * @param language Current language
 * @param condition Boolean condition
 * @param trueKey Key to use when condition is true
 * @param falseKey Key to use when condition is false
 * @returns Translated text based on condition
 */
export function getConditionalTranslation(
  language: Language,
  condition: boolean,
  trueKey: keyof typeof translations,
  falseKey: keyof typeof translations,
): string {
  return condition ? getTranslation(language, trueKey) : getTranslation(language, falseKey);
}

/**
 * Format a text with a value
 * @param text Text with a %s placeholder
 * @param value Value to insert
 * @returns Formatted text
 */
export function formatTranslation(text: string, value: string | number): string {
  return text.replace('%s', value.toString());
}
