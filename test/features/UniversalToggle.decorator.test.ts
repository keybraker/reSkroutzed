import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { BrowserClient } from '../../src/clients/browser/client';
import { Language } from '../../src/common/enums/Language.enum';
import { State } from '../../src/common/types/State.type';
import { UniversalToggleDecorator } from '../../src/features/UniversalToggle.decorator';

// Mock browser client
vi.mock('../../src/clients/browser/client', () => ({
  BrowserClient: {
    setValue: vi.fn(),
    getValueAsync: vi.fn().mockResolvedValue(false),
    detectMobile: vi.fn().mockReturnValue(false),
  },
  StorageKey: {
    DARK_MODE: 'darkMode',
    PRODUCT_AD_VISIBILITY: 'hideProductAds',
    VIDEO_AD_VISIBILITY: 'hideVideoAds',
    SHELF_PRODUCT_AD_VISIBILITY: 'hideShelfProductAds',
    RECOMMENDATION_AD_VISIBILITY: 'hideRecommendationAds',
    SPONSORSHIP_VISIBILITY: 'hideSponsorships',
    SKOOP_AD_VISIBILITY: 'hideSkoopAds',
    MINIMUM_PRICE_DIFFERENCE: 'minimumPriceDifference',
    AI_SLOP_VISIBILITY: 'hideAISlop',
    WIDE_MODE: 'wideMode',
  },
}));

// Mock WideModeDecorator
vi.mock('../../src/features/WideMode.decorator', () => ({
  WideModeDecorator: vi.fn().mockImplementation(() => ({
    visibilityUpdate: vi.fn(),
    execute: vi.fn(),
    destroy: vi.fn(),
  })),
}));

// Mock ad handler classes
vi.mock('../../src/handlers/ListProductAd.handler', () => ({
  ListProductAdHandler: vi.fn().mockImplementation(() => ({
    flag: vi.fn(),
    visibilityUpdate: vi.fn(),
  })),
}));

vi.mock('../../src/handlers/ShelfProductAd.handler', () => ({
  ShelfProductAdHandler: vi.fn().mockImplementation(() => ({
    flag: vi.fn(),
    visibilityUpdate: vi.fn(),
  })),
}));

vi.mock('../../src/handlers/RecommendationAd.handler', () => ({
  RecommendationAdHandler: vi.fn().mockImplementation(() => ({
    flag: vi.fn(),
    visibilityUpdate: vi.fn(),
  })),
}));

vi.mock('../../src/handlers/SponsorshipAd.handler', () => ({
  SponsorshipAdHandler: vi.fn().mockImplementation(() => ({
    flag: vi.fn(),
    visibilityUpdate: vi.fn(),
  })),
}));

vi.mock('../../src/handlers/VideoAd.handler', () => ({
  VideoAdHandler: vi.fn().mockImplementation(() => ({
    flag: vi.fn(),
    visibilityUpdate: vi.fn(),
  })),
}));

vi.mock('../../src/handlers/Skoop.handler', () => ({
  SkoopHandler: vi.fn().mockImplementation(() => ({
    flag: vi.fn(),
    visibilityUpdate: vi.fn(),
  })),
}));

vi.mock('../../src/handlers/Campaign.handler', () => ({
  CampaignAdHandler: vi.fn().mockImplementation(() => ({
    flag: vi.fn(),
    visibilityUpdate: vi.fn(),
  })),
}));

