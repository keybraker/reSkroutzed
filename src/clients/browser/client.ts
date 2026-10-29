import { Language } from '../../common/enums/Language.enum';

export type StorageValueType = boolean | Language | number | string;

const STORAGE_KEY_PREFIX = 'RESKROUTZED';

export enum StorageKey {
  PRODUCT_AD_VISIBILITY = STORAGE_KEY_PREFIX + '-product-ad-visibility',
  VIDEO_AD_VISIBILITY = STORAGE_KEY_PREFIX + '-video-ad-visibility',
  SPONSORSHIP_VISIBILITY = STORAGE_KEY_PREFIX + '-sponsorship-visibility',
  SHELF_PRODUCT_AD_VISIBILITY = STORAGE_KEY_PREFIX + '-shelf-product-ad-visibility',
  RECOMMENDATION_AD_VISIBILITY = STORAGE_KEY_PREFIX + '-recommendation-ad-visibility',
  SKOOP_AD_VISIBILITY = STORAGE_KEY_PREFIX + '-skoop-ad-visibility',
  UNIVERSAL_TOGGLE_VISIBILITY = STORAGE_KEY_PREFIX + '-universal-toggle-visibility',
  DARK_MODE = STORAGE_KEY_PREFIX + '-dark-mode',
  MINIMUM_PRICE_DIFFERENCE = STORAGE_KEY_PREFIX + '-minimum-difference',
  AI_SLOP_VISIBILITY = STORAGE_KEY_PREFIX + '-ai-slop-visibility',
  WIDE_MODE = STORAGE_KEY_PREFIX + '-wide-mode',
  PRICE_CHECKER_ENABLED = STORAGE_KEY_PREFIX + '-price-checker-enabled',
  BEST_PRICE_COMPARISON = STORAGE_KEY_PREFIX + '-bestprice-comparison',
  SHOPFLIX_COMPARISON = STORAGE_KEY_PREFIX + '-shopflix-comparison',
}

const STORAGE_DEFAULTS: { [key in StorageKey]?: StorageValueType } = {
  [StorageKey.PRODUCT_AD_VISIBILITY]: true,
  [StorageKey.VIDEO_AD_VISIBILITY]: true,
  [StorageKey.SPONSORSHIP_VISIBILITY]: true,
  [StorageKey.SHELF_PRODUCT_AD_VISIBILITY]: true,
  [StorageKey.RECOMMENDATION_AD_VISIBILITY]: true,
  [StorageKey.SKOOP_AD_VISIBILITY]: true,
  // false means the universal toggle is visible by default
  [StorageKey.UNIVERSAL_TOGGLE_VISIBILITY]: false,
  [StorageKey.DARK_MODE]: false,
  [StorageKey.MINIMUM_PRICE_DIFFERENCE]: 0,
  // false means AI content (sofos*) is visible by default
  [StorageKey.AI_SLOP_VISIBILITY]: false,
  [StorageKey.WIDE_MODE]: false,
  // true means the price checker runs on product pages by default
  [StorageKey.PRICE_CHECKER_ENABLED]: true,
  // BestPrice is compared by default
  [StorageKey.BEST_PRICE_COMPARISON]: true,
  // Shopflix is compared alongside BestPrice by default
  [StorageKey.SHOPFLIX_COMPARISON]: true,
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

        if (parseAs && typeof item === 'string') {
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
   * Get a value from the synchronous localStorage mirror.
   *
   * The mirror is kept in sync with chrome.storage.local by `hydrate()`, so no
   * async round-trip is needed here — that is what allows the dark-mode boot
   * script to read the preference at `document_start`.
   *
   * @param key The key to retrieve
   * @param parseAs Optional function to parse the value
   * @returns The value from the mirror, or the default if not found
   */
  public static getValue<T extends StorageValueType>(
    key: StorageKey,
    parseAs?: (value: string) => T,
  ): T {
    const item = localStorage.getItem(key);
    const defaultValue = STORAGE_DEFAULTS[key] as T;

    if (!item) {
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
   * Reconcile the localStorage mirror with chrome.storage.local.
   *
   * A single bulk read replaces one storage request per setting, so a page
   * load pays for one round-trip instead of fourteen. Values that the mirror
   * already holds are left untouched, so the steady state writes nothing.
   */
  public static async hydrate(): Promise<void> {
    return new Promise((resolve) => {
      chrome.storage.local.get(null, (result) => {
        const missingDefaults: { [key: string]: StorageValueType } = {};

        Object.values(StorageKey).forEach((key) => {
          const chromeValue = result[key];
          const defaultValue = STORAGE_DEFAULTS[key];

          if (chromeValue === undefined || chromeValue === null) {
            if (defaultValue !== undefined) {
              missingDefaults[key] = defaultValue;
            }
            return;
          }

          const serialized = chromeValue.toString();
          if (localStorage.getItem(key) !== serialized) {
            localStorage.setItem(key, serialized);
          }
        });

        const missingKeys = Object.keys(missingDefaults);
        if (missingKeys.length > 0) {
          chrome.storage.local.set(missingDefaults);
          missingKeys.forEach((key) => {
            localStorage.setItem(key, missingDefaults[key].toString());
          });
        }

        resolve();
      });
    });
  }

  /**
   * Read several settings with a single storage round-trip.
   *
   * @param keys The keys to retrieve
   * @returns The stored value for every requested key, with defaults applied
   */
  public static async getValuesAsync(
    keys: StorageKey[],
  ): Promise<Partial<Record<StorageKey, StorageValueType>>> {
    return new Promise((resolve) => {
      chrome.storage.local.get(keys, (result) => {
        const values: Partial<Record<StorageKey, StorageValueType>> = {};

        keys.forEach((key) => {
          const item = result[key];
          const defaultValue = STORAGE_DEFAULTS[key];

          if (item === undefined) {
            if (defaultValue !== undefined) {
              values[key] = defaultValue;
              chrome.storage.local.set({ [key]: defaultValue });
            }
            return;
          }

          if (typeof defaultValue === 'boolean') {
            values[key] = (item === true) as unknown as StorageValueType;
          } else if (typeof defaultValue === 'number') {
            values[key] = Number(item) as unknown as StorageValueType;
          } else {
            values[key] = item as StorageValueType;
          }
        });

        resolve(values);
      });
    });
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
