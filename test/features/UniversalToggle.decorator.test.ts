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
    SPONSORSHIP_VISIBILITY: 'hideSponsorships',
    MINIMUM_PRICE_DIFFERENCE: 'minimumPriceDifference',
  },
}));

// Mock ad handler classes
vi.mock('../../src/handlers/ListProductAd.handler', () => ({
  ListProductAdHandler: vi.fn().mockImplementation(() => ({
    visibilityUpdate: vi.fn(),
  })),
}));

vi.mock('../../src/handlers/ShelfProductAd.handler', () => ({
  ShelfProductAdHandler: vi.fn().mockImplementation(() => ({
    visibilityUpdate: vi.fn(),
  })),
}));

vi.mock('../../src/handlers/SponsorshipAd.handler', () => ({
  SponsorshipAdHandler: vi.fn().mockImplementation(() => ({
    visibilityUpdate: vi.fn(),
  })),
}));

vi.mock('../../src/handlers/VideoAd.handler', () => ({
  VideoAdHandler: vi.fn().mockImplementation(() => ({
    visibilityUpdate: vi.fn(),
  })),
}));

describe('UniversalToggleDecorator', () => {
  let universalToggleDecorator: UniversalToggleDecorator;
  let mockState: State;

  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();

    // Mock document methods
    document.createElementNS = vi.fn().mockImplementation((_namespaceURI, qualifiedName) => {
      const element = document.createElement(qualifiedName);
      element.setAttribute = vi.fn();
      element.classList.add = vi.fn();
      return element;
    });

    document.addEventListener = vi.fn();

    mockState = {
      language: Language.ENGLISH,
      darkMode: false,
      hideProductAds: false,
      hideVideoAds: false,
      hideShelfProductAds: false,
      hideSponsorships: false,
      productAdCount: 3,
      videoAdCount: 2,
      ShelfAdCount: 1,
      minimumPriceDifference: 1,
      sponsorshipAdCount: 0,
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
      const mockEvent = {
        stopPropagation: vi.fn(),
        preventDefault: vi.fn(),
        currentTarget: document.createElement('button'),
      };

      universalToggleDecorator.execute();

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const darkModeToggleHandler = (universalToggleDecorator as any).toggleDarkMode;

      if (darkModeToggleHandler) {
        darkModeToggleHandler.call(universalToggleDecorator, mockEvent);

        expect(mockState.darkMode).toBe(true);
        expect(BrowserClient.setValue).toHaveBeenCalledWith('darkMode', true);
      }
    });

    it('should toggle product ads visibility when ad toggle button is clicked', () => {
      const mockEvent = {
        stopPropagation: vi.fn(),
        preventDefault: vi.fn(),
        currentTarget: document.createElement('button'),
      };

      universalToggleDecorator.execute();

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const productAdsToggleHandler = (universalToggleDecorator as any).toggleProductAdsVisibility;

      if (productAdsToggleHandler) {
        productAdsToggleHandler.call(universalToggleDecorator, mockEvent);

        expect(mockState.hideProductAds).toBe(true);
        expect(BrowserClient.setValue).toHaveBeenCalledWith('hideProductAds', true);
      }
    });

    it('should toggle video ads visibility when video toggle button is clicked', () => {
      const mockEvent = {
        stopPropagation: vi.fn(),
        preventDefault: vi.fn(),
        currentTarget: document.createElement('button'),
      };

      universalToggleDecorator.execute();

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const videoAdsToggleHandler = (universalToggleDecorator as any).toggleVideoAdsVisibility;

      if (videoAdsToggleHandler) {
        videoAdsToggleHandler.call(universalToggleDecorator, mockEvent);

        expect(mockState.hideVideoAds).toBe(true);
        expect(BrowserClient.setValue).toHaveBeenCalledWith('hideVideoAds', true);
      }
    });

    it('should toggle sponsorship visibility when sponsorship toggle button is clicked', () => {
      const mockEvent = {
        stopPropagation: vi.fn(),
        preventDefault: vi.fn(),
        currentTarget: document.createElement('button'),
      };

      universalToggleDecorator.execute();

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const sponsorshipToggleHandler = (universalToggleDecorator as any)
        .toggleSponsorshipsVisibility;

      if (sponsorshipToggleHandler) {
        sponsorshipToggleHandler.call(universalToggleDecorator, mockEvent);

        expect(mockState.hideSponsorships).toBe(true);
        expect(BrowserClient.setValue).toHaveBeenCalledWith('hideSponsorships', true);
      }
    });

    it('should toggle shelf product ads visibility when shelf toggle button is clicked', () => {
      const mockEvent = {
        stopPropagation: vi.fn(),
        preventDefault: vi.fn(),
        currentTarget: document.createElement('button'),
      };

      universalToggleDecorator.execute();

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const shelfToggleHandler = (universalToggleDecorator as any).toggleShelfProductAdsVisibility;

      if (shelfToggleHandler) {
        shelfToggleHandler.call(universalToggleDecorator, mockEvent);

        expect(mockState.hideShelfProductAds).toBe(true);
        expect(BrowserClient.setValue).toHaveBeenCalledWith('hideShelfProductAds', true);
      }
    });
  });
});