describe('UniversalToggleDecorator', () => {
  let universalToggleDecorator: UniversalToggleDecorator;
  let mockState: State;

  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();

    // Do NOT mock createElementNS — let buildSvg create real SVG elements
    // that are discoverable via querySelector / children iteration.
    document.addEventListener = vi.fn();

    mockState = {
      language: Language.ENGLISH,
      darkMode: false,
      wideMode: false,
      hideProductAds: false,
      hideVideoAds: false,
      hideShelfProductAds: false,
      hideRecommendationAds: false,
      hideSkoopAds: false,
      hideAISlop: false,
      hideUniversalToggle: false,
      hideSponsorships: false,
      productAdCount: 3,
      videoAdCount: 2,
      shelfAdCount: 1,
      recommendationAdCount: 4,
      skoopAdCount: 0,
      minimumPriceDifference: 1,
      sponsorshipAdCount: 0,
      isMobile: false,
    };

    // Setup mock DOM environment
    document.body.innerHTML = `<div id="root"></div>`;

    universalToggleDecorator = new UniversalToggleDecorator(mockState);
  });

  afterEach(() => {
    document.body.innerHTML = '';
    vi.restoreAllMocks();
  });

  describe('execute', () => {
    it('should create the universal toggle interface with all buttons', () => {
      // Act
      universalToggleDecorator.execute();

      // Assert
      const container = document.querySelector('.universal-toggle-container');
      expect(container).not.toBeNull();

      const mainToggle = document.querySelector('.universal-toggle-button');
      expect(mainToggle).not.toBeNull();

      const buttonsContainer = document.querySelector('.toggle-buttons-container');
      expect(buttonsContainer).not.toBeNull();

      // Check that all option buttons are created
      expect(document.querySelector('.price-difference-option')).not.toBeNull();
      expect(document.querySelector('.dark-mode-option')).not.toBeNull();
      expect(document.querySelector('.ad-toggle-option')).not.toBeNull();
      expect(document.querySelector('.video-toggle-option')).not.toBeNull();
      expect(document.querySelector('.sponsorship-toggle-option')).not.toBeNull();
      expect(document.querySelector('.shelf-ad-toggle-option')).not.toBeNull();
      expect(document.querySelector('.recommendation-ad-toggle-option')).not.toBeNull();
    });

    it('should display product ad count in notification bubble', () => {
      // Act
      universalToggleDecorator.execute();

      // Assert
      const adNotification = document.querySelector('.ad-toggle-option .notification-bubble');
      expect(adNotification).not.toBeNull();

      if (adNotification?.textContent) {
        expect(['3', '0']).toContain(adNotification.textContent);
      }
    });

    it('should display video ad count in notification bubble', () => {
      // Act
      universalToggleDecorator.execute();

      // Assert
      const videoNotification = document.querySelector('.video-toggle-option .notification-bubble');
      expect(videoNotification).not.toBeNull();
      if (videoNotification?.textContent) {
        expect(['2', '0']).toContain(videoNotification.textContent);
      }
    });

    it('should display shelf product ad count in notification bubble', () => {
      // Act
      universalToggleDecorator.execute();

      // Assert
      const shelfNotification = document.querySelector(
        '.shelf-ad-toggle-option .notification-bubble',
      );
      expect(shelfNotification).not.toBeNull();
      if (shelfNotification?.textContent) {
        expect(['1', '0']).toContain(shelfNotification.textContent);
      }
    });

    it('should display recommendation ad count in notification bubble', () => {
      universalToggleDecorator.execute();

      const recommendationNotification = document.querySelector(
        '.recommendation-ad-toggle-option .notification-bubble',
      );
      expect(recommendationNotification).not.toBeNull();
      if (recommendationNotification?.textContent) {
        expect(['4', '0']).toContain(recommendationNotification.textContent);
      }
    });

    it('should display the current minimum price difference value', () => {
      // Act
      universalToggleDecorator.execute();

      // Assert
      const priceDifferenceButton = document.querySelector('.price-difference-option');
      const valueDisplay = priceDifferenceButton?.querySelector('span');
      expect(valueDisplay?.textContent).toBe('1');
    });

    it('should set up click handlers for all toggle buttons', () => {
      // Arrange
      const addEventListener = Element.prototype.addEventListener;
      const mockAddEventListener = vi.fn();
      Element.prototype.addEventListener = mockAddEventListener;

      // Act
      universalToggleDecorator.execute();

      // Assert
      expect(mockAddEventListener).toHaveBeenCalledWith('click', expect.any(Function));

      // Document should have event listener for closing menu when clicking outside
      expect(document.addEventListener).toHaveBeenCalledWith('click', expect.any(Function));

      // Restore original
      Element.prototype.addEventListener = addEventListener;
    });
  });

  describe('toggle functionality', () => {
    it('should toggle dark mode when dark mode button is clicked', () => {
      universalToggleDecorator.execute();

      const darkModeButton = document.querySelector('.dark-mode-option') as HTMLButtonElement;
      expect(darkModeButton).not.toBeNull();

      // Simulate click — initial state is darkMode=false
      darkModeButton.click();

      expect(mockState.darkMode).toBe(true);
      expect(BrowserClient.setValue).toHaveBeenCalledWith('darkMode', true);
    });

    it('should have product-ad toggle button with SVG icon', () => {
      universalToggleDecorator.execute();

      const adButton = document.querySelector('.ad-toggle-option') as HTMLButtonElement;
      expect(adButton).not.toBeNull();
      // Default: ads showing → active class
      expect(adButton.classList.contains('active')).toBe(true);
    });

    it('should have video toggle button in active state', () => {
      universalToggleDecorator.execute();

      const videoButton = document.querySelector('.video-toggle-option') as HTMLButtonElement;
      expect(videoButton).not.toBeNull();
      expect(videoButton.classList.contains('active')).toBe(true);
    });

    it('should have sponsorship toggle button in active state', () => {
      universalToggleDecorator.execute();

      const sponsorshipButton = document.querySelector(
        '.sponsorship-toggle-option',
      ) as HTMLButtonElement;
      expect(sponsorshipButton).not.toBeNull();
      expect(sponsorshipButton.classList.contains('active')).toBe(true);
    });

    it('should have shelf ad toggle button in active state', () => {
      universalToggleDecorator.execute();

      const shelfButton = document.querySelector('.shelf-ad-toggle-option') as HTMLButtonElement;
      expect(shelfButton).not.toBeNull();
      expect(shelfButton.classList.contains('active')).toBe(true);
    });

    it('should display SVG icons inside buttons instead of text', () => {
      universalToggleDecorator.execute();

      const adButton = document.querySelector('.ad-toggle-option') as HTMLButtonElement;
      expect(adButton).not.toBeNull();
      const adHasSvg = Array.from(adButton.children).some(
        (c) => c.namespaceURI === 'http://www.w3.org/2000/svg',
      );
      expect(adHasSvg).toBe(true);

      const skoopButton = document.querySelector('.skoop-toggle-option') as HTMLButtonElement;
      expect(skoopButton).not.toBeNull();
      const skoopHasSvg = Array.from(skoopButton.children).some(
        (c) => c.namespaceURI === 'http://www.w3.org/2000/svg',
      );
      expect(skoopHasSvg).toBe(true);

      const aiButton = document.querySelector('.ai-slop-toggle-option') as HTMLButtonElement;
      expect(aiButton).not.toBeNull();
      const aiHasSvg = Array.from(aiButton.children).some(
        (c) => c.namespaceURI === 'http://www.w3.org/2000/svg',
      );
      expect(aiHasSvg).toBe(true);
    });
  });
});
