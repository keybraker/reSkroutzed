import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { DomClient } from '../../src/clients/dom/client';
import { State } from '../../src/common/types/State.type';
import { SkoopHandler } from '../../src/handlers/Skoop.handler';

vi.mock('../../src/clients/dom/client', () => ({
  DomClient: {
    getElementsByClass: vi.fn(),
    addClassesToElement: vi.fn(),
    updateElementVisibility: vi.fn(),
  },
}));

describe('SkoopHandler', () => {
  let skoopHandler: SkoopHandler;
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

    skoopHandler = new SkoopHandler(mockState);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should count already flagged skoop elements', () => {
    const flaggedElements = [document.createElement('div'), document.createElement('div')];

    mockSelectorResults({
      '.flagged-skoop': flaggedElements,
      '#sku-recommendation-shelf-similar-from-skoop:not(.flagged-skoop)': [],
    });

    skoopHandler.flag();

    expect(mockState.skoopAdCount).toBe(2);
  });

  it('should flag the sku-recommendation-shelf-similar-from-skoop element', () => {
    const skoopElement = document.createElement('section');
    skoopElement.id = 'sku-recommendation-shelf-similar-from-skoop';

    mockSelectorResults({
      '.flagged-skoop': [],
      '#sku-recommendation-shelf-similar-from-skoop:not(.flagged-skoop)': [skoopElement],
    });

    skoopHandler.flag();

    expect(DomClient.addClassesToElement).toHaveBeenCalledWith(skoopElement, 'flagged-skoop');
    expect(DomClient.updateElementVisibility).toHaveBeenCalledTimes(1);
    expect(mockState.skoopAdCount).toBe(1);
  });

  it('should skip elements that are already flagged', () => {
    const skoopElement = document.createElement('section');
    skoopElement.id = 'sku-recommendation-shelf-similar-from-skoop';
    skoopElement.classList.add('flagged-skoop');

    mockSelectorResults({
      '.flagged-skoop': [skoopElement],
      '#sku-recommendation-shelf-similar-from-skoop:not(.flagged-skoop)': [],
    });

    skoopHandler.flag();

    expect(mockState.skoopAdCount).toBe(1);
    expect(DomClient.addClassesToElement).not.toHaveBeenCalled();
    expect(DomClient.updateElementVisibility).not.toHaveBeenCalled();
  });

  it('should hide flagged skoop elements when skoop hiding is active', () => {
    const flaggedElements = [document.createElement('div'), document.createElement('div')];
    mockSelectorResults({
      '.flagged-skoop': flaggedElements,
    });

    // hideSkoopAds = false means ads are blocked (hidden)
    mockState.hideSkoopAds = false;
    skoopHandler.visibilityUpdate();

    expect(DomClient.updateElementVisibility).toHaveBeenCalledWith(flaggedElements[0], 'hide');
    expect(DomClient.updateElementVisibility).toHaveBeenCalledWith(flaggedElements[1], 'hide');
  });

  it('should show flagged skoop elements when skoop hiding is disabled', () => {
    const flaggedElements = [document.createElement('div')];
    mockSelectorResults({
      '.flagged-skoop': flaggedElements,
    });

    // hideSkoopAds = true means filtering is off (elements shown)
    mockState.hideSkoopAds = true;
    skoopHandler.visibilityUpdate();

    expect(DomClient.updateElementVisibility).toHaveBeenCalledWith(flaggedElements[0], 'show');
  });
});
