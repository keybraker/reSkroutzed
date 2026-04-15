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
    originalUserAgent = navigator.userAgent;

    mockLogoElement = document.createElement('div');
    mockLogoElement.classList.add('mock-logo');

    vi.mocked(DomClient.appendElementToElement).mockImplementation((child, parent) => {
      if (child && parent) {
        parent.appendChild(child);
      }
    });

    vi.mocked(createLogoElement).mockReturnValue(mockLogoElement);
  });

  afterEach(() => {
    Object.defineProperty(navigator, 'userAgent', {
      value: originalUserAgent,
      configurable: true,
    });

    vi.restoreAllMocks();
  });

  it('should create a review element with correct classes', () => {
    const element = createReSkoutzedReviewElement(Language.ENGLISH);
    const link = element.querySelector<HTMLAnchorElement>('.own-promotion-review-link');

    expect(element.tagName).toBe('DIV');
    expect(link?.classList.contains('icon-border')).toBe(true);
  });

  it('should create a link with Chrome store URL when not in Firefox', () => {
    Object.defineProperty(navigator, 'userAgent', {
      value:
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      configurable: true,
    });

    const element = createReSkoutzedReviewElement(Language.ENGLISH);
    const link = element.querySelector<HTMLAnchorElement>('.own-promotion-review-link');
    const prefix = link?.querySelector('.own-promotion-review-prefix');
    const highlightedBrand = link?.querySelector('strong');
    const logo = link?.querySelector('.mock-logo');

    expect(link).not.toBeNull();
    expect(link?.href).toBe(
      'https://chromewebstore.google.com/detail/reskroutzed/amglnkndjeoojnjjeepeheobhneeogcl',
    );
    expect(link?.target).toBe('_blank');
    expect(link?.rel).toBe('noopener noreferrer');
    expect(prefix?.textContent).toBe('By');
    expect(highlightedBrand?.textContent).toBe('reSkroutzed');
    expect(logo).not.toBeNull();
  });

  it('should create a link with Firefox store URL when in Firefox', () => {
    Object.defineProperty(navigator, 'userAgent', {
      value: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:89.0) Gecko/20100101 Firefox/89.0',
      configurable: true,
    });

    const element = createReSkoutzedReviewElement(Language.ENGLISH);
    const link = element.querySelector<HTMLAnchorElement>('.own-promotion-review-link');
    const prefix = link?.querySelector('.own-promotion-review-prefix');
    const highlightedBrand = link?.querySelector('strong');

    expect(link).not.toBeNull();
    expect(link?.href).toBe('https://addons.mozilla.org/en-US/firefox/addon/reskroutzed/reviews/');
    expect(link?.target).toBe('_blank');
    expect(link?.rel).toBe('noopener noreferrer');
    expect(prefix?.textContent).toBe('By');
    expect(highlightedBrand?.textContent).toBe('reSkroutzed');
  });

  it('should create and append a logo element', () => {
    const element = createReSkoutzedReviewElement(Language.ENGLISH);

    expect(createLogoElement).toHaveBeenCalledTimes(1);

    const logo = element.querySelector('.mock-logo');
    expect(logo).not.toBeNull();
  });
});
