import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { DomClient } from '../../src/clients/dom/client';
import { State } from '../../src/common/types/State.type';
import { RecommendationAdHandler } from '../../src/handlers/RecommendationAd.handler';

vi.mock('../../src/clients/dom/client', () => ({
  DomClient: {
    getElementsByClass: vi.fn(),
    addClassesToElement: vi.fn(),
    updateElementVisibility: vi.fn(),
  },
}));

describe('RecommendationAdHandler', () => {
  let recommendationAdHandler: RecommendationAdHandler;
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

    recommendationAdHandler = new RecommendationAdHandler(mockState);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should count already flagged recommendation elements', () => {
    const flaggedElements = [document.createElement('div'), document.createElement('div')];

    mockSelectorResults({
      '.flagged-recommendation': flaggedElements,
      '#js-recommended-skus-shelf': [],
      '[class*="recommended-skus"]': [],
      '[class*="cart-recommendations"]': [],
    });

    recommendationAdHandler.flag();

    expect(mockState.recommendationAdCount).toBe(2);
  });

  it('should flag recommended sku containers and recommendation shelves', () => {
    const recommendedShelf = document.createElement('section');
    recommendedShelf.id = 'js-recommended-skus-shelf';
    const recommendedClassElement = document.createElement('div');
    recommendedClassElement.className = 'recommended-skus-panel';
    const cartRecommendationElement = document.createElement('div');
    cartRecommendationElement.className = 'cart-recommendations-widget';

    mockSelectorResults({
      '.flagged-recommendation': [],
      '#js-recommended-skus-shelf': [recommendedShelf],
      '[class*="recommended-skus"]': [recommendedClassElement],
      '[class*="cart-recommendations"]': [cartRecommendationElement],
    });

    recommendationAdHandler.flag();

    expect(DomClient.addClassesToElement).toHaveBeenCalledWith(
      recommendedShelf,
      'flagged-recommendation',
    );
    expect(DomClient.addClassesToElement).toHaveBeenCalledWith(
      recommendedClassElement,
      'flagged-recommendation',
    );
    expect(DomClient.addClassesToElement).toHaveBeenCalledWith(
      cartRecommendationElement,
      'flagged-recommendation',
    );
    expect(DomClient.updateElementVisibility).toHaveBeenCalledTimes(3);
    expect(mockState.recommendationAdCount).toBe(3);
  });

  it('should show flagged recommendation elements when recommendation hiding is disabled', () => {
    const flaggedElements = [document.createElement('div'), document.createElement('div')];
    mockSelectorResults({
      '.flagged-recommendation': flaggedElements,
    });

    mockState.hideRecommendationAds = true;
    recommendationAdHandler.visibilityUpdate();

    expect(DomClient.updateElementVisibility).toHaveBeenCalledWith(flaggedElements[0], 'show');
    expect(DomClient.updateElementVisibility).toHaveBeenCalledWith(flaggedElements[1], 'show');
  });
});
