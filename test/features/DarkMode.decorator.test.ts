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
    hideAISlop: false,
    hideUniversalToggle: false,
    productAdCount: 0,
    shelfAdCount: 0,
    recommendationAdCount: 0,
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

describe('DarkModeDecorator', () => {
  let decorator: DarkModeDecorator;
  let mockState: State;

  beforeEach(() => {
    vi.resetAllMocks();
    mockState = buildMockState();
    decorator = new DarkModeDecorator(mockState);

    // Reset DOM state
    document.documentElement.classList.remove('resk-dark');
    const existingStyle = document.getElementById('resk-dark-mode-style');
    if (existingStyle) {
      existingStyle.remove();
    }
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

    it('should inject a style element with the correct id', () => {
      // Act
      decorator.execute();

      // Assert
      const style = document.getElementById('resk-dark-mode-style');
      expect(style).not.toBeNull();
      expect(style!.tagName).toBe('STYLE');
    });

    it('should inject filter inversion CSS', () => {
      // Act
      decorator.execute();

      // Assert
      const style = document.getElementById('resk-dark-mode-style');
      expect(style!.textContent).toContain('filter: invert(1) hue-rotate(180deg)');
      expect(style!.textContent).toContain('html.resk-dark');
    });

    it('should include media element restoration in CSS', () => {
      // Act
      decorator.execute();

      // Assert
      const style = document.getElementById('resk-dark-mode-style');
      expect(style!.textContent).toContain('html.resk-dark img');
      expect(style!.textContent).toContain('html.resk-dark video');
      expect(style!.textContent).toContain('html.resk-dark canvas');
      expect(style!.textContent).toContain('html.resk-dark svg');
    });

    it('should include print media query to disable filter', () => {
      // Act
      decorator.execute();

      // Assert
      const style = document.getElementById('resk-dark-mode-style');
      expect(style!.textContent).toContain('@media print');
      expect(style!.textContent).toContain('filter: none !important');
    });

    it('should be idempotent — calling execute twice only creates one style element', () => {
      // Act
      decorator.execute();
      decorator.execute();

      // Assert
      const styles = document.querySelectorAll('#resk-dark-mode-style');
      expect(styles.length).toBe(1);
    });

    it('should inject .resk-no-invert utility class', () => {
      // Act
      decorator.execute();

      // Assert
      const style = document.getElementById('resk-dark-mode-style');
      expect(style!.textContent).toContain('.resk-no-invert');
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

    it('should remove the injected style element', () => {
      // Arrange
      decorator.execute();

      // Act
      decorator.destroy();

      // Assert
      const style = document.getElementById('resk-dark-mode-style');
      expect(style).toBeNull();
    });

    it('should be safe to call destroy when no style was injected', () => {
      // Act & Assert — should not throw
      expect(() => decorator.destroy()).not.toThrow();
    });
  });

  describe('sync', () => {
    it('should call execute when state.darkMode is true', () => {
      // Arrange
      mockState.darkMode = true;

      // Act
      decorator.sync();

      // Assert
      expect(document.documentElement.classList.contains('resk-dark')).toBe(true);
      expect(document.getElementById('resk-dark-mode-style')).not.toBeNull();
    });

    it('should call destroy when state.darkMode is false', () => {
      // Arrange — first enable, then disable
      mockState.darkMode = true;
      decorator.sync();
      expect(document.getElementById('resk-dark-mode-style')).not.toBeNull();

      mockState.darkMode = false;

      // Act
      decorator.sync();

      // Assert
      expect(document.documentElement.classList.contains('resk-dark')).toBe(false);
      expect(document.getElementById('resk-dark-mode-style')).toBeNull();
    });

    it('should toggle from off to on and back correctly', () => {
      // Arrange — start off
      mockState.darkMode = false;
      decorator.sync();
      expect(document.getElementById('resk-dark-mode-style')).toBeNull();

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
      expect(document.getElementById('resk-dark-mode-style')).toBeNull();
    });
  });
});
