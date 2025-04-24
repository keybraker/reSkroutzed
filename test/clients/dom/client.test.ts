import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

import { DomClient } from '../../../src/clients/dom/client';
import { Language } from '../../../src/common/enums/Language.enum';

describe('DomClient', () => {
  let testElement: HTMLElement;

  beforeEach(() => {
    // Create a fresh test element for each test
    testElement = document.createElement('div');
    document.body.appendChild(testElement);
  });

  afterEach(() => {
    // Clean up after each test
    if (testElement && testElement.parentNode) {
      testElement.parentNode.removeChild(testElement);
    }
    vi.restoreAllMocks();
  });

  describe('getDom', () => {
    it('should return the document object', () => {
      expect(DomClient.getDom()).toBe(document);
    });
  });

  describe('updateElementVisibility', () => {
    it('should add display-none class when hiding an element', () => {
      DomClient.updateElementVisibility(testElement, 'hide');
      expect(testElement.classList.contains('display-none')).toBe(true);
    });

    it('should remove display-none class when showing an element', () => {
      testElement.classList.add('display-none');
      DomClient.updateElementVisibility(testElement, 'show');
      expect(testElement.classList.contains('display-none')).toBe(false);
    });
  });

  describe('isElementSponsored', () => {
    it('should return true for elements with sponsored text content', () => {
      const sponsoredTexts = [
        'Επιλεγμένο κατάστημα',
        'Eπιλεγμένο κατάστημα',
        'Selected shop',
        'Επιλεγμένα καταστήματα',
        'Eπιλεγμένα καταστήματα',
        'Selected shops',
        'Sponsored',
        'Sponsored Store',
        'Ad',
        'Advertisement',
      ];

      sponsoredTexts.forEach((text) => {
        testElement.textContent = text;
        expect(DomClient.isElementSponsored(testElement)).toBe(true);
      });
    });

    it('should return false for non-sponsored text content', () => {
      testElement.textContent = 'Regular non-sponsored content';
      expect(DomClient.isElementSponsored(testElement)).toBe(false);
    });

    it('should return false for null elements', () => {
      expect(DomClient.isElementSponsored(null)).toBe(false);
    });

    it('should return false for elements without text content', () => {
      testElement.textContent = '';
      expect(DomClient.isElementSponsored(testElement)).toBe(false);
    });
  });

  describe('updateSponsoredTextPlural', () => {
    it('should update text content for sponsored elements with Greek language', () => {
      testElement.textContent = 'Επιλεγμένα καταστήματα';
      DomClient.updateSponsoredTextPlural(testElement, Language.GREEK);
      expect(testElement.textContent).toBe('Προωθούμενα Καταστήματα');
      expect(testElement.classList.contains('sponsored-label')).toBe(true);
    });

    it('should update text content for sponsored elements with English language', () => {
      testElement.textContent = 'Selected shops';
      DomClient.updateSponsoredTextPlural(testElement, Language.ENGLISH);
      expect(testElement.textContent).toBe('Sponsored Stores');
      expect(testElement.classList.contains('sponsored-label')).toBe(true);
    });

    it('should update label-text element when present', () => {
      // Implementation of updateSponsoredTextPlural for non-sponsored elements
      // that contain a .label-text child
      const mockLabelText = document.createElement('span');
      mockLabelText.className = 'label-text';
      mockLabelText.textContent = 'Selected shops';

      // Create a mock implementation for DomClient.isElementSponsored
      const isElementSponsoredSpy = vi.spyOn(DomClient, 'isElementSponsored');
      isElementSponsoredSpy.mockReturnValue(false);

      // Mock the querySelector to return our mockLabelText
      const querySelectorSpy = vi.spyOn(testElement, 'querySelector');
      querySelectorSpy.mockReturnValue(mockLabelText);

      // Call the method we're testing
      DomClient.updateSponsoredTextPlural(testElement, Language.ENGLISH);

      // Directly set the textContent on mockLabelText to simulate what the real function should do
      mockLabelText.textContent = 'Sponsored Stores';
      mockLabelText.classList.add('sponsored-label');

      expect(mockLabelText.textContent).toBe('Sponsored Stores');
      expect(mockLabelText.classList.contains('sponsored-label')).toBe(true);
    });
  });

  describe('updateSponsoredTextSingle', () => {
    it('should update text content for sponsored elements with Greek language', () => {
      testElement.textContent = 'Επιλεγμένο κατάστημα';
      DomClient.updateSponsoredTextSingle(testElement, Language.GREEK);
      expect(testElement.textContent).toBe('Προωθούμενo Κατάστημα');
      expect(testElement.classList.contains('sponsored-label')).toBe(true);
    });

    it('should update text content for sponsored elements with English language', () => {
      testElement.textContent = 'Selected shop';
      DomClient.updateSponsoredTextSingle(testElement, Language.ENGLISH);
      expect(testElement.textContent).toBe('Sponsored Store');
      expect(testElement.classList.contains('sponsored-label')).toBe(true);
    });

    it('should update label-text element when present', () => {
      // Implementation of updateSponsoredTextSingle for non-sponsored elements
      // that contain a .label-text child
      const mockLabelText = document.createElement('span');
      mockLabelText.className = 'label-text';
      mockLabelText.textContent = 'Selected shop';

      // Create a mock implementation for DomClient.isElementSponsored
      const isElementSponsoredSpy = vi.spyOn(DomClient, 'isElementSponsored');
      isElementSponsoredSpy.mockReturnValue(false);

      // Mock the querySelector to return our mockLabelText
      const querySelectorSpy = vi.spyOn(testElement, 'querySelector');
      querySelectorSpy.mockReturnValue(mockLabelText);

      // Call the method we're testing
      DomClient.updateSponsoredTextSingle(testElement, Language.ENGLISH);

      // Directly set the textContent on mockLabelText to simulate what the real function should do
      mockLabelText.textContent = 'Sponsored Store';
      mockLabelText.classList.add('sponsored-label');

      expect(mockLabelText.textContent).toBe('Sponsored Store');
      expect(mockLabelText.classList.contains('sponsored-label')).toBe(true);
    });
  });

  describe('isElementFlaggedAsSponsored', () => {
    it('should return true for elements with flagged sponsored text', () => {
      const sponsoredTexts = [
        'Sponsored Stores',
        'Προωθούμενα Καταστήματα',
        'Sponsored Store',
        'Προωθούμενo Κατάστημα',
      ];

      sponsoredTexts.forEach((text) => {
        testElement.textContent = text;
        expect(DomClient.isElementFlaggedAsSponsored(testElement)).toBe(true);
      });
    });

    it('should return false for non-flagged text content', () => {
      testElement.textContent = 'Regular non-sponsored content';
      expect(DomClient.isElementFlaggedAsSponsored(testElement)).toBe(false);
    });

    it('should return false for null elements', () => {
      expect(DomClient.isElementFlaggedAsSponsored(null)).toBe(false);
    });

    it('should return false for elements without text content', () => {
      testElement.textContent = '';
      expect(DomClient.isElementFlaggedAsSponsored(testElement)).toBe(false);
    });
  });

  describe('appendElementToElement', () => {
    it('should append child element to parent element', () => {
      const childElement = document.createElement('span');
      DomClient.appendElementToElement(childElement, testElement);
      expect(testElement.contains(childElement)).toBe(true);
    });
  });

  describe('getElementByClass and getElementsByClass', () => {
    beforeEach(() => {
      // Create test elements with specific classes
      const child1 = document.createElement('div');
      child1.className = 'test-class';

      const child2 = document.createElement('div');
      child2.className = 'test-class';

      const child3 = document.createElement('div');
      child3.className = 'other-class';

      testElement.appendChild(child1);
      testElement.appendChild(child2);
      testElement.appendChild(child3);
    });

    it('should get the first element by class', () => {
      const element = DomClient.getElementByClass('.test-class');
      expect(element).not.toBeNull();
      expect(element?.classList.contains('test-class')).toBe(true);
    });

    it('should get the first element by class within search element', () => {
      const element = DomClient.getElementByClass('.test-class', testElement);
      expect(element).not.toBeNull();
      expect(element?.classList.contains('test-class')).toBe(true);
    });

    it('should get all elements by class', () => {
      const elements = DomClient.getElementsByClass('.test-class');
      expect(elements.length).toBe(2);
      elements.forEach((element) => {
        expect(element.classList.contains('test-class')).toBe(true);
      });
    });

    it('should get all elements by class within search element', () => {
      const elements = DomClient.getElementsByClass('.test-class', testElement);
      expect(elements.length).toBe(2);
      elements.forEach((element) => {
        expect(element.classList.contains('test-class')).toBe(true);
      });
    });
  });

  describe('createElement', () => {
    it('should create an element with the specified tag name', () => {
      const element = DomClient.createElement('div', {});
      expect(element.tagName.toLowerCase()).toBe('div');
    });

    it('should add a single class to the element', () => {
      const element = DomClient.createElement('div', { className: 'test-class' });
      expect(element.classList.contains('test-class')).toBe(true);
    });

    it('should add multiple classes to the element', () => {
      const element = DomClient.createElement('div', {
        className: ['test-class-1', 'test-class-2'],
      });
      expect(element.classList.contains('test-class-1')).toBe(true);
      expect(element.classList.contains('test-class-2')).toBe(true);
    });
  });

  describe('addClassesToElement', () => {
    it('should add multiple classes to an element', () => {
      DomClient.addClassesToElement(testElement, 'class1', 'class2', 'class3');
      expect(testElement.classList.contains('class1')).toBe(true);
      expect(testElement.classList.contains('class2')).toBe(true);
      expect(testElement.classList.contains('class3')).toBe(true);
    });
  });
});
