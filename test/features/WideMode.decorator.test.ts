import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { Language } from '../../src/common/enums/Language.enum';
import { State } from '../../src/common/types/State.type';
import { WideModeDecorator } from '../../src/features/WideMode.decorator';

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
    minimumPriceDifference: 0,
    isMobile: false,
    ...overrides,
  };
}

describe('WideModeDecorator', () => {
  let decorator: WideModeDecorator;
  let mockState: State;

  beforeEach(() => {
    vi.resetAllMocks();
    mockState = buildMockState();
    decorator = new WideModeDecorator(mockState);

    // Reset DOM state
    document.body.classList.remove('resk-wide-mode');
    const existingStyle = document.getElementById('resk-wide-mode-style');
    if (existingStyle) {
      existingStyle.remove();
    }
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('execute', () => {
    it('should add resk-wide-mode class to body', () => {
      // Act
      decorator.execute();

      // Assert
      expect(document.body.classList.contains('resk-wide-mode')).toBe(true);
    });

    it('should inject a style element with the correct id', () => {
      // Act
      decorator.execute();

      // Assert
      const style = document.getElementById('resk-wide-mode-style');
      expect(style).not.toBeNull();
      expect(style!.tagName).toBe('STYLE');
    });

    it('should inject CSS containing media query for wide mode', () => {
      // Act
      decorator.execute();

      // Assert
      const style = document.getElementById('resk-wide-mode-style');
      expect(style!.textContent).toContain('@media (min-width: 1600px)');
      expect(style!.textContent).toContain('.resk-wide-mode');
    });

    it('should be idempotent — calling execute twice does not duplicate style', () => {
      // Act
      decorator.execute();
      decorator.execute();

      // Assert
      const styles = document.querySelectorAll('#resk-wide-mode-style');
      expect(styles.length).toBe(1);
    });
  });

  describe('destroy', () => {
    it('should remove resk-wide-mode class from body', () => {
      // Arrange
      decorator.execute();

      // Act
      decorator.destroy();

      // Assert
      expect(document.body.classList.contains('resk-wide-mode')).toBe(false);
    });

    it('should remove the injected style element', () => {
      // Arrange
      decorator.execute();

      // Act
      decorator.destroy();

      // Assert
      const style = document.getElementById('resk-wide-mode-style');
      expect(style).toBeNull();
    });

    it('should be safe to call when never enabled', () => {
      // Act & Assert — should not throw
      expect(() => decorator.destroy()).not.toThrow();
    });
  });

  describe('sync', () => {
    it('should enable wide mode when state.wideMode is true', () => {
      // Arrange
      mockState.wideMode = true;

      // Act
      decorator.sync();

      // Assert
      expect(document.body.classList.contains('resk-wide-mode')).toBe(true);
      expect(document.getElementById('resk-wide-mode-style')).not.toBeNull();
    });

    it('should disable wide mode when state.wideMode is false', () => {
      // Arrange: first enable
      mockState.wideMode = true;
      decorator.sync();
      // Then disable
      mockState.wideMode = false;

      // Act
      decorator.sync();

      // Assert
      expect(document.body.classList.contains('resk-wide-mode')).toBe(false);
      expect(document.getElementById('resk-wide-mode-style')).toBeNull();
    });

    it('should re-enable after being disabled (enable → disable → re-enable)', () => {
      // Arrange: enable
      mockState.wideMode = true;
      decorator.sync();
      expect(document.body.classList.contains('resk-wide-mode')).toBe(true);

      // Disable
      mockState.wideMode = false;
      decorator.sync();
      expect(document.body.classList.contains('resk-wide-mode')).toBe(false);

      // Act: re-enable
      mockState.wideMode = true;
      decorator.sync();

      // Assert: should be re-enabled
      expect(document.body.classList.contains('resk-wide-mode')).toBe(true);
      const style = document.getElementById('resk-wide-mode-style');
      expect(style).not.toBeNull();
      expect(style!.textContent).toContain('@media (min-width: 1600px)');
    });

    it('should handle rapid toggle (enable → disable → enable)', () => {
      // Act & Assert: enable
      mockState.wideMode = true;
      decorator.sync();
      expect(document.body.classList.contains('resk-wide-mode')).toBe(true);

      // Disable
      mockState.wideMode = false;
      decorator.sync();
      expect(document.body.classList.contains('resk-wide-mode')).toBe(false);

      // Re-enable
      mockState.wideMode = true;
      decorator.sync();
      expect(document.body.classList.contains('resk-wide-mode')).toBe(true);
      expect(document.getElementById('resk-wide-mode-style')).not.toBeNull();
    });

    it('should toggle multiple times without leaking style elements', () => {
      // Toggle on/off several times
      for (let i = 0; i < 5; i++) {
        mockState.wideMode = true;
        decorator.sync();
        mockState.wideMode = false;
        decorator.sync();
      }

      // Final enable
      mockState.wideMode = true;
      decorator.sync();

      // Assert: only one style element
      const styles = document.querySelectorAll('#resk-wide-mode-style');
      expect(styles.length).toBe(1);
    });
  });
});
