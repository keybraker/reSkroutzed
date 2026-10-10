import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { DomClient } from '../../../src/clients/dom/client';
import { Language } from '../../../src/common/enums/Language.enum';
import { createBuyMeCoffeeElement } from '../../../src/features/functions/createBuyMeCoffeeElement';

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

  it('should link the support button to the support page', () => {
    // Arrange / Act
    const element = createBuyMeCoffeeElement(Language.ENGLISH);
    const supportLink = element.querySelector('a.buy-me-coffee-link');

    // Assert
    expect(supportLink).not.toBeNull();
    expect(supportLink?.getAttribute('href')).toBe('https://itsiakkas.com/support');
    expect(supportLink?.getAttribute('target')).toBe('_blank');
    expect(supportLink?.getAttribute('rel')).toBe('noopener noreferrer');
  });

  it('should label the support button in English', () => {
    // Arrange / Act
    const element = createBuyMeCoffeeElement(Language.ENGLISH);
    const coffeeLabel = element.querySelector('span.coffee-label');

    // Assert
    expect(coffeeLabel).not.toBeNull();
    expect(coffeeLabel?.textContent).toBe('Support me');
  });

  it('should label the support button in Greek', () => {
    // Arrange / Act
    const element = createBuyMeCoffeeElement(Language.GREEK);
    const coffeeLabel = element.querySelector('span.coffee-label');

    // Assert
    expect(coffeeLabel).not.toBeNull();
    expect(coffeeLabel?.textContent).toBe('Υποστήριξε με');
  });

  it('should render a single support link', () => {
    // Arrange / Act
    const element = createBuyMeCoffeeElement(Language.ENGLISH);

    // Assert
    expect(element.querySelectorAll('a').length).toBe(1);
  });
});
