import { afterEach, describe, expect, it } from 'vitest';

import {
  ensurePriceCheckerStyleInjected,
  PRICE_CHECKER_STYLE_ID,
} from '../../../src/features/functions/ensurePriceCheckerStyleInjected';

describe('ensurePriceCheckerStyleInjected', () => {
  afterEach(() => {
    document.getElementById(PRICE_CHECKER_STYLE_ID)?.remove();
  });

  it('links the bundled price-checker stylesheet', () => {
    // Act
    ensurePriceCheckerStyleInjected();

    // Assert
    const link = document.getElementById(PRICE_CHECKER_STYLE_ID) as HTMLLinkElement | null;
    expect(link).not.toBeNull();
    expect(link?.rel).toBe('stylesheet');
    expect(link?.href).toBe('chrome-extension://test-extension-id/css/priceChecker.css');
  });

  it('injects the stylesheet only once', () => {
    // Act
    ensurePriceCheckerStyleInjected();
    ensurePriceCheckerStyleInjected();

    // Assert
    expect(document.querySelectorAll(`#${PRICE_CHECKER_STYLE_ID}`)).toHaveLength(1);
  });
});
