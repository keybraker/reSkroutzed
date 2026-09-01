// filepath: c:\Users\Keybraker\Github\reSkroutzed\test\handlers\VideoAd.handler.test.ts
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { DomClient } from '../../src/clients/dom/client';
import { State } from '../../src/common/types/State.type';
import { VideoAdHandler } from '../../src/handlers/VideoAd.handler';

// Mock the DomClient
vi.mock('../../src/clients/dom/client', () => ({
  DomClient: {
    getElementsByClass: vi.fn(),
    addClassesToElement: vi.fn(),
    updateElementVisibility: vi.fn(),
  },
}));

describe('VideoAdHandler', () => {
  let videoAdHandler: VideoAdHandler;
  let mockState: State;
  let mockVideoElement: Element;

  beforeEach(() => {
    // Reset all mocks
    vi.resetAllMocks();

    // Create mock state
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

    // Create a mock element
    mockVideoElement = document.createElement('div');
    mockVideoElement.classList.add('video-promo');

    // Create instance of VideoAdHandler with mock state
    videoAdHandler = new VideoAdHandler(mockState);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('flag', () => {
    it('should set videoAdCount to 0 initially', () => {
      // Mock returning empty array for flagged video elements
      vi.mocked(DomClient.getElementsByClass).mockReturnValueOnce([]);

      // Mock li elements that don't match video classes
      const mockLiElement = document.createElement('li');
      vi.mocked(DomClient.getElementsByClass).mockReturnValueOnce([mockLiElement]);

      // Mock returning empty arrays for video ad classes
      vi.mocked(DomClient.getElementsByClass).mockReturnValue([]);

      videoAdHandler.flag();

      expect(mockState.videoAdCount).toBe(0);
    });

    it('should increment videoAdCount for each flagged video element', () => {
      // Mock existing flagged elements
      const flaggedElements = [document.createElement('div'), document.createElement('div')];
      vi.mocked(DomClient.getElementsByClass).mockReturnValueOnce(flaggedElements);

      // Mock li elements that don't match video classes
      vi.mocked(DomClient.getElementsByClass).mockReturnValueOnce([]);

      // Mock empty arrays for additional video elements
      vi.mocked(DomClient.getElementsByClass).mockReturnValue([]);

      videoAdHandler.flag();

      expect(mockState.videoAdCount).toBe(2);
    });

    it('should flag and count video elements that match videoAdClasses', () => {
      // Initial flagged elements
      vi.mocked(DomClient.getElementsByClass).mockReturnValueOnce([]);

      // Mock li elements that match video classes but aren't flagged yet
      const mockLiElement = document.createElement('li');
      mockLiElement.classList.add('video-promo');
      vi.mocked(DomClient.getElementsByClass).mockReturnValueOnce([mockLiElement]);

      // Mock additional video elements
      const mockVideoElement1 = document.createElement('div');
      const mockVideoElement2 = document.createElement('div');
      vi.mocked(DomClient.getElementsByClass).mockReturnValueOnce([mockVideoElement1]);
      vi.mocked(DomClient.getElementsByClass).mockReturnValueOnce([mockVideoElement2]);
      vi.mocked(DomClient.getElementsByClass).mockReturnValue([]);

      videoAdHandler.flag();

      // Should have called addClassesToElement for each video element
      expect(DomClient.addClassesToElement).toHaveBeenCalledTimes(3);
      expect(DomClient.updateElementVisibility).toHaveBeenCalledTimes(3);
      expect(mockState.videoAdCount).toBe(3);
    });
  });

  describe('visibilityUpdate', () => {
    it('should update visibility for all flagged video elements', () => {
      // Mock flagged video elements
      const flaggedElements = [document.createElement('div'), document.createElement('div')];
      vi.mocked(DomClient.getElementsByClass).mockReturnValueOnce(flaggedElements);

      // Test with hideVideoAds set to false
      mockState.hideVideoAds = false;
      videoAdHandler.visibilityUpdate();

      // Should call updateElementVisibility with 'hide' for each element
      expect(DomClient.updateElementVisibility).toHaveBeenCalledTimes(2);
      expect(DomClient.updateElementVisibility).toHaveBeenCalledWith(flaggedElements[0], 'hide');
      expect(DomClient.updateElementVisibility).toHaveBeenCalledWith(flaggedElements[1], 'hide');

      // Reset calls
      vi.mocked(DomClient.updateElementVisibility).mockClear();
      vi.mocked(DomClient.getElementsByClass).mockReturnValueOnce(flaggedElements);

      // Test with hideVideoAds set to true
      mockState.hideVideoAds = true;
      videoAdHandler.visibilityUpdate();

      // Should call updateElementVisibility with 'show' for each element
      expect(DomClient.updateElementVisibility).toHaveBeenCalledTimes(2);
      expect(DomClient.updateElementVisibility).toHaveBeenCalledWith(flaggedElements[0], 'show');
      expect(DomClient.updateElementVisibility).toHaveBeenCalledWith(flaggedElements[1], 'show');
    });
  });
});
