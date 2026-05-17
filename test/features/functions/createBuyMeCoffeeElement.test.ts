// filepath: c:\Users\Keybraker\Github\reSkroutzed\test\features\functions\createBuyMeCoffeeElement.test.ts
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { DomClient } from '../../../src/clients/dom/client';
import { createBuyMeCoffeeElement } from '../../../src/features/functions/createBuyMeCoffeeElement';
import { Language } from '../../../src/common/enums/Language.enum';

// Mock dependencies
vi.mock('../../../src/clients/dom/client');

describe('createBuyMeCoffeeElement', () => {
  beforeEach(() => {
    vi.mocked(DomClient.appendElementToElement).mockImplementation((child, parent) => {
      if (child && parent) {
        parent.appendChild(child);
      }
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should create a buy me coffee element with correct classes', () => {
    const element = createBuyMeCoffeeElement(Language.ENGLISH);

    expect(element.tagName).toBe('DIV');
    expect(element.classList.contains('buy-me-coffee')).toBe(true);
  });

  it('should create a label container with text only', () => {
    const element = createBuyMeCoffeeElement(Language.ENGLISH);
    const labelContainer = element.querySelector('.buy-me-coffee-label-container');
    const coffeeIcon = element.querySelector('span.coffee-icon');
    const coffeeLabel = element.querySelector('span.coffee-label');

    expect(labelContainer).not.toBeNull();
    expect(coffeeIcon).toBeNull();
    expect(coffeeLabel).not.toBeNull();
    expect(coffeeLabel?.textContent).toBe('Support me');
  });

  it('should create PayPal option with correct link', () => {
    const element = createBuyMeCoffeeElement(Language.ENGLISH);
    const paypalLink = element.querySelector('a.buy-me-coffee-option.paypal');

    expect(paypalLink).not.toBeNull();
    expect(paypalLink?.getAttribute('href')).toBe('https://paypal.me/tsiakkas');
    expect(paypalLink?.getAttribute('target')).toBe('_blank');
    const paypalImg = paypalLink?.querySelector('img.payment-icon') as HTMLImageElement | null;
    const paypalText = paypalLink?.querySelector('span.payment-text') as HTMLSpanElement | null;
    expect(paypalImg).not.toBeNull();
    expect(paypalText?.textContent).toBe('PayPal');
    expect(paypalLink?.textContent).toBe('PayPal');
  });

  it('should create Revolut option with correct link', () => {
    const element = createBuyMeCoffeeElement(Language.ENGLISH);
    const revolutLink = element.querySelector('a.buy-me-coffee-option.revolut');

    expect(revolutLink).not.toBeNull();
    expect(revolutLink?.getAttribute('href')).toBe('https://revolut.me/keybraker');
    expect(revolutLink?.getAttribute('target')).toBe('_blank');
    const revolutImg = revolutLink?.querySelector('img.payment-icon') as HTMLImageElement | null;
    const revolutText = revolutLink?.querySelector('span.payment-text') as HTMLSpanElement | null;
    expect(revolutImg).not.toBeNull();
    expect(revolutText?.textContent).toBe('Revolut');
    expect(revolutLink?.textContent).toBe('Revolut');
  });

  it('should create an inline actions container with both support options', () => {
    const element = createBuyMeCoffeeElement(Language.ENGLISH);
    const optionsContainer = element.querySelector('.buy-me-coffee-options');
    const paypalLink = element.querySelector('a.buy-me-coffee-option.paypal');
    const revolutLink = element.querySelector('a.buy-me-coffee-option.revolut');

    expect(optionsContainer).not.toBeNull();
    expect(paypalLink).not.toBeNull();
    expect(revolutLink).not.toBeNull();
    expect(optionsContainer?.children.length).toBe(2);
  });
});
