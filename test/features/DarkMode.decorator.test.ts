import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { Language } from '../../src/common/enums/Language.enum';
import { State } from '../../src/common/types/State.type';
import { DarkModeDecorator } from '../../src/features/DarkMode.decorator';

function buildMockState(overrides: Partial<State> = {}): State {
  return {
    hideProductAds: false,
    hideVideoAds: false,
    hideSponsorships: false,
    hideShelfProductAds: false,
    hideRecommendationAds: false,
    hideSkoopAds: false,
    hideAISlop: false,
    hideUniversalToggle: false,
    productAdCount: 0,
    shelfAdCount: 0,
    recommendationAdCount: 0,
    skoopAdCount: 0,
    videoAdCount: 0,
    sponsorshipAdCount: 0,
    language: Language.GREEK,
    darkMode: false,
    wideMode: false,
    priceCheckerEnabled: true,
    minimumPriceDifference: 0,
    showBestPrice: true,
    showShopflix: true,
    isMobile: false,
    ...overrides,
  };
}

describe('DarkModeDecorator', () => {
  let decorator: DarkModeDecorator;
  let mockState: State;

  beforeEach(() => {
    vi.resetAllMocks();
    mockState = buildMockState();
    decorator = new DarkModeDecorator(mockState);

    // Reset DOM state
    document.documentElement.classList.remove('resk-dark');
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('execute', () => {
    it('should add resk-dark class to html element', () => {
      // Act
      decorator.execute();

      // Assert
      expect(document.documentElement.classList.contains('resk-dark')).toBe(true);
    });

    it('should not inject a style element — the stylesheet ships with the manifest', () => {
      // Act
      decorator.execute();

      // Assert
      expect(document.getElementById('resk-dark-mode-style')).toBeNull();
      expect(document.querySelectorAll('style')).toHaveLength(0);
    });

    it('should be idempotent — calling execute twice keeps a single class', () => {
      // Act
      decorator.execute();
      decorator.execute();

      // Assert
      expect(document.documentElement.classList.contains('resk-dark')).toBe(true);
      expect(document.documentElement.className.match(/resk-dark/g)).toHaveLength(1);
    });
  });

  describe('destroy', () => {
    it('should remove resk-dark class from html element', () => {
      // Arrange
      decorator.execute();

      // Act
      decorator.destroy();

      // Assert
      expect(document.documentElement.classList.contains('resk-dark')).toBe(false);
    });

    it('should be safe to call destroy when dark mode was never enabled', () => {
      // Act & Assert — should not throw
      expect(() => decorator.destroy()).not.toThrow();
    });
  });

  describe('sync', () => {
    it('should enable dark mode when state.darkMode is true', () => {
      // Arrange
      mockState.darkMode = true;

      // Act
      decorator.sync();

      // Assert
      expect(document.documentElement.classList.contains('resk-dark')).toBe(true);
    });

    it('should disable dark mode when state.darkMode is false', () => {
      // Arrange — first enable, then disable
      mockState.darkMode = true;
      decorator.sync();
      expect(document.documentElement.classList.contains('resk-dark')).toBe(true);

      mockState.darkMode = false;

      // Act
      decorator.sync();

      // Assert
      expect(document.documentElement.classList.contains('resk-dark')).toBe(false);
    });

    it('should toggle from off to on and back correctly', () => {
      // Arrange — start off
      mockState.darkMode = false;
      decorator.sync();
      expect(document.documentElement.classList.contains('resk-dark')).toBe(false);

      // Act — toggle on
      mockState.darkMode = true;
      decorator.sync();

      // Assert
      expect(document.documentElement.classList.contains('resk-dark')).toBe(true);

      // Act — toggle off
      mockState.darkMode = false;
      decorator.sync();

      // Assert
      expect(document.documentElement.classList.contains('resk-dark')).toBe(false);
    });
  });
});
