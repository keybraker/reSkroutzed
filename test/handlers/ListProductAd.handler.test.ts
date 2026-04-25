import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { DomClient } from '../../src/clients/dom/client';
import { State } from '../../src/common/types/State.type';
import { ListProductAdHandler } from '../../src/handlers/ListProductAd.handler';

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

  const mockSelectorResults = (selectorResults: Record<string, Element[]>) => {
    vi.mocked(DomClient.getElementsByClass).mockImplementation(
      (selector: string) => selectorResults[selector] ?? [],
    );
  };

  beforeEach(() => {
    vi.resetAllMocks();

    mockState = {
      hideVideoAds: false,
      hideProductAds: false,
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
      language: 0,
      darkMode: false,
      minimumPriceDifference: 0,
      isMobile: false,
    };

    listProductAdHandler = new ListProductAdHandler(mockState);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('flag', () => {
    it('should set productAdCount to 0 initially', () => {
      const mockLiElement = document.createElement('li');
      mockSelectorResults({
        '.flagged-product': [],
        'li:not(.flagged-product)': [mockLiElement],
        '.labeled-item:not(.flagged-product)': [],
        '.labeled-product:not(.flagged-product)': [],
        '.card.tracking-img-container:not(.flagged-product)': [],
      });

      listProductAdHandler.flag();

      expect(mockState.productAdCount).toBe(0);
    });

    it('should increment productAdCount for each flagged product element', () => {
      const flaggedElements = [document.createElement('div'), document.createElement('div')];
      mockSelectorResults({
        '.flagged-product': flaggedElements,
        'li:not(.flagged-product)': [],
        '.labeled-item:not(.flagged-product)': [],
        '.labeled-product:not(.flagged-product)': [],
        '.card.tracking-img-container:not(.flagged-product)': [],
      });

      listProductAdHandler.flag();

      expect(mockState.productAdCount).toBe(2);
    });

    it('should flag and count product and tracked recommendation cards separately', () => {
      const mockLiElement = document.createElement('li');
      mockLiElement.classList.add('labeled-item');

      const mockLabeledItem = document.createElement('div');
      const mockLabeledProduct = document.createElement('div');
      mockLabeledItem.classList.add('labeled-item');
      mockLabeledProduct.classList.add('labeled-product');
      const trackedProductCard = document.createElement('div');
      trackedProductCard.classList.add('card', 'tracking-img-container');

      mockSelectorResults({
        '.flagged-product': [],
        'li:not(.flagged-product)': [mockLiElement],
        '.labeled-item:not(.flagged-product)': [mockLabeledItem],
        '.labeled-product:not(.flagged-product)': [mockLabeledProduct],
        '.card.tracking-img-container:not(.flagged-product)': [trackedProductCard],
      });

      listProductAdHandler.flag();

      expect(DomClient.addClassesToElement).toHaveBeenCalledTimes(4);
      expect(DomClient.addClassesToElement).toHaveBeenCalledWith(
        trackedProductCard,
        'flagged-product',
      );
      expect(DomClient.updateElementVisibility).toHaveBeenCalledTimes(4);
      expect(mockState.productAdCount).toBe(4);
    });

    it('should flag tracked recommendation cards with the tracked class only', () => {
      const trackedProductCard = document.createElement('div');
      trackedProductCard.classList.add('card', 'tracking-img-container');
      mockSelectorResults({
        '.flagged-product': [],
        'li:not(.flagged-product)': [],
        '.labeled-item:not(.flagged-product)': [],
        '.labeled-product:not(.flagged-product)': [],
        '.card.tracking-img-container:not(.flagged-product)': [trackedProductCard],
      });

      listProductAdHandler.flag();

      expect(DomClient.addClassesToElement).toHaveBeenCalledWith(
        trackedProductCard,
        'flagged-product',
      );
      expect(trackedProductCard.getAttribute('data-reskroutzed-label')).toBe('advertisement');
    });
  });

  describe('visibilityUpdate', () => {
    it('should update visibility for all flagged product elements', () => {
      const flaggedElements = [document.createElement('div'), document.createElement('div')];

      mockSelectorResults({
        '.flagged-product': flaggedElements,
      });

      mockState.hideProductAds = false;
      listProductAdHandler.visibilityUpdate();

      expect(DomClient.updateElementVisibility).toHaveBeenCalledTimes(2);
      expect(DomClient.updateElementVisibility).toHaveBeenCalledWith(flaggedElements[0], 'hide');
      expect(DomClient.updateElementVisibility).toHaveBeenCalledWith(flaggedElements[1], 'hide');

      vi.mocked(DomClient.updateElementVisibility).mockClear();
      mockSelectorResults({
        '.flagged-product': flaggedElements,
      });

      mockState.hideProductAds = true;
      listProductAdHandler.visibilityUpdate();

      expect(DomClient.updateElementVisibility).toHaveBeenCalledTimes(2);
      expect(DomClient.updateElementVisibility).toHaveBeenCalledWith(flaggedElements[0], 'show');
      expect(DomClient.updateElementVisibility).toHaveBeenCalledWith(flaggedElements[1], 'show');
    });
  });

  describe('updateCountAndVisibility', () => {
    it('should increment count and update visibility when element matches criteria', () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const updateCountAndVisibility = (listProductAdHandler as any).updateCountAndVisibility.bind(
        listProductAdHandler,
      );

      const element = document.createElement('div');
      element.classList.add('labeled-item');

      mockState.hideProductAds = false;
      updateCountAndVisibility(element);

      expect(mockState.productAdCount).toBe(1);
      expect(DomClient.addClassesToElement).toHaveBeenCalledWith(element, 'flagged-product');
      expect(DomClient.updateElementVisibility).toHaveBeenCalledWith(element, 'hide');

      mockState.productAdCount = 0;
      vi.mocked(DomClient.addClassesToElement).mockClear();
      vi.mocked(DomClient.updateElementVisibility).mockClear();

      mockState.hideProductAds = true;
      updateCountAndVisibility(element);

      expect(mockState.productAdCount).toBe(1);
      expect(DomClient.addClassesToElement).toHaveBeenCalledWith(element, 'flagged-product');
      expect(DomClient.updateElementVisibility).toHaveBeenCalledWith(element, 'show');
    });

    it('should not update count or visibility when element does not match criteria', () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const updateCountAndVisibility = (listProductAdHandler as any).updateCountAndVisibility.bind(
        listProductAdHandler,
      );

      const element = document.createElement('div');
      element.classList.add('not-a-product');

      updateCountAndVisibility(element);

      expect(mockState.productAdCount).toBe(0);
      expect(DomClient.addClassesToElement).not.toHaveBeenCalled();
      expect(DomClient.updateElementVisibility).not.toHaveBeenCalled();
    });

    it('should not update already flagged elements', () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const updateCountAndVisibility = (listProductAdHandler as any).updateCountAndVisibility.bind(
        listProductAdHandler,
      );

      const element = document.createElement('div');
      element.classList.add('labeled-item', 'flagged-product');

      updateCountAndVisibility(element);

      expect(mockState.productAdCount).toBe(0);
      expect(DomClient.addClassesToElement).not.toHaveBeenCalled();
      expect(DomClient.updateElementVisibility).not.toHaveBeenCalled();
    });

    it('should not update already flagged tracked elements', () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const updateCountAndVisibility = (listProductAdHandler as any).updateCountAndVisibility.bind(
        listProductAdHandler,
      );

      const element = document.createElement('div');
      element.classList.add('labeled-item', 'flagged-product');

      updateCountAndVisibility(element);

      expect(mockState.productAdCount).toBe(0);
      expect(DomClient.addClassesToElement).not.toHaveBeenCalled();
      expect(DomClient.updateElementVisibility).not.toHaveBeenCalled();
    });
  });

  describe('flagElementsBySelector', () => {
    it('should flag all generic elements matching the selector', () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const flagElementsBySelector = (listProductAdHandler as any).flagElementsBySelector.bind(
        listProductAdHandler,
      );

      const elements = [document.createElement('div'), document.createElement('div')];
      vi.mocked(DomClient.getElementsByClass).mockReturnValueOnce(elements);

      mockState.hideProductAds = false;
      flagElementsBySelector('.test-selector');

      expect(mockState.productAdCount).toBe(2);
      expect(DomClient.getElementsByClass).toHaveBeenCalledWith('.test-selector');
      expect(DomClient.addClassesToElement).toHaveBeenCalledTimes(2);
      expect(DomClient.addClassesToElement).toHaveBeenCalledWith(elements[0], 'flagged-product');
      expect(DomClient.updateElementVisibility).toHaveBeenCalledTimes(2);

      mockState.productAdCount = 0;
      vi.mocked(DomClient.getElementsByClass).mockReturnValueOnce(elements);
      vi.mocked(DomClient.addClassesToElement).mockClear();
      vi.mocked(DomClient.updateElementVisibility).mockClear();

      mockState.hideProductAds = true;
      flagElementsBySelector('.test-selector');

      expect(mockState.productAdCount).toBe(2);
      expect(DomClient.updateElementVisibility).toHaveBeenCalledWith(elements[0], 'show');
      expect(DomClient.updateElementVisibility).toHaveBeenCalledWith(elements[1], 'show');
    });

    it('should flag tracked recommendation selector matches with the tracked class', () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const flagElementsBySelector = (listProductAdHandler as any).flagElementsBySelector.bind(
        listProductAdHandler,
      );

      const trackedElement = document.createElement('div');
      trackedElement.classList.add('card', 'tracking-img-container');
      vi.mocked(DomClient.getElementsByClass).mockReturnValueOnce([trackedElement]);

      flagElementsBySelector('.card.tracking-img-container');

      expect(DomClient.addClassesToElement).toHaveBeenCalledWith(trackedElement, 'flagged-product');
      expect(trackedElement.getAttribute('data-reskroutzed-label')).toBe('advertisement');
    });
  });
});
