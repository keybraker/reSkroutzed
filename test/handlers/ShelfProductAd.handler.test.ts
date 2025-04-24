// filepath: c:\Users\Keybraker\Github\reSkroutzed\test\handlers\ShelfProductAd.handler.test.ts
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

import { ShelfProductAdHandler } from '../../src/handlers/ShelfProductAd.handler';
import { DomClient } from '../../src/clients/dom/client';
import { State } from '../../src/common/types/State.type';

// Mock the DomClient
vi.mock('../../src/clients/dom/client', () => ({
  DomClient: {
    getElementsByClass: vi.fn(),
    addClassesToElement: vi.fn(),
    updateElementVisibility: vi.fn(),
  },
}));

describe('ShelfProductAdHandler', () => {
  let shelfProductAdHandler: ShelfProductAdHandler;
  let mockState: State;
  let mockShelfElement: Element;

  beforeEach(() => {
    // Reset all mocks
    vi.resetAllMocks();

    // Create mock state
    mockState = {
      hideVideoAds: false,
      hideProductAds: false,
      hideSponsorships: false,
      hideShelfProductAds: false,
      productAdCount: 0,
      ShelfAdCount: 0,
      videoAdCount: 0,
      sponsorshipAdCount: 0,
      language: 0,
      darkMode: false,
      minimumPriceDifference: 0,
    };

    // Create a mock element
    mockShelfElement = document.createElement('div');
    mockShelfElement.classList.add('selected-product-cards');

    // Create instance of ShelfProductAdHandler with mock state
    shelfProductAdHandler = new ShelfProductAdHandler(mockState);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('flag', () => {
    it('should set ShelfAdCount to 0 initially', () => {
      // Mock returning empty array for flagged shelf elements
      vi.mocked(DomClient.getElementsByClass).mockReturnValueOnce([]);

      // Mock li elements that don't match shelf classes
      const mockLiElement = document.createElement('li');
      vi.mocked(DomClient.getElementsByClass).mockReturnValueOnce([mockLiElement]);

      // Mock returning empty arrays for shelf ad classes
      vi.mocked(DomClient.getElementsByClass).mockReturnValue([]);

      shelfProductAdHandler.flag();

      expect(mockState.ShelfAdCount).toBe(0);
    });

    it('should increment ShelfAdCount for each flagged shelf element', () => {
      // Mock existing flagged elements
      const flaggedElements = [document.createElement('div'), document.createElement('div')];
      vi.mocked(DomClient.getElementsByClass).mockReturnValueOnce(flaggedElements);

      // Mock li elements that don't match shelf classes
      vi.mocked(DomClient.getElementsByClass).mockReturnValueOnce([]);

      // Mock empty arrays for additional shelf elements
      vi.mocked(DomClient.getElementsByClass).mockReturnValue([]);

      shelfProductAdHandler.flag();

      expect(mockState.ShelfAdCount).toBe(2);
    });

    it('should flag and count shelf elements that match shelfAdClasses', () => {
      // Initial flagged elements
      vi.mocked(DomClient.getElementsByClass).mockReturnValueOnce([]);

      // Mock li elements that match shelf classes but aren't flagged yet
      const mockLiElement = document.createElement('li');
      mockLiElement.classList.add('selected-product-cards');
      vi.mocked(DomClient.getElementsByClass).mockReturnValueOnce([mockLiElement]);

      // Mock additional shelf elements
      const mockSelectedProductCards = document.createElement('div');
      const mockSponsoredShelf = document.createElement('div');
      vi.mocked(DomClient.getElementsByClass).mockReturnValueOnce([mockSelectedProductCards]);
      vi.mocked(DomClient.getElementsByClass).mockReturnValueOnce([mockSponsoredShelf]);
      vi.mocked(DomClient.getElementsByClass).mockReturnValue([]);

      shelfProductAdHandler.flag();

      // Should have called addClassesToElement for each shelf element
      expect(DomClient.addClassesToElement).toHaveBeenCalledTimes(3);
      expect(DomClient.updateElementVisibility).toHaveBeenCalledTimes(3);
      expect(mockState.ShelfAdCount).toBe(3);
    });
  });

  describe('visibilityUpdate', () => {
    it('should update visibility for all flagged shelf elements', () => {
      // Mock flagged shelf elements
      const flaggedElements = [document.createElement('div'), document.createElement('div')];
      vi.mocked(DomClient.getElementsByClass).mockReturnValueOnce(flaggedElements);

      // Test with hideShelfProductAds set to false
      mockState.hideShelfProductAds = false;
      shelfProductAdHandler.visibilityUpdate();

      // Should call updateElementVisibility with 'hide' for each element
      expect(DomClient.updateElementVisibility).toHaveBeenCalledTimes(2);
      expect(DomClient.updateElementVisibility).toHaveBeenCalledWith(flaggedElements[0], 'hide');
      expect(DomClient.updateElementVisibility).toHaveBeenCalledWith(flaggedElements[1], 'hide');

      // Reset calls
      vi.mocked(DomClient.updateElementVisibility).mockClear();
      vi.mocked(DomClient.getElementsByClass).mockReturnValueOnce(flaggedElements);

      // Test with hideShelfProductAds set to true
      mockState.hideShelfProductAds = true;
      shelfProductAdHandler.visibilityUpdate();

      // Should call updateElementVisibility with 'show' for each element
      expect(DomClient.updateElementVisibility).toHaveBeenCalledTimes(2);
      expect(DomClient.updateElementVisibility).toHaveBeenCalledWith(flaggedElements[0], 'show');
      expect(DomClient.updateElementVisibility).toHaveBeenCalledWith(flaggedElements[1], 'show');
    });
  });

  describe('updateCountAndVisibility', () => {
    it('should increment count and update visibility when element matches criteria', () => {
      // Create private method test helper
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const updateCountAndVisibility = (shelfProductAdHandler as any).updateCountAndVisibility.bind(
        shelfProductAdHandler,
      );

      // Create element with matching class
      const element = document.createElement('div');
      element.classList.add('selected-product-cards');

      // Test with hideShelfProductAds set to false
      mockState.hideShelfProductAds = false;
      updateCountAndVisibility(element);

      expect(mockState.ShelfAdCount).toBe(1);
      expect(DomClient.addClassesToElement).toHaveBeenCalledWith(element, 'flagged-shelf');
      expect(DomClient.updateElementVisibility).toHaveBeenCalledWith(element, 'hide');

      // Reset state and mocks
      mockState.ShelfAdCount = 0;
      vi.mocked(DomClient.addClassesToElement).mockClear();
      vi.mocked(DomClient.updateElementVisibility).mockClear();

      // Test with hideShelfProductAds set to true
      mockState.hideShelfProductAds = true;
      updateCountAndVisibility(element);

      expect(mockState.ShelfAdCount).toBe(1);
      expect(DomClient.addClassesToElement).toHaveBeenCalledWith(element, 'flagged-shelf');
      expect(DomClient.updateElementVisibility).toHaveBeenCalledWith(element, 'show');
    });

    it('should not update count or visibility when element does not match criteria', () => {
      // Create private method test helper
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const updateCountAndVisibility = (shelfProductAdHandler as any).updateCountAndVisibility.bind(
        shelfProductAdHandler,
      );

      // Create element without matching class
      const element = document.createElement('div');
      element.classList.add('not-a-shelf');

      updateCountAndVisibility(element);

      expect(mockState.ShelfAdCount).toBe(0);
      expect(DomClient.addClassesToElement).not.toHaveBeenCalled();
      expect(DomClient.updateElementVisibility).not.toHaveBeenCalled();
    });

    it('should not update already flagged elements', () => {
      // Create private method test helper
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const updateCountAndVisibility = (shelfProductAdHandler as any).updateCountAndVisibility.bind(
        shelfProductAdHandler,
      );

      // Create element that's already flagged
      const element = document.createElement('div');
      element.classList.add('selected-product-cards');
      element.classList.add('flagged-shelf');

      updateCountAndVisibility(element);

      expect(mockState.ShelfAdCount).toBe(0);
      expect(DomClient.addClassesToElement).not.toHaveBeenCalled();
      expect(DomClient.updateElementVisibility).not.toHaveBeenCalled();
    });
  });

  describe('flagElementsBySelector', () => {
    it('should flag all elements matching the selector', () => {
      // Create private method test helper
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const flagElementsBySelector = (shelfProductAdHandler as any).flagElementsBySelector.bind(
        shelfProductAdHandler,
      );

      // Mock elements to be returned by getElementsByClass
      const elements = [document.createElement('div'), document.createElement('div')];
      vi.mocked(DomClient.getElementsByClass).mockReturnValueOnce(elements);

      // Test with hideShelfProductAds set to false
      mockState.hideShelfProductAds = false;
      flagElementsBySelector('.test-selector');

      expect(mockState.ShelfAdCount).toBe(2);
      expect(DomClient.getElementsByClass).toHaveBeenCalledWith('.test-selector');
      expect(DomClient.addClassesToElement).toHaveBeenCalledTimes(2);
      expect(DomClient.updateElementVisibility).toHaveBeenCalledTimes(2);

      // Test with hideShelfProductAds set to true
      mockState.ShelfAdCount = 0;
      vi.mocked(DomClient.getElementsByClass).mockReturnValueOnce(elements);
      vi.mocked(DomClient.addClassesToElement).mockClear();
      vi.mocked(DomClient.updateElementVisibility).mockClear();

      mockState.hideShelfProductAds = true;
      flagElementsBySelector('.test-selector');

      expect(mockState.ShelfAdCount).toBe(2);
      expect(DomClient.getElementsByClass).toHaveBeenCalledWith('.test-selector');
      expect(DomClient.addClassesToElement).toHaveBeenCalledTimes(2);
      expect(DomClient.updateElementVisibility).toHaveBeenCalledTimes(2);
      expect(DomClient.updateElementVisibility).toHaveBeenCalledWith(elements[0], 'show');
      expect(DomClient.updateElementVisibility).toHaveBeenCalledWith(elements[1], 'show');
    });
  });
});
