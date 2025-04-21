// filepath: c:\Users\Keybraker\Github\reSkroutzed\test\features\functions\createBuyMeCoffeeElement.test.ts
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { createBuyMeCoffeeElement } from '../../../src/features/functions/createBuyMeCoffeeElement';
import { DomClient } from '../../../src/clients/dom/client';

// Mock dependencies
vi.mock('../../../src/clients/dom/client');

describe('createBuyMeCoffeeElement', () => {
  beforeEach(() => {
    // Set up our mocks
    vi.mocked(DomClient.appendElementToElement).mockImplementation((child, parent) => {
      // Actually append the element to parent to make the tests work
      if (child && parent) {
        parent.appendChild(child);
      }
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should create a buy me coffee element with correct classes', () => {
    const element = createBuyMeCoffeeElement();

    expect(element.tagName).toBe('DIV');
    expect(element.classList.contains('reskroutzed-tag')).toBe(true);
    expect(element.classList.contains('buy-me-coffee')).toBe(true);
  });

  it('should create a link with correct attributes', () => {
    const element = createBuyMeCoffeeElement();
    const link = element.querySelector('a');

    expect(link).not.toBeNull();
    expect(link?.href).toBe('https://paypal.me/tsiakkas');
    expect(link?.target).toBe('_blank');
    expect(link?.rel).toBe('noopener noreferrer');
    expect(link?.title).toBe('Buy Me A Coffee');
  });

  it('should create a coffee icon with correct class and content', () => {
    const element = createBuyMeCoffeeElement();
    const span = element.querySelector('span.coffee-icon');

    expect(span).not.toBeNull();
    expect(span?.classList.contains('coffee-icon')).toBe(true);
    expect(span?.innerHTML).toBe('☕');
  });

  it('should append the coffee icon to the link', () => {
    createBuyMeCoffeeElement();

    // First call to appendElementToElement should be appending the coffee icon to the link
    expect(DomClient.appendElementToElement).toHaveBeenCalledTimes(2);
    expect(DomClient.appendElementToElement).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        classList: expect.objectContaining({
          contains: expect.any(Function),
        }),
        innerHTML: '☕',
      }),
      expect.any(HTMLAnchorElement),
    );
  });

  it('should append the link to the main element', () => {
    const element = createBuyMeCoffeeElement();

    // Second call to appendElementToElement should be appending the link to the main element
    expect(DomClient.appendElementToElement).toHaveBeenNthCalledWith(
      2,
      expect.any(HTMLAnchorElement),
      element,
    );
  });
});
