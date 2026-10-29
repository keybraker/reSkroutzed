import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { BrowserClient, StorageKey } from '../../../src/clients/browser/client';
import {
  applyDarkMode,
  DARK_MODE_CLASS_NAME,
  isDarkModeEnabled,
  removeDarkMode,
} from '../../../src/features/functions/darkMode';

describe('darkMode', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    document.documentElement.classList.remove(DARK_MODE_CLASS_NAME);
  });

  afterEach(() => {
    document.documentElement.classList.remove(DARK_MODE_CLASS_NAME);
  });

  describe('isDarkModeEnabled', () => {
    it('should return true when the stored preference is enabled', () => {
      // Arrange
      localStorage.getItem = vi.fn().mockReturnValue('true');

      // Act
      const result = isDarkModeEnabled();

      // Assert
      expect(result).toBe(true);
    });

    it('should return false when the stored preference is disabled', () => {
      // Arrange
      localStorage.getItem = vi.fn().mockReturnValue('false');

      // Act
      const result = isDarkModeEnabled();

      // Assert
      expect(result).toBe(false);
    });

    it('should return false when nothing has been stored yet', () => {
      // Arrange
      localStorage.getItem = vi.fn().mockReturnValue(null);

      // Act
      const result = isDarkModeEnabled();

      // Assert
      expect(result).toBe(false);
    });

    it('should read the dark mode storage key', () => {
      // Arrange
      localStorage.getItem = vi.fn().mockReturnValue('false');

      // Act
      isDarkModeEnabled();

      // Assert
      expect(localStorage.getItem).toHaveBeenCalledWith(StorageKey.DARK_MODE);
    });

    it('should not touch chrome.storage — the read has to be synchronous', () => {
      // Arrange
      localStorage.getItem = vi.fn().mockReturnValue('true');

      // Act
      isDarkModeEnabled();

      // Assert
      expect(chrome.storage.local.get).not.toHaveBeenCalled();
    });
  });

  describe('applyDarkMode', () => {
    it('should add the dark mode class to the html element', () => {
      // Act
      applyDarkMode();

      // Assert
      expect(document.documentElement.classList.contains(DARK_MODE_CLASS_NAME)).toBe(true);
    });

    it('should report success when the document element is available', () => {
      // Act
      const result = applyDarkMode();

      // Assert
      expect(result).toBe(true);
    });

    it('should be idempotent', () => {
      // Act
      applyDarkMode();
      applyDarkMode();

      // Assert
      expect(document.documentElement.className.match(/resk-dark/g)).toHaveLength(1);
    });
  });

  describe('removeDarkMode', () => {
    it('should remove the dark mode class from the html element', () => {
      // Arrange
      applyDarkMode();

      // Act
      removeDarkMode();

      // Assert
      expect(document.documentElement.classList.contains(DARK_MODE_CLASS_NAME)).toBe(false);
    });

    it('should be safe to call when dark mode was never enabled', () => {
      // Act & Assert — should not throw
      expect(() => removeDarkMode()).not.toThrow();
    });
  });

  describe('BrowserClient.getValue', () => {
    it('should read from the localStorage mirror without any storage round-trip', () => {
      // Arrange
      localStorage.getItem = vi.fn().mockReturnValue('true');

      // Act
      const result = BrowserClient.getValue<boolean>(StorageKey.DARK_MODE);

      // Assert
      expect(result).toBe(true);
      expect(chrome.storage.local.get).not.toHaveBeenCalled();
    });
  });
});
