import { Language } from '../../common/enums/Language.enum';

export type StorageValueType = boolean | Language | number | string;

/**
 * Prefix for all storage keys
 */
const STORAGE_KEY_PREFIX = 'RESKROUTZED';

/**
 * Keys for all storage items in the application
 */
export enum StorageKey {
  PRODUCT_AD_VISIBILITY = STORAGE_KEY_PREFIX + '-product-ad-visibility',
  VIDEO_AD_VISIBILITY = STORAGE_KEY_PREFIX + '-video-ad-visibility',
  SPONSORSHIP_VISIBILITY = STORAGE_KEY_PREFIX + '-sponsorship-visibility',
  SHELF_PRODUCT_AD_VISIBILITY = STORAGE_KEY_PREFIX + '-shelf-product-ad-visibility',
  DARK_MODE = STORAGE_KEY_PREFIX + '-dark-mode',
  MINIMUM_PRICE_DIFFERENCE = STORAGE_KEY_PREFIX + '-minimum-difference',
}

/**
 * Default values for storage items
 */
const STORAGE_DEFAULTS: { [key in StorageKey]?: StorageValueType } = {
  [StorageKey.PRODUCT_AD_VISIBILITY]: false,
  [StorageKey.VIDEO_AD_VISIBILITY]: false,
  [StorageKey.SPONSORSHIP_VISIBILITY]: false,
  [StorageKey.SHELF_PRODUCT_AD_VISIBILITY]: false,
  [StorageKey.DARK_MODE]: false,
  [StorageKey.MINIMUM_PRICE_DIFFERENCE]: 0,
};

/**
 * A centralized service for handling all storage operations
 */
export class BrowserClient {
  /**
   * Get a value from storage
   * @param key The key to retrieve
   * @param parseAs Optional function to parse the value
   * @returns The value from storage, or the default if not found
   */
  public static getValue<T extends StorageValueType>(
    key: StorageKey,
    parseAs?: (value: string) => T,
  ): T {
    const item = localStorage.getItem(key);

    if (!item) {
      const defaultValue = STORAGE_DEFAULTS[key] as T;

      // If there's no saved value, store the default
      if (defaultValue !== undefined) {
        this.setValue(key, defaultValue);
      }

      return defaultValue as T;
    }

    if (parseAs) {
      return parseAs(item);
    }

    // Default parsing based on the key's default value type
    const defaultValue = STORAGE_DEFAULTS[key];
    if (typeof defaultValue === 'boolean') {
      return (item === 'true') as unknown as T;
    } else if (typeof defaultValue === 'number') {
      return parseFloat(item) as unknown as T;
    }

    return item as unknown as T;
  }

  /**
   * Store a value in storage
   * @param key The key to store under
   * @param value The value to store
   */
  public static setValue<T extends StorageValueType>(key: StorageKey, value: T): void {
    localStorage.setItem(key, value.toString());
  }

  /**
   * Get the current language based on document attributes
   * @returns The detected language
   */
  public static getLanguage(): Language {
    const languageAttribute = document.documentElement.lang;

    if (languageAttribute === 'el') {
      return Language.GREEK;
    } else if (languageAttribute === 'ro') {
      return Language.ROMANIAN;
    } else if (languageAttribute === 'bg') {
      return Language.BULGARIAN;
    } else if (languageAttribute === 'de') {
      return Language.GERMAN;
    } else if (languageAttribute === 'en') {
      return Language.ENGLISH;
    }

    return Language.ENGLISH;
  }
}
