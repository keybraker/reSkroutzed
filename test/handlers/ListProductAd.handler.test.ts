// filepath: c:\Users\Keybraker\Github\reSkroutzed\test\handlers\ListProductAd.handler.test.ts
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { ListProductAdHandler } from '../../src/handlers/ListProductAd.handler';
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

describe('ListProductAdHandler', () => {
  let listProductAdHandler: ListProductAdHandler;
  let mockState: State;
  let mockProductElement: Element;

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
    mockProductElement = document.createElement('div');
    mockProductElement.classList.add('labeled-item');

    // Create instance of ListProductAdHandler with mock state
    listProductAdHandler = new ListProductAdHandler(mockState);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('flag', () => {
    it('should set productAdCount to 0 initially', () => {
      // Mock returning empty array for flagged product elements
      vi.mocked(DomClient.getElementsByClass).mockReturnValueOnce([]);

      // Mock li elements that don't match product classes
      const mockLiElement = document.createElement('li');
      vi.mocked(DomClient.getElementsByClass).mockReturnValueOnce([mockLiElement]);

      // Mock returning empty arrays for product ad classes
      vi.mocked(DomClient.getElementsByClass).mockReturnValue([]);

      listProductAdHandler.flag();

      expect(mockState.productAdCount).toBe(0);
    });

    it('should increment productAdCount for each flagged product element', () => {
      // Mock existing flagged elements
      const flaggedElements = [document.createElement('div'), document.createElement('div')];
      vi.mocked(DomClient.getElementsByClass).mockReturnValueOnce(flaggedElements);

      // Mock li elements that don't match product classes
      vi.mocked(DomClient.getElementsByClass).mockReturnValueOnce([]);

      // Mock empty arrays for additional product elements
      vi.mocked(DomClient.getElementsByClass).mockReturnValue([]);

      listProductAdHandler.flag();

      expect(mockState.productAdCount).toBe(2);
    });

    it('should flag and count product elements that match productAdClasses', () => {
      // Initial flagged elements
      vi.mocked(DomClient.getElementsByClass).mockReturnValueOnce([]);

      // Mock li elements that match product classes but aren't flagged yet
      const mockLiElement = document.createElement('li');
      mockLiElement.classList.add('labeled-item');
      vi.mocked(DomClient.getElementsByClass).mockReturnValueOnce([mockLiElement]);

      // Mock additional product elements
      const mockLabeledItem = document.createElement('div');
      const mockLabeledProduct = document.createElement('div');
      vi.mocked(DomClient.getElementsByClass).mockReturnValueOnce([mockLabeledItem]);
      vi.mocked(DomClient.getElementsByClass).mockReturnValueOnce([mockLabeledProduct]);
      vi.mocked(DomClient.getElementsByClass).mockReturnValue([]);

      listProductAdHandler.flag();

      // Should have called addClassesToElement for each product element
      expect(DomClient.addClassesToElement).toHaveBeenCalledTimes(3);
      expect(DomClient.updateElementVisibility).toHaveBeenCalledTimes(3);
      expect(mockState.productAdCount).toBe(3);
    });
  });

  describe('visibilityUpdate', () => {
    it('should update visibility for all flagged product elements', () => {
      // Mock flagged product elements
      const flaggedElements = [document.createElement('div'), document.createElement('div')];
      vi.mocked(DomClient.getElementsByClass).mockReturnValueOnce(flaggedElements);

      // Test with hideProductAds set to false
      mockState.hideProductAds = false;
      listProductAdHandler.visibilityUpdate();

      // Should call updateElementVisibility with 'hide' for each element
      expect(DomClient.updateElementVisibility).toHaveBeenCalledTimes(2);
      expect(DomClient.updateElementVisibility).toHaveBeenCalledWith(flaggedElements[0], 'hide');
      expect(DomClient.updateElementVisibility).toHaveBeenCalledWith(flaggedElements[1], 'hide');

      // Reset calls
      vi.mocked(DomClient.updateElementVisibility).mockClear();
      vi.mocked(DomClient.getElementsByClass).mockReturnValueOnce(flaggedElements);

      // Test with hideProductAds set to true
      mockState.hideProductAds = true;
      listProductAdHandler.visibilityUpdate();

      // Should call updateElementVisibility with 'show' for each element
      expect(DomClient.updateElementVisibility).toHaveBeenCalledTimes(2);
      expect(DomClient.updateElementVisibility).toHaveBeenCalledWith(flaggedElements[0], 'show');
      expect(DomClient.updateElementVisibility).toHaveBeenCalledWith(flaggedElements[1], 'show');
    });
  });

  describe('updateCountAndVisibility', () => {
    it('should increment count and update visibility when element matches criteria', () => {
      // Create private method test helper
      const updateCountAndVisibility = (listProductAdHandler as any).updateCountAndVisibility.bind(
        listProductAdHandler,
      );

      // Create element with matching class
      const element = document.createElement('div');
      element.classList.add('labeled-item');

      // Test with hideProductAds set to false
      mockState.hideProductAds = false;
      updateCountAndVisibility(element);

      expect(mockState.productAdCount).toBe(1);
      expect(DomClient.addClassesToElement).toHaveBeenCalledWith(element, 'flagged-product');
      expect(DomClient.updateElementVisibility).toHaveBeenCalledWith(element, 'hide');

      // Reset state and mocks
      mockState.productAdCount = 0;
      vi.mocked(DomClient.addClassesToElement).mockClear();
      vi.mocked(DomClient.updateElementVisibility).mockClear();

      // Test with hideProductAds set to true
      mockState.hideProductAds = true;
      updateCountAndVisibility(element);

      expect(mockState.productAdCount).toBe(1);
      expect(DomClient.addClassesToElement).toHaveBeenCalledWith(element, 'flagged-product');
      expect(DomClient.updateElementVisibility).toHaveBeenCalledWith(element, 'show');
    });

    it('should not update count or visibility when element does not match criteria', () => {
      // Create private method test helper
      const updateCountAndVisibility = (listProductAdHandler as any).updateCountAndVisibility.bind(
        listProductAdHandler,
      );

      // Create element without matching class
      const element = document.createElement('div');
      element.classList.add('not-a-product');

      updateCountAndVisibility(element);

      expect(mockState.productAdCount).toBe(0);
      expect(DomClient.addClassesToElement).not.toHaveBeenCalled();
      expect(DomClient.updateElementVisibility).not.toHaveBeenCalled();
    });

    it('should not update already flagged elements', () => {
      // Create private method test helper
      const updateCountAndVisibility = (listProductAdHandler as any).updateCountAndVisibility.bind(
        listProductAdHandler,
      );

      // Create element that's already flagged
      const element = document.createElement('div');
      element.classList.add('labeled-item');
      element.classList.add('flagged-product');

      updateCountAndVisibility(element);

      expect(mockState.productAdCount).toBe(0);
      expect(DomClient.addClassesToElement).not.toHaveBeenCalled();
      expect(DomClient.updateElementVisibility).not.toHaveBeenCalled();
    });
  });

  describe('flagElementsBySelector', () => {
    it('should flag all elements matching the selector', () => {
      // Create private method test helper
      const flagElementsBySelector = (listProductAdHandler as any).flagElementsBySelector.bind(
        listProductAdHandler,
      );

      // Mock elements to be returned by getElementsByClass
      const elements = [document.createElement('div'), document.createElement('div')];
      vi.mocked(DomClient.getElementsByClass).mockReturnValueOnce(elements);

      // Test with hideProductAds set to false
      mockState.hideProductAds = false;
      flagElementsBySelector('.test-selector');

      expect(mockState.productAdCount).toBe(2);
      expect(DomClient.getElementsByClass).toHaveBeenCalledWith('.test-selector');
      expect(DomClient.addClassesToElement).toHaveBeenCalledTimes(2);
      expect(DomClient.updateElementVisibility).toHaveBeenCalledTimes(2);

      // Test with hideProductAds set to true
      mockState.productAdCount = 0;
      vi.mocked(DomClient.getElementsByClass).mockReturnValueOnce(elements);
      vi.mocked(DomClient.addClassesToElement).mockClear();
      vi.mocked(DomClient.updateElementVisibility).mockClear();

      mockState.hideProductAds = true;
      flagElementsBySelector('.test-selector');

      expect(mockState.productAdCount).toBe(2);
      expect(DomClient.getElementsByClass).toHaveBeenCalledWith('.test-selector');
      expect(DomClient.addClassesToElement).toHaveBeenCalledTimes(2);
      expect(DomClient.updateElementVisibility).toHaveBeenCalledTimes(2);
      expect(DomClient.updateElementVisibility).toHaveBeenCalledWith(elements[0], 'show');
      expect(DomClient.updateElementVisibility).toHaveBeenCalledWith(elements[1], 'show');
    });
  });
});
