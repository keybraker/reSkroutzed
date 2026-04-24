import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { DomClient } from '../../src/clients/dom/client';
import { State } from '../../src/common/types/State.type';
import { ShelfProductAdHandler } from '../../src/handlers/ShelfProductAd.handler';

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
      productAdCount: 0,
      ShelfAdCount: 0,
      recommendationAdCount: 0,
      videoAdCount: 0,
      sponsorshipAdCount: 0,
      language: 0,
      darkMode: false,
      minimumPriceDifference: 0,
    };

    shelfProductAdHandler = new ShelfProductAdHandler(mockState);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('flag', () => {
    it('should set ShelfAdCount to 0 initially', () => {
      mockSelectorResults({
        '.flagged-shelf': [],
        'li:not(.flagged-shelf)': [],
        '#cross-sell': [],
        '.content.top-area.cross-sell-shelf.sponsored-shelf': [],
        '.selected-product-cards:not(.flagged-shelf)': [],
        '.sponsored-shelf:not(.flagged-shelf)': [],
        '.js-recently-viewed-skus-shelf:not(.flagged-shelf)': [],
        '.placement-shelf:not(.flagged-shelf)': [],
        '.polymorphic-brand-shelf:not(.flagged-shelf)': [],
      });

      shelfProductAdHandler.flag();

      expect(mockState.ShelfAdCount).toBe(0);
    });

    it('should increment ShelfAdCount for each flagged shelf element', () => {
      const flaggedElements = [document.createElement('div'), document.createElement('div')];

      mockSelectorResults({
        '.flagged-shelf': flaggedElements,
        'li:not(.flagged-shelf)': [],
        '#cross-sell': [],
        '.content.top-area.cross-sell-shelf.sponsored-shelf': [],
        '.selected-product-cards:not(.flagged-shelf)': [],
        '.sponsored-shelf:not(.flagged-shelf)': [],
        '.js-recently-viewed-skus-shelf:not(.flagged-shelf)': [],
        '.placement-shelf:not(.flagged-shelf)': [],
        '.polymorphic-brand-shelf:not(.flagged-shelf)': [],
      });

      shelfProductAdHandler.flag();

      expect(mockState.ShelfAdCount).toBe(2);
    });

    it('should flag and count shelf elements that match shelfAdClasses', () => {
      const liElement = document.createElement('li');
      liElement.classList.add('selected-product-cards');
      const selectedProductCards = document.createElement('div');
      const sponsoredShelf = document.createElement('div');

      mockSelectorResults({
        '.flagged-shelf': [],
        'li:not(.flagged-shelf)': [liElement],
        '#cross-sell': [],
        '.content.top-area.cross-sell-shelf.sponsored-shelf': [],
        '.selected-product-cards:not(.flagged-shelf)': [selectedProductCards],
        '.sponsored-shelf:not(.flagged-shelf)': [sponsoredShelf],
        '.js-recently-viewed-skus-shelf:not(.flagged-shelf)': [],
        '.placement-shelf:not(.flagged-shelf)': [],
        '.polymorphic-brand-shelf:not(.flagged-shelf)': [],
      });

      shelfProductAdHandler.flag();

      expect(DomClient.addClassesToElement).toHaveBeenCalledTimes(3);
      expect(DomClient.updateElementVisibility).toHaveBeenCalledTimes(3);
      expect(mockState.ShelfAdCount).toBe(3);
    });

    it('should flag placement shelf advertisements', () => {
      const placementShelfElement = document.createElement('div');
      placementShelfElement.classList.add('placement-shelf');
      placementShelfElement.classList.add('polymorphic-brand-shelf');

      mockSelectorResults({
        '.flagged-shelf': [],
        'li:not(.flagged-shelf)': [],
        '#cross-sell': [],
        '.content.top-area.cross-sell-shelf.sponsored-shelf': [],
        '.selected-product-cards:not(.flagged-shelf)': [],
        '.sponsored-shelf:not(.flagged-shelf)': [],
        '.js-recently-viewed-skus-shelf:not(.flagged-shelf)': [],
        '.placement-shelf:not(.flagged-shelf)': [placementShelfElement],
        '.polymorphic-brand-shelf:not(.flagged-shelf)': [],
      });

      shelfProductAdHandler.flag();

      expect(DomClient.addClassesToElement).toHaveBeenCalledWith(
        placementShelfElement,
        'flagged-shelf',
      );
      expect(DomClient.updateElementVisibility).toHaveBeenCalledWith(placementShelfElement, 'hide');
      expect(mockState.ShelfAdCount).toBe(1);
    });

    it('should flag cross-sell shelf containers', () => {
      const crossSellElement = document.createElement('section');
      crossSellElement.id = 'cross-sell';
      const crossSellShelfElement = document.createElement('section');
      crossSellShelfElement.classList.add(
        'content',
        'top-area',
        'cross-sell-shelf',
        'sponsored-shelf',
      );

      mockSelectorResults({
        '.flagged-shelf': [],
        'li:not(.flagged-shelf)': [],
        '#cross-sell': [crossSellElement],
        '.content.top-area.cross-sell-shelf.sponsored-shelf': [crossSellShelfElement],
        '.selected-product-cards:not(.flagged-shelf)': [],
        '.sponsored-shelf:not(.flagged-shelf)': [],
        '.js-recently-viewed-skus-shelf:not(.flagged-shelf)': [],
        '.placement-shelf:not(.flagged-shelf)': [],
        '.polymorphic-brand-shelf:not(.flagged-shelf)': [],
      });

      shelfProductAdHandler.flag();

      expect(DomClient.addClassesToElement).toHaveBeenCalledWith(crossSellElement, 'flagged-shelf');
      expect(DomClient.addClassesToElement).toHaveBeenCalledWith(
        crossSellShelfElement,
        'flagged-shelf',
      );
      expect(DomClient.updateElementVisibility).toHaveBeenCalledWith(crossSellElement, 'hide');
      expect(DomClient.updateElementVisibility).toHaveBeenCalledWith(crossSellShelfElement, 'hide');
      expect(DomClient.getElementsByClass).toHaveBeenCalledWith('#cross-sell');
      expect(DomClient.getElementsByClass).toHaveBeenCalledWith('.secondary-sku-card-shelf');
      expect(DomClient.getElementsByClass).toHaveBeenCalledWith(
        '.content.top-area.cross-sell-shelf.sponsored-shelf',
      );
      expect(mockState.ShelfAdCount).toBe(3);
    });
  });

  describe('visibilityUpdate', () => {
    it('should update visibility for all flagged shelf elements', () => {
      const flaggedElements = [document.createElement('div'), document.createElement('div')];
      mockSelectorResults({
        '.flagged-shelf': flaggedElements,
      });

      mockState.hideShelfProductAds = false;
      shelfProductAdHandler.visibilityUpdate();

      expect(DomClient.updateElementVisibility).toHaveBeenCalledTimes(2);
      expect(DomClient.updateElementVisibility).toHaveBeenCalledWith(flaggedElements[0], 'hide');
      expect(DomClient.updateElementVisibility).toHaveBeenCalledWith(flaggedElements[1], 'hide');

      vi.mocked(DomClient.updateElementVisibility).mockClear();
      mockSelectorResults({
        '.flagged-shelf': flaggedElements,
      });

      mockState.hideShelfProductAds = true;
      shelfProductAdHandler.visibilityUpdate();

      expect(DomClient.updateElementVisibility).toHaveBeenCalledTimes(2);
      expect(DomClient.updateElementVisibility).toHaveBeenCalledWith(flaggedElements[0], 'show');
      expect(DomClient.updateElementVisibility).toHaveBeenCalledWith(flaggedElements[1], 'show');
    });
  });

  describe('updateCountAndVisibility', () => {
    it('should increment count and update visibility when element matches criteria', () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const updateCountAndVisibility = (shelfProductAdHandler as any).updateCountAndVisibility.bind(
        shelfProductAdHandler,
      );

      const element = document.createElement('div');
      element.classList.add('selected-product-cards');

      mockState.hideShelfProductAds = false;
      updateCountAndVisibility(element);

      expect(mockState.ShelfAdCount).toBe(1);
      expect(DomClient.addClassesToElement).toHaveBeenCalledWith(element, 'flagged-shelf');
      expect(DomClient.updateElementVisibility).toHaveBeenCalledWith(element, 'hide');

      mockState.ShelfAdCount = 0;
      vi.mocked(DomClient.addClassesToElement).mockClear();
      vi.mocked(DomClient.updateElementVisibility).mockClear();

      mockState.hideShelfProductAds = true;
      updateCountAndVisibility(element);

      expect(mockState.ShelfAdCount).toBe(1);
      expect(DomClient.addClassesToElement).toHaveBeenCalledWith(element, 'flagged-shelf');
      expect(DomClient.updateElementVisibility).toHaveBeenCalledWith(element, 'show');
    });

    it('should not update count or visibility when element does not match criteria', () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const updateCountAndVisibility = (shelfProductAdHandler as any).updateCountAndVisibility.bind(
        shelfProductAdHandler,
      );

      const element = document.createElement('div');
      element.classList.add('not-a-shelf');

      updateCountAndVisibility(element);

      expect(mockState.ShelfAdCount).toBe(0);
      expect(DomClient.addClassesToElement).not.toHaveBeenCalled();
      expect(DomClient.updateElementVisibility).not.toHaveBeenCalled();
    });

    it('should not update already flagged elements', () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const updateCountAndVisibility = (shelfProductAdHandler as any).updateCountAndVisibility.bind(
        shelfProductAdHandler,
      );

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
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const flagElementsBySelector = (shelfProductAdHandler as any).flagElementsBySelector.bind(
        shelfProductAdHandler,
      );

      const elements = [document.createElement('div'), document.createElement('div')];
      vi.mocked(DomClient.getElementsByClass).mockReturnValueOnce(elements);

      mockState.hideShelfProductAds = false;
      flagElementsBySelector('.test-selector');

      expect(mockState.ShelfAdCount).toBe(2);
      expect(DomClient.getElementsByClass).toHaveBeenCalledWith('.test-selector');
      expect(DomClient.addClassesToElement).toHaveBeenCalledTimes(2);
      expect(DomClient.updateElementVisibility).toHaveBeenCalledTimes(2);

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
