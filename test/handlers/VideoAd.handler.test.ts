// filepath: c:\Users\Keybraker\Github\reSkroutzed\test\handlers\VideoAd.handler.test.ts
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

import { VideoAdHandler } from '../../src/handlers/VideoAd.handler';
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
      productAdCount: 0,
      ShelfAdCount: 0,
      videoAdCount: 0,
      sponsorshipAdCount: 0,
      language: 0,
      darkMode: false,
      minimumPriceDifference: 0,
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

  describe('updateCountAndVisibility', () => {
    it('should increment count and update visibility when element matches criteria', () => {
      // Create private method test helper
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const updateCountAndVisibility = (videoAdHandler as any).updateCountAndVisibility.bind(
        videoAdHandler,
      );

      // Create element with matching class
      const element = document.createElement('div');
      element.classList.add('video-promo');

      // Test with hideVideoAds set to false
      mockState.hideVideoAds = false;
      updateCountAndVisibility(element);

      expect(mockState.videoAdCount).toBe(1);
      expect(DomClient.addClassesToElement).toHaveBeenCalledWith(element, 'flagged-video');
      expect(DomClient.updateElementVisibility).toHaveBeenCalledWith(element, 'hide');

      // Reset state and mocks
      mockState.videoAdCount = 0;
      vi.mocked(DomClient.addClassesToElement).mockClear();
      vi.mocked(DomClient.updateElementVisibility).mockClear();

      // Test with hideVideoAds set to true
      mockState.hideVideoAds = true;
      updateCountAndVisibility(element);

      expect(mockState.videoAdCount).toBe(1);
      expect(DomClient.addClassesToElement).toHaveBeenCalledWith(element, 'flagged-video');
      expect(DomClient.updateElementVisibility).toHaveBeenCalledWith(element, 'show');
    });

    it('should not update count or visibility when element does not match criteria', () => {
      // Create private method test helper
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const updateCountAndVisibility = (videoAdHandler as any).updateCountAndVisibility.bind(
        videoAdHandler,
      );

      // Create element without matching class
      const element = document.createElement('div');
      element.classList.add('not-a-video');

      updateCountAndVisibility(element);

      expect(mockState.videoAdCount).toBe(0);
      expect(DomClient.addClassesToElement).not.toHaveBeenCalled();
      expect(DomClient.updateElementVisibility).not.toHaveBeenCalled();
    });

    it('should not update already flagged elements', () => {
      // Create private method test helper
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const updateCountAndVisibility = (videoAdHandler as any).updateCountAndVisibility.bind(
        videoAdHandler,
      );

      // Create element that's already flagged
      const element = document.createElement('div');
      element.classList.add('video-promo');
      element.classList.add('flagged-video');

      updateCountAndVisibility(element);

      expect(mockState.videoAdCount).toBe(0);
      expect(DomClient.addClassesToElement).not.toHaveBeenCalled();
      expect(DomClient.updateElementVisibility).not.toHaveBeenCalled();
    });
  });

  describe('flagElementsBySelector', () => {
    it('should flag all elements matching the selector', () => {
      // Create private method test helper
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const flagElementsBySelector = (videoAdHandler as any).flagElementsBySelector.bind(
        videoAdHandler,
      );

      // Mock elements to be returned by getElementsByClass
      const elements = [document.createElement('div'), document.createElement('div')];
      vi.mocked(DomClient.getElementsByClass).mockReturnValueOnce(elements);

      // Test with hideVideoAds set to false
      mockState.hideVideoAds = false;
      flagElementsBySelector('.test-selector');

      expect(mockState.videoAdCount).toBe(2);
      expect(DomClient.getElementsByClass).toHaveBeenCalledWith('.test-selector');
      expect(DomClient.addClassesToElement).toHaveBeenCalledTimes(2);
      expect(DomClient.updateElementVisibility).toHaveBeenCalledTimes(2);

      // Test with hideVideoAds set to true
      mockState.videoAdCount = 0;
      vi.mocked(DomClient.getElementsByClass).mockReturnValueOnce(elements);
      vi.mocked(DomClient.addClassesToElement).mockClear();
      vi.mocked(DomClient.updateElementVisibility).mockClear();

      mockState.hideVideoAds = true;
      flagElementsBySelector('.test-selector');

      expect(mockState.videoAdCount).toBe(2);
      expect(DomClient.getElementsByClass).toHaveBeenCalledWith('.test-selector');
      expect(DomClient.addClassesToElement).toHaveBeenCalledTimes(2);
      expect(DomClient.updateElementVisibility).toHaveBeenCalledTimes(2);
      expect(DomClient.updateElementVisibility).toHaveBeenCalledWith(elements[0], 'show');
      expect(DomClient.updateElementVisibility).toHaveBeenCalledWith(elements[1], 'show');
    });
  });
});
