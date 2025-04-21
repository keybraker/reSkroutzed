// filepath: c:\Users\Keybraker\Github\reSkroutzed\test\handlers\SponsorshipAd.handler.test.ts
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { SponsorshipAdHandler } from '../../src/handlers/SponsorshipAd.handler';
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

describe('SponsorshipAdHandler', () => {
  let sponsorshipAdHandler: SponsorshipAdHandler;
  let mockState: State;
  let mockSponsorshipElement: Element;

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
    mockSponsorshipElement = document.createElement('div');
    mockSponsorshipElement.id = 'sponsorship';

    // Create instance of SponsorshipAdHandler with mock state
    sponsorshipAdHandler = new SponsorshipAdHandler(mockState);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('flag', () => {
    it('should set sponsorshipAdCount to 0 initially', () => {
      // Mock returning empty array for flagged sponsorship elements
      vi.mocked(DomClient.getElementsByClass).mockReturnValueOnce([]);

      // Mock li elements that don't match sponsorship selectors
      const mockLiElement = document.createElement('li');
      vi.mocked(DomClient.getElementsByClass).mockReturnValueOnce([mockLiElement]);

      // Mock returning empty arrays for sponsorship ad classes
      vi.mocked(DomClient.getElementsByClass).mockReturnValue([]);

      sponsorshipAdHandler.flag();

      expect(mockState.sponsorshipAdCount).toBe(0);
    });

    it('should increment sponsorshipAdCount for each flagged sponsorship element', () => {
      // Mock existing flagged elements
      const flaggedElements = [document.createElement('div'), document.createElement('div')];
      vi.mocked(DomClient.getElementsByClass).mockReturnValueOnce(flaggedElements);

      // Mock li elements that don't match sponsorship selectors
      vi.mocked(DomClient.getElementsByClass).mockReturnValueOnce([]);

      // Mock empty arrays for additional sponsorship elements
      vi.mocked(DomClient.getElementsByClass).mockReturnValue([]);

      sponsorshipAdHandler.flag();

      expect(mockState.sponsorshipAdCount).toBe(2);
    });

    it('should flag and count sponsorship elements that match sponsorshipAdSelectors', () => {
      // Initial flagged elements
      vi.mocked(DomClient.getElementsByClass).mockReturnValueOnce([]);

      // Mock li elements that match sponsorship selectors but aren't flagged yet
      const mockLiElement = document.createElement('li');
      mockLiElement.id = 'sponsorship';

      // Add the matches method to the element for selector testing
      mockLiElement.matches = (selector: string) => selector === '#sponsorship';

      vi.mocked(DomClient.getElementsByClass).mockReturnValueOnce([mockLiElement]);

      // Mock additional sponsorship elements
      const mockSponsorshipElement = document.createElement('div');
      vi.mocked(DomClient.getElementsByClass).mockReturnValueOnce([mockSponsorshipElement]);
      vi.mocked(DomClient.getElementsByClass).mockReturnValue([]);

      sponsorshipAdHandler.flag();

      // Should have called addClassesToElement for each sponsorship element
      expect(DomClient.addClassesToElement).toHaveBeenCalledTimes(2);
      expect(DomClient.updateElementVisibility).toHaveBeenCalledTimes(2);
      expect(mockState.sponsorshipAdCount).toBe(2);
    });
  });

  describe('visibilityUpdate', () => {
    it('should update visibility for all flagged sponsorship elements', () => {
      // Mock flagged sponsorship elements
      const flaggedElements = [document.createElement('div'), document.createElement('div')];
      vi.mocked(DomClient.getElementsByClass).mockReturnValueOnce(flaggedElements);

      // Test with hideSponsorships set to false
      mockState.hideSponsorships = false;
      sponsorshipAdHandler.visibilityUpdate();

      // Should call updateElementVisibility with 'hide' for each element
      expect(DomClient.updateElementVisibility).toHaveBeenCalledTimes(2);
      expect(DomClient.updateElementVisibility).toHaveBeenCalledWith(flaggedElements[0], 'hide');
      expect(DomClient.updateElementVisibility).toHaveBeenCalledWith(flaggedElements[1], 'hide');

      // Reset calls
      vi.mocked(DomClient.updateElementVisibility).mockClear();
      vi.mocked(DomClient.getElementsByClass).mockReturnValueOnce(flaggedElements);

      // Test with hideSponsorships set to true
      mockState.hideSponsorships = true;
      sponsorshipAdHandler.visibilityUpdate();

      // Should call updateElementVisibility with 'show' for each element
      expect(DomClient.updateElementVisibility).toHaveBeenCalledTimes(2);
      expect(DomClient.updateElementVisibility).toHaveBeenCalledWith(flaggedElements[0], 'show');
      expect(DomClient.updateElementVisibility).toHaveBeenCalledWith(flaggedElements[1], 'show');
    });
  });

  describe('updateCountAndVisibility', () => {
    it('should increment count and update visibility when element matches criteria', () => {
      // Create private method test helper
      const updateCountAndVisibility = (sponsorshipAdHandler as any).updateCountAndVisibility.bind(
        sponsorshipAdHandler,
      );

      // Create element with matching selector
      const element = document.createElement('div');
      element.id = 'sponsorship';

      // Add the matches method to the element for selector testing
      element.matches = (selector: string) => selector === '#sponsorship';

      // Test with hideSponsorships set to false
      mockState.hideSponsorships = false;
      updateCountAndVisibility(element);

      expect(mockState.sponsorshipAdCount).toBe(1);
      expect(DomClient.addClassesToElement).toHaveBeenCalledWith(element, 'flagged-sponsorship');
      expect(DomClient.updateElementVisibility).toHaveBeenCalledWith(element, 'hide');

      // Reset state and mocks
      mockState.sponsorshipAdCount = 0;
      vi.mocked(DomClient.addClassesToElement).mockClear();
      vi.mocked(DomClient.updateElementVisibility).mockClear();

      // Test with hideSponsorships set to true
      mockState.hideSponsorships = true;
      updateCountAndVisibility(element);

      expect(mockState.sponsorshipAdCount).toBe(1);
      expect(DomClient.addClassesToElement).toHaveBeenCalledWith(element, 'flagged-sponsorship');
      expect(DomClient.updateElementVisibility).toHaveBeenCalledWith(element, 'show');
    });

    it('should not update count or visibility when element does not match criteria', () => {
      // Create private method test helper
      const updateCountAndVisibility = (sponsorshipAdHandler as any).updateCountAndVisibility.bind(
        sponsorshipAdHandler,
      );

      // Create element without matching selector
      const element = document.createElement('div');
      element.id = 'not-sponsorship';

      // Add the matches method to the element for selector testing
      element.matches = (selector: string) => false;

      updateCountAndVisibility(element);

      expect(mockState.sponsorshipAdCount).toBe(0);
      expect(DomClient.addClassesToElement).not.toHaveBeenCalled();
      expect(DomClient.updateElementVisibility).not.toHaveBeenCalled();
    });

    it('should not update already flagged elements', () => {
      // Create private method test helper
      const updateCountAndVisibility = (sponsorshipAdHandler as any).updateCountAndVisibility.bind(
        sponsorshipAdHandler,
      );

      // Create element that's already flagged
      const element = document.createElement('div');
      element.id = 'sponsorship';
      element.classList.add('flagged-sponsorship');

      // Add the matches method to the element for selector testing
      element.matches = (selector: string) => selector === '#sponsorship';

      updateCountAndVisibility(element);

      expect(mockState.sponsorshipAdCount).toBe(0);
      expect(DomClient.addClassesToElement).not.toHaveBeenCalled();
      expect(DomClient.updateElementVisibility).not.toHaveBeenCalled();
    });
  });

  describe('flagElementsBySelector', () => {
    it('should flag all elements matching the selector', () => {
      // Create private method test helper
      const flagElementsBySelector = (sponsorshipAdHandler as any).flagElementsBySelector.bind(
        sponsorshipAdHandler,
      );

      // Mock elements to be returned by getElementsByClass
      const elements = [document.createElement('div'), document.createElement('div')];
      vi.mocked(DomClient.getElementsByClass).mockReturnValueOnce(elements);

      // Test with hideSponsorships set to false
      mockState.hideSponsorships = false;
      flagElementsBySelector('#sponsorship');

      expect(mockState.sponsorshipAdCount).toBe(2);
      expect(DomClient.getElementsByClass).toHaveBeenCalledWith('#sponsorship');
      expect(DomClient.addClassesToElement).toHaveBeenCalledTimes(2);
      expect(DomClient.updateElementVisibility).toHaveBeenCalledTimes(2);

      // Test with hideSponsorships set to true
      mockState.sponsorshipAdCount = 0;
      vi.mocked(DomClient.getElementsByClass).mockReturnValueOnce(elements);
      vi.mocked(DomClient.addClassesToElement).mockClear();
      vi.mocked(DomClient.updateElementVisibility).mockClear();

      mockState.hideSponsorships = true;
      flagElementsBySelector('#sponsorship');

      expect(mockState.sponsorshipAdCount).toBe(2);
      expect(DomClient.getElementsByClass).toHaveBeenCalledWith('#sponsorship');
      expect(DomClient.addClassesToElement).toHaveBeenCalledTimes(2);
      expect(DomClient.updateElementVisibility).toHaveBeenCalledTimes(2);
      expect(DomClient.updateElementVisibility).toHaveBeenCalledWith(elements[0], 'show');
      expect(DomClient.updateElementVisibility).toHaveBeenCalledWith(elements[1], 'show');
    });
  });
});
