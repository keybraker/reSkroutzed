import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';

import { BrowserClient, StorageKey } from '../../../src/clients/browser/client';
import { Language } from '../../../src/common/enums/Language.enum';

describe('BrowserClient', (): void => {
  beforeEach((): void => {
    // Reset mocks before each test
    vi.clearAllMocks();
  });

  afterEach((): void => {
    // Reset any added properties to document, window, etc.
    document.documentElement.lang = 'el';
    window.innerWidth = 1024;
  });

  describe('getValueAsync', (): void => {
    it('should return value from chrome storage', async () => {
      // Setup
      const mockValue = true;
      chrome.storage.local.get = vi.fn().mockImplementation((keys, callback): void => {
        const result: Record<string, unknown> = {};
        result[keys[0]] = mockValue;
        callback(result);
      });

      // Act
      const result = await BrowserClient.getValueAsync(StorageKey.DARK_MODE);

      // Assert
      expect(chrome.storage.local.get).toHaveBeenCalledWith(
        [StorageKey.DARK_MODE],
        expect.any(Function),
      );
      expect(result).toBe(mockValue);
    });

    it('should set default value when storage returns undefined', async () => {
      // Setup
      chrome.storage.local.get = vi.fn().mockImplementation((_keys, callback): void => {
        callback({});
      });

      vi.spyOn(BrowserClient, 'setValue');

      // Act
      const result = await BrowserClient.getValueAsync(StorageKey.DARK_MODE);

      // Assert
      expect(chrome.storage.local.get).toHaveBeenCalledWith(
        [StorageKey.DARK_MODE],
        expect.any(Function),
      );
      expect(BrowserClient.setValue).toHaveBeenCalledWith(StorageKey.DARK_MODE, false);
      expect(result).toBe(false);
    });

    it('should parse value using provided parser function', async () => {
      // Setup
      const mockStringValue = '42';
      chrome.storage.local.get = vi.fn().mockImplementation((keys, callback): void => {
        const result: Record<string, unknown> = {};
        result[keys[0]] = mockStringValue;
        callback(result);
      });

      const parser = (value: string): number => parseInt(value, 10);

      // Act
      const result = await BrowserClient.getValueAsync(StorageKey.MINIMUM_PRICE_DIFFERENCE, parser);

      // Assert
      expect(result).toBe(42);
    });
  });

  describe('getValue', (): void => {
    it('should return value from localStorage', (): void => {
      // Setup
      const mockValue = 'true';
      localStorage.getItem = vi.fn().mockReturnValue(mockValue);
      vi.spyOn(BrowserClient, 'getValueAsync').mockResolvedValue(true);

      // Act
      const result = BrowserClient.getValue(StorageKey.DARK_MODE);

      // Assert
      expect(localStorage.getItem).toHaveBeenCalledWith(StorageKey.DARK_MODE);
      expect(result).toBe(true);
    });

    it('should handle numeric values correctly', (): void => {
      // Setup
      const mockValue = '10';
      localStorage.getItem = vi.fn().mockReturnValue(mockValue);
      vi.spyOn(BrowserClient, 'getValueAsync').mockResolvedValue(10);

      // Act
      const result = BrowserClient.getValue(StorageKey.MINIMUM_PRICE_DIFFERENCE);

      // Assert
      expect(result).toBe(10);
    });

    it('should apply parser function when provided', (): void => {
      // Setup
      const mockValue = '42';
      localStorage.getItem = vi.fn().mockReturnValue(mockValue);
      vi.spyOn(BrowserClient, 'getValueAsync').mockResolvedValue(42);
      const parser = (value: string): number => parseInt(value, 10) * 2;

      // Act
      const result = BrowserClient.getValue(StorageKey.MINIMUM_PRICE_DIFFERENCE, parser);

      // Assert
      expect(result).toBe(84);
    });
  });

  describe('setValue', (): void => {
    it('should set value in localStorage and chrome storage', (): void => {
      // Setup
      const key = StorageKey.DARK_MODE;
      const value = true;

      // Act
      BrowserClient.setValue(key, value);

      // Assert
      expect(localStorage.setItem).toHaveBeenCalledWith(key, 'true');
      expect(chrome.storage.local.set).toHaveBeenCalledWith({ [key]: value });
    });

    it('should convert numeric values to strings for localStorage', (): void => {
      // Setup
      const key = StorageKey.MINIMUM_PRICE_DIFFERENCE;
      const value = 42;

      // Act
      BrowserClient.setValue(key, value);

      // Assert
      expect(localStorage.setItem).toHaveBeenCalledWith(key, '42');
    });
  });

  describe('getLanguage', (): void => {
    it('should return GREEK for el lang attribute', (): void => {
      // Setup
      document.documentElement.lang = 'el';

      // Act
      const result = BrowserClient.getLanguage();

      // Assert
      expect(result).toBe(Language.GREEK);
    });

    it('should return ROMANIAN for ro lang attribute', (): void => {
      // Setup
      document.documentElement.lang = 'ro';

      // Act
      const result = BrowserClient.getLanguage();

      // Assert
      expect(result).toBe(Language.ROMANIAN);
    });

    it('should return BULGARIAN for bg lang attribute', (): void => {
      // Setup
      document.documentElement.lang = 'bg';

      // Act
      const result = BrowserClient.getLanguage();

      // Assert
      expect(result).toBe(Language.BULGARIAN);
    });

    it('should return GERMAN for de lang attribute', (): void => {
      // Setup
      document.documentElement.lang = 'de';

      // Act
      const result = BrowserClient.getLanguage();

      // Assert
      expect(result).toBe(Language.GERMAN);
    });

    it('should return ENGLISH for en lang attribute', (): void => {
      // Setup
      document.documentElement.lang = 'en';

      // Act
      const result = BrowserClient.getLanguage();

      // Assert
      expect(result).toBe(Language.ENGLISH);
    });

    it('should return ENGLISH for unknown lang attribute', (): void => {
      // Setup
      document.documentElement.lang = 'fr';

      // Act
      const result = BrowserClient.getLanguage();

      // Assert
      expect(result).toBe(Language.ENGLISH);
    });
  });

  describe('detectMobile', (): void => {
    it('should return true for mobile Firefox', (): void => {
      // Setup
      const originalUserAgent = navigator.userAgent;
      Object.defineProperty(navigator, 'userAgent', {
        value: 'mozilla/5.0 (android 10; mobile; rv:68.0) gecko/68.0 firefox/68.0',
        configurable: true,
        writable: true,
      });

      // Act
      const result = BrowserClient.detectMobile();

      // Assert
      expect(result).toBe(true);

      // Restore original
      Object.defineProperty(navigator, 'userAgent', {
        value: originalUserAgent,
        configurable: true,
        writable: true,
      });
    });

    it('should return true for mobile domain', (): void => {
      // Setup
      // Mock the hostname check without changing the actual hostname property
      const originalStartsWith = String.prototype.startsWith;
      String.prototype.startsWith = function (searchString) {
        if (this === window.location.hostname && searchString === 'm.') {
          return true;
        }
        return originalStartsWith.call(this, searchString);
      };

      // Act
      const result = BrowserClient.detectMobile();

      // Assert
      expect(result).toBe(true);

      // Restore original
      String.prototype.startsWith = originalStartsWith;
    });

    it('should return true for small screen', (): void => {
      // Setup
      const originalInnerWidth = window.innerWidth;
      window.innerWidth = 480;

      // Act
      const result = BrowserClient.detectMobile();

      // Assert
      expect(result).toBe(true);

      // Restore original
      window.innerWidth = originalInnerWidth;
    });

    it('should return false for desktop browser', (): void => {
      // Setup
      const originalUserAgent = navigator.userAgent;
      const originalInnerWidth = window.innerWidth;

      Object.defineProperty(navigator, 'userAgent', {
        value:
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.110 Safari/537.36',
        configurable: true,
        writable: true,
      });

      window.innerWidth = 1024;

      // Mock the hostname check without changing the actual hostname property
      const originalStartsWith = String.prototype.startsWith;
      String.prototype.startsWith = function (searchString) {
        if (this === window.location.hostname && searchString === 'm.') {
          return false;
        }
        return originalStartsWith.call(this, searchString);
      };

      // Act
      const result = BrowserClient.detectMobile();

      // Assert
      expect(result).toBe(false);

      // Restore originals
      Object.defineProperty(navigator, 'userAgent', {
        value: originalUserAgent,
        configurable: true,
        writable: true,
      });
      window.innerWidth = originalInnerWidth;
      String.prototype.startsWith = originalStartsWith;
    });
  });
});
