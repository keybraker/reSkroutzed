import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { Language } from '../../src/common/enums/Language.enum';
import { State } from '../../src/common/types/State.type';
import { UniversalToggleDecorator } from '../../src/features/UniversalToggle.decorator';

vi.mock('../../src/clients/browser/client', () => ({
  BrowserClient: {
    getValueAsync: vi.fn().mockResolvedValue(false),
    getValuesAsync: vi.fn().mockResolvedValue({}),
    setValue: vi.fn(),
    detectMobile: vi.fn().mockReturnValue(false),
  },
  StorageKey: {
    DARK_MODE: 'darkMode',
    PRODUCT_AD_VISIBILITY: 'productAdVisibility',
    VIDEO_AD_VISIBILITY: 'videoAdVisibility',
    SHELF_PRODUCT_AD_VISIBILITY: 'shelfProductAdVisibility',
    RECOMMENDATION_AD_VISIBILITY: 'recommendationAdVisibility',
    SKOOP_AD_VISIBILITY: 'skoopAdVisibility',
    SPONSORSHIP_VISIBILITY: 'sponsorshipVisibility',
    AI_SLOP_VISIBILITY: 'aiSlopVisibility',
    WIDE_MODE: 'wideMode',
    CALM_MODE: 'calmMode',
    MINIMUM_PRICE_DIFFERENCE: 'minimumPriceDifference',
  },
}));

vi.mock('../../src/handlers/VideoAd.handler', () => ({
  VideoAdHandler: vi.fn().mockImplementation(() => ({
    flag: vi.fn(),
    visibilityUpdate: vi.fn(),
  })),
}));

vi.mock('../../src/handlers/ListProductAd.handler', () => ({
  ListProductAdHandler: vi.fn().mockImplementation(() => ({
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

vi.mock('../../src/handlers/ShelfProductAd.handler', () => ({
  ShelfProductAdHandler: vi.fn().mockImplementation(() => ({
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

describe('UniversalToggleDecorator lifecycle', () => {
  let mockState: State;

  beforeEach(() => {
    vi.clearAllMocks();

    mockState = {
      language: Language.ENGLISH,
      darkMode: false,
      wideMode: false,
      calmMode: false,
      hideProductAds: false,
      hideVideoAds: false,
      hideShelfProductAds: false,
      hideRecommendationAds: false,
      hideSkoopAds: false,
      hideAISlop: false,
      hideUniversalToggle: false,
      hideSponsorships: false,
      productAdCount: 0,
      videoAdCount: 0,
      shelfAdCount: 0,
      recommendationAdCount: 0,
      skoopAdCount: 0,
      sponsorshipAdCount: 0,
      priceCheckerEnabled: true,
      minimumPriceDifference: 0,
      showBestPrice: true,
      showShopflix: true,
      isMobile: false,
    };

    document.body.innerHTML = '<div id="root"></div>';
  });

  afterEach(() => {
    document.body.innerHTML = '';
    vi.restoreAllMocks();
  });

  it('does not build a second toggle when executed twice', () => {
    // Arrange
    const decorator = new UniversalToggleDecorator(mockState);

    // Act
    decorator.execute();
    decorator.execute();

    // Assert
    expect(document.querySelectorAll('.universal-toggle-container')).toHaveLength(1);
  });

  it('re-registers the document click listener once the toggle is rebuilt', () => {
    // Arrange
    const addEventListener = vi.spyOn(document, 'addEventListener');
    const decorator = new UniversalToggleDecorator(mockState);

    // Act
    decorator.execute();
    decorator.destroy();
    decorator.execute();

    // Assert
    const clickCalls = addEventListener.mock.calls.filter(([type]) => type === 'click');
    expect(clickCalls).toHaveLength(2);
  });

  it('removes the toggle and its document listener on destroy', () => {
    // Arrange
    const removeEventListener = vi.spyOn(document, 'removeEventListener');
    const addEventListener = vi.spyOn(document, 'addEventListener');
    const decorator = new UniversalToggleDecorator(mockState);
    decorator.execute();
    const clickHandler = addEventListener.mock.calls.find(([type]) => type === 'click')?.[1];

    // Act
    decorator.destroy();

    // Assert
    expect(document.querySelector('.universal-toggle-container')).toBeNull();
    expect(removeEventListener).toHaveBeenCalledWith('click', clickHandler);
  });

  it('rebuilds the toggle after destroy', () => {
    // Arrange
    const decorator = new UniversalToggleDecorator(mockState);
    decorator.execute();
    decorator.destroy();

    // Act
    decorator.execute();

    // Assert
    expect(document.querySelectorAll('.universal-toggle-container')).toHaveLength(1);
    expect(document.querySelector('.universal-toggle-button')).not.toBeNull();
  });
});
