import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { Language } from '../../src/common/enums/Language.enum';
import { State } from '../../src/common/types/State.type';
import { CalmModeDecorator } from '../../src/features/CalmMode.decorator';

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
    calmMode: false,
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

function stubLocation(hostname: string, pathname: string): void {
  vi.stubGlobal('location', { hostname, pathname });
}

describe('CalmModeDecorator', () => {
  let decorator: CalmModeDecorator;
  let mockState: State;

  beforeEach(() => {
    vi.resetAllMocks();
    mockState = buildMockState();
    decorator = new CalmModeDecorator(mockState);

    document.getElementById('resk-calm-mode-style')?.remove();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  describe('execute', () => {
    it('injects a style that hides the infinite-scroll main element', () => {
      // Arrange
      stubLocation('www.skroutz.gr', '/');
      mockState.calmMode = true;

      // Act
      decorator.execute();

      // Assert
      const style = document.getElementById('resk-calm-mode-style');
      expect(style).not.toBeNull();
      expect(style!.textContent).toContain('main[data-controller~="infinite-scroll"]');
      expect(style!.textContent).toContain('display: none !important');
    });

    it('targets only the main element, not the surrounding homepage sections', () => {
      // Arrange
      stubLocation('www.skroutz.gr', '/');
      mockState.calmMode = true;

      // Act
      decorator.execute();

      // Assert — the popular searches, tags group and footer are siblings of
      // `main`, so a bare `main` selector leaves them alone.
      const text = document.getElementById('resk-calm-mode-style')!.textContent!;
      expect(text).not.toContain('#popular');
      expect(text).not.toContain('footer');
      expect(text).not.toContain('.tags-group');
      expect(text.trim()).toBe(
        'main[data-controller~="infinite-scroll"] { display: none !important; }',
      );
    });

    it('does nothing when calm mode is disabled', () => {
      // Arrange
      stubLocation('www.skroutz.gr', '/');

      // Act
      decorator.execute();

      // Assert
      expect(document.getElementById('resk-calm-mode-style')).toBeNull();
    });

    it('does nothing on other Skroutz storefronts', () => {
      // Arrange
      stubLocation('www.skroutz.ro', '/');
      mockState.calmMode = true;

      // Act
      decorator.execute();

      // Assert
      expect(document.getElementById('resk-calm-mode-style')).toBeNull();
    });

    it('does nothing on non-homepage paths', () => {
      // Arrange
      stubLocation('www.skroutz.gr', '/s/12345/product.html');
      mockState.calmMode = true;

      // Act
      decorator.execute();

      // Assert
      expect(document.getElementById('resk-calm-mode-style')).toBeNull();
    });

    it('is idempotent and keeps a single style element', () => {
      // Arrange
      stubLocation('www.skroutz.gr', '/');
      mockState.calmMode = true;

      // Act
      decorator.execute();
      decorator.execute();

      // Assert
      expect(document.querySelectorAll('#resk-calm-mode-style').length).toBe(1);
    });
  });

  describe('sync', () => {
    it('removes the style when calm mode is turned off', () => {
      // Arrange
      stubLocation('www.skroutz.gr', '/');
      mockState.calmMode = true;
      decorator.sync();

      // Act
      mockState.calmMode = false;
      decorator.sync();

      // Assert
      expect(document.getElementById('resk-calm-mode-style')).toBeNull();
    });
  });

  describe('destroy', () => {
    it('removes the injected style', () => {
      // Arrange
      stubLocation('www.skroutz.gr', '/');
      mockState.calmMode = true;
      decorator.execute();

      // Act
      decorator.destroy();

      // Assert
      expect(document.getElementById('resk-calm-mode-style')).toBeNull();
    });
  });
});
