import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { DomClient } from '../../../src/clients/dom/client';
import { Language } from '../../../src/common/enums/Language.enum';
import { createReSkoutzedReviewElement } from '../../../src/features/functions/createReskoutzedReviewElement';

// Mock dependencies
vi.mock('../../../src/clients/dom/client');

describe('createReskoutzedReviewElement', () => {
  let originalUserAgent: string;

  beforeEach(() => {
    originalUserAgent = navigator.userAgent;

    vi.mocked(DomClient.appendElementToElement).mockImplementation((child, parent) => {
      if (child && parent) {
        parent.appendChild(child);
      }
    });
  });

  afterEach(() => {
    Object.defineProperty(navigator, 'userAgent', {
      value: originalUserAgent,
      configurable: true,
    });

    vi.restoreAllMocks();
  });

  it('should create a review element with the review link', () => {
    // Act
    const element = createReSkoutzedReviewElement(Language.ENGLISH);
    const link = element.querySelector<HTMLAnchorElement>('.own-promotion-review-link');

    // Assert
    expect(element.tagName).toBe('DIV');
    expect(link).not.toBeNull();
    expect(link?.parentElement?.classList.contains('own-promotion-left')).toBe(true);
  });

  it('should label the link "Rate us" in English', () => {
    // Act
    const element = createReSkoutzedReviewElement(Language.ENGLISH);
    const label = element.querySelector('.own-promotion-review-copy');

    // Assert
    expect(label?.textContent).toBe('Rate us');
  });

  it('should label the link "Αξιολόγησε μας" in Greek', () => {
    // Act
    const element = createReSkoutzedReviewElement(Language.GREEK);
    const label = element.querySelector('.own-promotion-review-copy');

    // Assert
    expect(label?.textContent).toBe('Αξιολόγησε μας');
  });

  it('should not render the reSkroutzed icon', () => {
    // Act
    const element = createReSkoutzedReviewElement(Language.ENGLISH);

    // Assert
    expect(element.querySelector('.own-promotion-brand-logo')).toBeNull();
    expect(element.querySelector('.own-promotion-brand-logo-slot')).toBeNull();
    expect(element.querySelector('img')).toBeNull();
  });

  it('should create a link with Chrome store URL when not in Firefox', () => {
    // Arrange
    Object.defineProperty(navigator, 'userAgent', {
      value:
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      configurable: true,
    });

    // Act
    const element = createReSkoutzedReviewElement(Language.ENGLISH);
    const link = element.querySelector<HTMLAnchorElement>('.own-promotion-review-link');

    // Assert
    expect(link).not.toBeNull();
    expect(link?.href).toBe(
      'https://chromewebstore.google.com/detail/reskroutzed/amglnkndjeoojnjjeepeheobhneeogcl',
    );
    expect(link?.target).toBe('_blank');
    expect(link?.rel).toBe('noopener noreferrer');
  });

  it('should create a link with Firefox store URL when in Firefox', () => {
    // Arrange
    Object.defineProperty(navigator, 'userAgent', {
      value: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:89.0) Gecko/20100101 Firefox/89.0',
      configurable: true,
    });

    // Act
    const element = createReSkoutzedReviewElement(Language.ENGLISH);
    const link = element.querySelector<HTMLAnchorElement>('.own-promotion-review-link');

    // Assert
    expect(link).not.toBeNull();
    expect(link?.href).toBe('https://addons.mozilla.org/en-US/firefox/addon/reskroutzed/reviews/');
    expect(link?.target).toBe('_blank');
    expect(link?.rel).toBe('noopener noreferrer');
  });
});
