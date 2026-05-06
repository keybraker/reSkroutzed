// filepath: c:\Users\Keybraker\Github\reSkroutzed\test\features\functions\createBuyMeCoffeeElement.test.ts
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { DomClient } from '../../../src/clients/dom/client';
import { createBuyMeCoffeeElement } from '../../../src/features/functions/createBuyMeCoffeeElement';

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
    expect(element.classList.contains('buy-me-coffee')).toBe(true);
  });

  it('should create a trigger button with correct attributes', () => {
    const element = createBuyMeCoffeeElement();
    const button = element.querySelector('button.buy-me-coffee-link') as HTMLButtonElement | null;

    expect(button).not.toBeNull();
    expect(button?.type).toBe('button');
    expect(button?.title).toBe('Buy Me A Coffee');
  });

  it('should create PayPal option with correct link', () => {
    const element = createBuyMeCoffeeElement();
    const paypalLink = element.querySelector('a.buy-me-coffee-option.paypal');

    expect(paypalLink).not.toBeNull();
    expect(paypalLink?.getAttribute('href')).toBe('https://paypal.me/tsiakkas');
    expect(paypalLink?.getAttribute('target')).toBe('_blank');
    expect(paypalLink?.getAttribute('rel')).toBe('noopener noreferrer');
    expect(paypalLink?.textContent).toBe('PayPal');
  });

  it('should create Revolut option with correct link', () => {
    const element = createBuyMeCoffeeElement();
    const revolutLink = element.querySelector('a.buy-me-coffee-option.revolut');

    expect(revolutLink).not.toBeNull();
    expect(revolutLink?.getAttribute('href')).toBe('https://revolut.me/keybraker');
    expect(revolutLink?.getAttribute('target')).toBe('_blank');
    expect(revolutLink?.getAttribute('rel')).toBe('noopener noreferrer');
    expect(revolutLink?.textContent).toBe('Revolut');
  });

  it('should create a modal with close button', () => {
    const element = createBuyMeCoffeeElement();
    const modal = element.querySelector('.buy-me-coffee-modal');
    const closeButton = element.querySelector(
      'button.buy-me-coffee-close',
    ) as HTMLButtonElement | null;

    expect(modal).not.toBeNull();
    expect(closeButton).not.toBeNull();
    expect(closeButton?.type).toBe('button');
    expect(closeButton?.textContent).toBe('✕');
  });

  it('should display the correct modal title', () => {
    const element = createBuyMeCoffeeElement();
    const modalTitle = element.querySelector('.buy-me-coffee-modal-content h3');

    expect(modalTitle?.textContent).toBe('Buy me a coffee');
  });

  it('should toggle modal active class on button click', () => {
    const element = createBuyMeCoffeeElement();
    const button = element.querySelector('button.buy-me-coffee-link') as HTMLButtonElement;
    const modal = element.querySelector('.buy-me-coffee-modal') as HTMLDivElement;

    expect(modal.classList.contains('active')).toBe(false);

    button.click();
    expect(modal.classList.contains('active')).toBe(true);
  });

  it('should close modal on close button click', () => {
    const element = createBuyMeCoffeeElement();
    const button = element.querySelector('button.buy-me-coffee-link') as HTMLButtonElement;
    const closeButton = element.querySelector('button.buy-me-coffee-close') as HTMLButtonElement;
    const modal = element.querySelector('.buy-me-coffee-modal') as HTMLDivElement;

    button.click();
    expect(modal.classList.contains('active')).toBe(true);

    closeButton.click();
    expect(modal.classList.contains('active')).toBe(false);
  });

  it('should close modal when clicking on modal overlay', () => {
    const element = createBuyMeCoffeeElement();
    const button = element.querySelector('button.buy-me-coffee-link') as HTMLButtonElement;
    const modal = element.querySelector('.buy-me-coffee-modal') as HTMLDivElement;

    button.click();
    expect(modal.classList.contains('active')).toBe(true);

    modal.dispatchEvent(new MouseEvent('click', { bubbles: false }));
    expect(modal.classList.contains('active')).toBe(false);
  });

  it('should contain coffee icon and label in button', () => {
    const element = createBuyMeCoffeeElement();
    const button = element.querySelector('button.buy-me-coffee-link');
    const coffeeIcon = button?.querySelector('span.coffee-icon');
    const coffeeLabel = button?.querySelector('span.coffee-label');

    expect(coffeeIcon).not.toBeNull();
    expect(coffeeLabel).not.toBeNull();
    expect(coffeeIcon?.textContent).toBe('☕');
    expect(coffeeLabel?.textContent).toBe('Buy me a coffee');
  });
});
