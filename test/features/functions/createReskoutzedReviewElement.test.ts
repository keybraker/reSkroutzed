// filepath: c:\Users\Keybraker\Github\reSkroutzed\test\features\functions\createReskoutzedReviewElement.test.ts
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { DomClient } from '../../../src/clients/dom/client';
import { Language } from '../../../src/common/enums/Language.enum';
import { createLogoElement } from '../../../src/features/functions/createLogoElement';
import { createReSkoutzedReviewElement } from '../../../src/features/functions/createReskoutzedReviewElement';

// Mock dependencies
vi.mock('../../../src/clients/dom/client');
vi.mock('../../../src/features/functions/createLogoElement');

describe('createReskoutzedReviewElement', () => {
  let originalUserAgent: string;
  let mockLogoElement: HTMLDivElement;

  beforeEach(() => {
    // Store the original navigator.userAgent
    originalUserAgent = navigator.userAgent;

    // Create a real DOM element to use in our mock
    mockLogoElement = document.createElement('div');
    mockLogoElement.classList.add('mock-logo');

    // Set up our mocks
    vi.mocked(DomClient.appendElementToElement).mockImplementation((child, parent) => {
      // Actually append the element to parent to make the tests work
      if (child && parent) {
        parent.appendChild(child);
      }
    });

    vi.mocked(createLogoElement).mockReturnValue(mockLogoElement);
  });

  afterEach(() => {
    // Restore the original user agent
    Object.defineProperty(navigator, 'userAgent', {
      value: originalUserAgent,
      configurable: true,
    });

    vi.restoreAllMocks();
  });

  it('should create a review element with correct classes', () => {
    const element = createReSkoutzedReviewElement(Language.ENGLISH);

    expect(element.tagName).toBe('DIV');
    expect(element.classList.contains('icon-border')).toBe(true);
    expect(element.classList.contains('font-bold')).toBe(true);
  });

  it('should create a link with Chrome store URL when not in Firefox', () => {
    // Mock Chrome user agent
    Object.defineProperty(navigator, 'userAgent', {
      value:
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      configurable: true,
    });

    const element = createReSkoutzedReviewElement(Language.ENGLISH);
    const link = element.querySelector('a');

    expect(link).not.toBeNull();
    expect(link?.href).toBe(
      'https://chromewebstore.google.com/detail/reskroutzed/amglnkndjeoojnjjeepeheobhneeogcl',
    );
    expect(link?.target).toBe('_blank');
    expect(link?.rel).toBe('noopener noreferrer');
    expect(link?.textContent).toBe('by reSkroutzed');
    expect(link?.classList.contains('icon-border')).toBe(true);
    expect(link?.classList.contains('font-bold')).toBe(true);
  });

  it('should create a link with Firefox store URL when in Firefox', () => {
    // Mock Firefox user agent
    Object.defineProperty(navigator, 'userAgent', {
      value: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:89.0) Gecko/20100101 Firefox/89.0',
      configurable: true,
    });

    const element = createReSkoutzedReviewElement(Language.ENGLISH);
    const link = element.querySelector('a');

    expect(link).not.toBeNull();
    expect(link?.href).toBe('https://addons.mozilla.org/en-US/firefox/addon/reskroutzed/reviews/');
    expect(link?.target).toBe('_blank');
    expect(link?.rel).toBe('noopener noreferrer');
    expect(link?.textContent).toBe('by reSkroutzed');
  });

  it('should append the link to the main element', () => {
    const element = createReSkoutzedReviewElement(Language.ENGLISH);

    // First call to appendElementToElement should be appending the link to the main element
    expect(DomClient.appendElementToElement).toHaveBeenCalledTimes(2);
    expect(DomClient.appendElementToElement).toHaveBeenNthCalledWith(
      1,
      expect.any(HTMLAnchorElement),
      element,
    );
  });

  it('should create and append a logo element', () => {
    const element = createReSkoutzedReviewElement(Language.ENGLISH);

    // The createLogoElement function should be called once
    expect(createLogoElement).toHaveBeenCalledTimes(1);

    // Second call to appendElementToElement should be appending the logo to the main element
    expect(DomClient.appendElementToElement).toHaveBeenNthCalledWith(2, mockLogoElement, element);

    // Verify the logo is actually in the DOM
    const logo = element.querySelector('.mock-logo');
    expect(logo).not.toBeNull();
  });
});
