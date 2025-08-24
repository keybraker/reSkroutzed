import { Language } from '../../common/enums/Language.enum';

export type StorageValueType = boolean | Language | number | string;

const STORAGE_KEY_PREFIX = 'RESKROUTZED';

export enum StorageKey {
  PRODUCT_AD_VISIBILITY = STORAGE_KEY_PREFIX + '-product-ad-visibility',
  VIDEO_AD_VISIBILITY = STORAGE_KEY_PREFIX + '-video-ad-visibility',
  SPONSORSHIP_VISIBILITY = STORAGE_KEY_PREFIX + '-sponsorship-visibility',
  SHELF_PRODUCT_AD_VISIBILITY = STORAGE_KEY_PREFIX + '-shelf-product-ad-visibility',
  UNIVERSAL_TOGGLE_VISIBILITY = STORAGE_KEY_PREFIX + '-universal-toggle-visibility',
  DARK_MODE = STORAGE_KEY_PREFIX + '-dark-mode',
  MINIMUM_PRICE_DIFFERENCE = STORAGE_KEY_PREFIX + '-minimum-difference',
  AI_SLOP_VISIBILITY = STORAGE_KEY_PREFIX + '-ai-slop-visibility',
}

const STORAGE_DEFAULTS: { [key in StorageKey]?: StorageValueType } = {
  [StorageKey.PRODUCT_AD_VISIBILITY]: true,
  [StorageKey.VIDEO_AD_VISIBILITY]: true,
  [StorageKey.SPONSORSHIP_VISIBILITY]: true,
  [StorageKey.SHELF_PRODUCT_AD_VISIBILITY]: true,
  // false means the universal toggle is visible by default
  [StorageKey.UNIVERSAL_TOGGLE_VISIBILITY]: false,
  [StorageKey.DARK_MODE]: false,
  [StorageKey.MINIMUM_PRICE_DIFFERENCE]: 0,
  // false means AI content (sofos*) is visible by default
  [StorageKey.AI_SLOP_VISIBILITY]: false,
};

export class BrowserClient {
  /**
   * Get a value from storage
   * @param key The key to retrieve
   * @param parseAs Optional function to parse the value
   * @returns Promise that resolves to the value from storage, or the default if not found
   */
  public static async getValueAsync<T extends StorageValueType>(
    key: StorageKey,
    parseAs?: (value: string) => T,
  ): Promise<T> {
    return new Promise((resolve) => {
      chrome.storage.local.get([key], (result) => {
        const item = result[key];

        if (item === undefined) {
          const defaultValue = STORAGE_DEFAULTS[key] as T;

          if (defaultValue !== undefined) {
            this.setValue(key, defaultValue);
          }

          resolve(defaultValue as T);
          return;
        }

        if (parseAs) {
          resolve(parseAs(item));
          return;
        }

        const defaultValue = STORAGE_DEFAULTS[key];
        if (typeof defaultValue === 'boolean') {
          resolve((item === true) as unknown as T);
        } else if (typeof defaultValue === 'number') {
          resolve(Number(item) as unknown as T);
        } else {
          resolve(item as T);
        }
      });
    });
  }

  /**
   * Get a value from storage synchronously (with cached fallback)
   * @param key The key to retrieve
   * @param parseAs Optional function to parse the value
   * @returns The value from storage, or the default if not found
   */
  public static getValue<T extends StorageValueType>(
    key: StorageKey,
    parseAs?: (value: string) => T,
  ): T {
    const item = localStorage.getItem(key);
    const defaultValue = STORAGE_DEFAULTS[key] as T;

    this.getValueAsync(key).then((chromeValue) => {
      if (item !== chromeValue?.toString()) {
        localStorage.setItem(key, chromeValue?.toString() || '');
      }
    });

    if (!item) {
      if (defaultValue !== undefined) {
        this.setValue(key, defaultValue);
      }
      return defaultValue as T;
    }

    if (parseAs) {
      return parseAs(item);
    }

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

    const data: { [key: string]: unknown } = {};
    data[key] = value;
    chrome.storage.local.set(data);
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

  public static detectMobile(): boolean {
    const userAgent = navigator.userAgent.toLowerCase();

    const isMobileFirefox = userAgent.includes('android') && userAgent.includes('firefox');
    if (isMobileFirefox) {
      return true;
    }

    const isMobileDomain = window.location.hostname.startsWith('m.');
    if (isMobileDomain) {
      return true;
    }

    const isSmallScreen = window.innerWidth <= 768;
    if (isSmallScreen) {
      return true;
    }

    return false;
  }
}
