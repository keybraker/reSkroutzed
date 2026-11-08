import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { DomClient } from '../../src/clients/dom/client';
import { State } from '../../src/common/types/State.type';
import { CampaignAdHandler } from '../../src/handlers/Campaign.handler';

vi.mock('../../src/clients/dom/client', () => ({
  DomClient: {
    getElementsByClass: vi.fn(),
    addClassesToElement: vi.fn(),
    updateElementVisibility: vi.fn(),
  },
}));

describe('CampaignAdHandler', () => {
  let campaignAdHandler: CampaignAdHandler;
  let mockState: State;

  const mockSelectorResults = (selectorResults: Record<string, Element[]>): void => {
    vi.mocked(DomClient.getElementsByClass).mockImplementation(
      (selector: string) => selectorResults[selector] ?? [],
    );
  };

  beforeEach(() => {
    vi.resetAllMocks();

    // Mirror the real DomClient so the `:not(...)` guards see flagged elements.
    vi.mocked(DomClient.addClassesToElement).mockImplementation(
      (element: Element, ...flagClasses: string[]) => {
        element.classList.add(...flagClasses);
      },
    );

    mockState = {
      hideVideoAds: false,
      hideProductAds: false,
      hideSponsorships: false,
      hideShelfProductAds: false,
      hideRecommendationAds: false,
      hideSkoopAds: false,
      hideAISlop: false,
      wideMode: false,
      calmMode: false,
      hideUniversalToggle: false,
      productAdCount: 0,
      shelfAdCount: 0,
      recommendationAdCount: 0,
      skoopAdCount: 0,
      videoAdCount: 0,
      sponsorshipAdCount: 0,
      language: 0,
      darkMode: false,
      priceCheckerEnabled: true,
      minimumPriceDifference: 0,
      showBestPrice: true,
      showShopflix: true,
      isMobile: false,
    };

    campaignAdHandler = new CampaignAdHandler(mockState);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('flag', () => {
    it('should leave sponsorshipAdCount at 0 when there are no campaign elements', () => {
      // Arrange
      mockSelectorResults({ '.flagged-sponsorship': [] });

      // Act
      campaignAdHandler.flag();

      // Assert
      expect(mockState.sponsorshipAdCount).toBe(0);
      expect(mockState.shelfAdCount).toBe(0);
      expect(DomClient.addClassesToElement).not.toHaveBeenCalled();
    });

    it('should reset sponsorshipAdCount to the number of already-flagged elements', () => {
      // Arrange
      const alreadyFlagged = [document.createElement('div'), document.createElement('div')];
      mockSelectorResults({ '.flagged-sponsorship': alreadyFlagged });

      // Act
      campaignAdHandler.flag();

      // Assert
      expect(mockState.sponsorshipAdCount).toBe(2);
      expect(DomClient.addClassesToElement).not.toHaveBeenCalled();
    });

    it('should flag a campaign list item parent as a sponsorship and count it', () => {
      // Arrange
      const parent = document.createElement('div');
      const item = document.createElement('li');
      item.classList.add('sponsored-badge');
      parent.appendChild(item);
      mockSelectorResults({
        '.flagged-sponsorship': [],
        'li:not(.flagged-sponsorship)': [item],
      });

      // Act
      campaignAdHandler.flag();

      // Assert
      expect(DomClient.addClassesToElement).toHaveBeenCalledWith(parent, 'flagged-sponsorship');
      expect(DomClient.updateElementVisibility).toHaveBeenCalledWith(parent, 'hide');
      expect(mockState.sponsorshipAdCount).toBe(1);
      expect(mockState.shelfAdCount).toBe(0);
    });

    it('should flag timeline campaign cards via their parent element', () => {
      // Arrange
      const timelineCard = document.createElement('div');
      const campaignButton = document.createElement('div');
      campaignButton.classList.add('brands-slider-container');
      timelineCard.appendChild(campaignButton);
      mockSelectorResults({
        '.flagged-sponsorship': [],
        '.timeline-card .brands-slider-container:not(.flagged-sponsorship)': [campaignButton],
      });

      // Act
      campaignAdHandler.flag();

      // Assert
      expect(DomClient.addClassesToElement).toHaveBeenCalledWith(
        timelineCard,
        'flagged-sponsorship',
      );
      expect(mockState.sponsorshipAdCount).toBe(1);
    });
  });

  describe('visibilityUpdate', () => {
    it('should hide flagged campaign elements when hideSponsorships is false', () => {
      // Arrange
      const flaggedElements = [document.createElement('div'), document.createElement('div')];
      vi.mocked(DomClient.getElementsByClass).mockReturnValueOnce(flaggedElements);
      mockState.hideSponsorships = false;

      // Act
      campaignAdHandler.visibilityUpdate();

      // Assert
      expect(DomClient.getElementsByClass).toHaveBeenCalledWith('.flagged-sponsorship');
      expect(DomClient.updateElementVisibility).toHaveBeenCalledTimes(2);
      expect(DomClient.updateElementVisibility).toHaveBeenCalledWith(flaggedElements[0], 'hide');
      expect(DomClient.updateElementVisibility).toHaveBeenCalledWith(flaggedElements[1], 'hide');
    });

    it('should show flagged campaign elements when hideSponsorships is true', () => {
      // Arrange
      const flaggedElements = [document.createElement('div')];
      vi.mocked(DomClient.getElementsByClass).mockReturnValueOnce(flaggedElements);
      mockState.hideSponsorships = true;

      // Act
      campaignAdHandler.visibilityUpdate();

      // Assert
      expect(DomClient.updateElementVisibility).toHaveBeenCalledWith(flaggedElements[0], 'show');
    });
  });
});
