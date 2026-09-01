import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { DomClient } from '../../src/clients/dom/client';
import { State } from '../../src/common/types/State.type';
import { ListProductAdHandler } from '../../src/handlers/ListProductAd.handler';

vi.mock('../../src/clients/dom/client', () => ({
  DomClient: {
    getElementsByClass: vi.fn(),
    getElementByClass: vi.fn(),
    addClassesToElement: vi.fn(),
    updateElementVisibility: vi.fn(),
  },
}));

describe('ListProductAdHandler', () => {
  let listProductAdHandler: ListProductAdHandler;
  let mockState: State;

  const mockSelectorResults = (selectorResults: Record<string, Element[]>) => {
    vi.mocked(DomClient.getElementsByClass).mockImplementation(
      (selector: string, _searchElement?: Element) => selectorResults[selector] ?? [],
    );
  };

  const mockGetElementByClass = (results: Map<string, Element | null>) => {
    vi.mocked(DomClient.getElementByClass).mockImplementation(
      (className: string, _searchElement?: Element) => results.get(className) ?? null,
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
      hideSkoopAds: false,
      hideAISlop: false,
      wideMode: false,
      hideUniversalToggle: false,
      productAdCount: 0,
      shelfAdCount: 0,
      recommendationAdCount: 0,
      skoopAdCount: 0,
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
        '.item-mark:not(.flagged-product)': [],
        '.product-mark:not(.flagged-product)': [],
        '.tracking-img': [],
      });
      mockGetElementByClass(new Map());

      listProductAdHandler.flag();

      expect(mockState.productAdCount).toBe(0);
    });

    it('should increment productAdCount for each flagged product element', () => {
      const flaggedElements = [document.createElement('div'), document.createElement('div')];
      mockSelectorResults({
        '.flagged-product': flaggedElements,
        'li:not(.flagged-product)': [],
        '.item-mark:not(.flagged-product)': [],
        '.product-mark:not(.flagged-product)': [],
        '.tracking-img': [],
      });
      mockGetElementByClass(new Map());

      listProductAdHandler.flag();

      expect(mockState.productAdCount).toBe(2);
    });

    it('should flag and count product cards with item-mark and product-mark classes', () => {
      const mockLiElement = document.createElement('li');
      mockLiElement.classList.add('item-mark');

      const mockItemMark = document.createElement('div');
      const mockProductMark = document.createElement('div');
      mockItemMark.classList.add('item-mark');
      mockProductMark.classList.add('product-mark');

      mockSelectorResults({
        '.flagged-product': [],
        'li:not(.flagged-product)': [mockLiElement],
        '.item-mark:not(.flagged-product)': [mockItemMark],
        '.product-mark:not(.flagged-product)': [mockProductMark],
        '.tracking-img': [],
      });
      mockGetElementByClass(new Map());

      listProductAdHandler.flag();

      expect(DomClient.addClassesToElement).toHaveBeenCalledTimes(3);
      expect(DomClient.updateElementVisibility).toHaveBeenCalledTimes(3);
      expect(mockState.productAdCount).toBe(3);
    });

    it('should flag parent li of tracking-img elements', () => {
      const liElement = document.createElement('li');
      const trackingImg = document.createElement('img');
      trackingImg.classList.add('tracking-img');
      liElement.appendChild(trackingImg);

      mockSelectorResults({
        '.flagged-product': [],
        'li:not(.flagged-product)': [],
        '.item-mark:not(.flagged-product)': [],
        '.product-mark:not(.flagged-product)': [],
        '.tracking-img': [trackingImg],
      });
      mockGetElementByClass(new Map());

      listProductAdHandler.flag();

      expect(DomClient.addClassesToElement).toHaveBeenCalledWith(liElement, 'flagged-product');
      expect(liElement.getAttribute('data-reskroutzed-label')).toBe('advertisement');
      expect(mockState.productAdCount).toBe(1);
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
});
