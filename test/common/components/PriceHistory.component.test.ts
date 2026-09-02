import { afterEach, describe, expect, it } from 'vitest';

import { ProductPriceHistory } from '../../../src/clients/skroutz/client';
import { PriceHistoryComponent } from '../../../src/common/components/PriceHistory.component';
import { Language } from '../../../src/common/enums/Language.enum';

describe('PriceHistoryComponent', () => {
  const makeHistory = (min: number, max: number): ProductPriceHistory => ({
    minimumPrice: min,
    maximumPrice: max,
    allPrices: [],
    sixMonthPrices: [],
  });

  const renderVerdict = (
    state: 'cheap' | 'normal' | 'expensive',
    history: ProductPriceHistory,
    price: number,
    language: Language = Language.GREEK,
  ): HTMLElement => {
    const wrapper = PriceHistoryComponent(state, history, language, price);
    const verdict = wrapper.querySelector('.price-history-verdict');
    if (!verdict) {
      throw new Error('price-history-verdict not rendered');
    }
    return verdict as HTMLElement;
  };

  const queryPart = (verdict: HTMLElement, selector: string): HTMLElement => {
    const element = verdict.querySelector(selector);
    if (!element) {
      throw new Error(`${selector} not rendered`);
    }
    return element as HTMLElement;
  };

  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('renders a GOOD PRICE row with the buy modifier when the price is cheap', () => {
    // Arrange
    const history = makeHistory(100, 200);

    // Act
    const verdict = renderVerdict('cheap', history, 110);

    // Assert
    expect(verdict.className).toBe('price-history-verdict price-history-verdict--buy');
    expect(queryPart(verdict, '.price-history-verdict-title').textContent).toBe('Καλή τιμή');
  });

  it('renders an OK PRICE row with the shortlist modifier when the price is normal', () => {
    // Arrange
    const history = makeHistory(100, 200);

    // Act
    const verdict = renderVerdict('normal', history, 150);

    // Assert
    expect(verdict.className).toBe('price-history-verdict price-history-verdict--shortlist');
    expect(queryPart(verdict, '.price-history-verdict-title').textContent).toBe('Κανονική τιμή');
  });

  it('renders an EXPENSIVE PRICE row with the dontbuy modifier when the price is expensive', () => {
    // Arrange
    const history = makeHistory(100, 200);

    // Act
    const verdict = renderVerdict('expensive', history, 190);

    // Assert
    expect(verdict.className).toBe('price-history-verdict price-history-verdict--dontbuy');
    expect(queryPart(verdict, '.price-history-verdict-title').textContent).toBe('Ακριβή τιμή');
  });

  it('renders a coloured rounded icon square inside every verdict row', () => {
    // Arrange
    const history = makeHistory(100, 200);

    // Act
    const verdict = renderVerdict('normal', history, 150);

    // Assert
    expect(queryPart(verdict, '.price-history-verdict-icon').querySelector('svg')).not.toBeNull();
  });

  it('uses the same base design for every verdict and only varies the colour modifier', () => {
    // Arrange
    const history = makeHistory(100, 200);

    // Act
    const buy = renderVerdict('cheap', history, 110);
    const shortlist = renderVerdict('normal', history, 150);
    const dontBuy = renderVerdict('expensive', history, 190);

    // Assert
    const verdicts = [buy, shortlist, dontBuy];
    verdicts.forEach((verdict) => {
      expect(verdict.classList.contains('price-history-verdict')).toBe(true);
      expect(verdict.querySelector('.price-history-verdict-icon')).not.toBeNull();
      expect(verdict.querySelector('.price-history-verdict-title')).not.toBeNull();
      expect(verdict.querySelector('.price-history-verdict-subtitle')).not.toBeNull();
    });
    expect(new Set(verdicts.map((verdict) => verdict.className))).toEqual(
      new Set([
        'price-history-verdict price-history-verdict--buy',
        'price-history-verdict price-history-verdict--shortlist',
        'price-history-verdict price-history-verdict--dontbuy',
      ]),
    );
  });

  it('shows the combined assessment sentence as the subtitle when lifetime matches the current state', () => {
    // Arrange
    const history = makeHistory(100, 200);

    // Act
    const verdict = renderVerdict('normal', history, 150);

    // Assert
    expect(queryPart(verdict, '.price-history-verdict-subtitle').textContent).toBe(
      'Μέση τιμή σε σχέση με το τελευταίο εξάμηνο και όλη τη διάρκεια πώλησης',
    );
  });

  it('falls back to the period assessment sentence when lifetime data is unavailable', () => {
    // Arrange
    const history = makeHistory(100, 100);

    // Act
    const verdict = renderVerdict('expensive', history, 100);

    // Assert
    expect(queryPart(verdict, '.price-history-verdict-subtitle').textContent).toBe(
      'Υψηλή τιμή σε σχέση με το τελευταίο εξάμηνο',
    );
  });

  it('localizes the assessment sentence according to the language', () => {
    // Arrange
    const history = makeHistory(100, 200);

    // Act
    const verdict = renderVerdict('cheap', history, 110, Language.ENGLISH);

    // Assert
    expect(queryPart(verdict, '.price-history-verdict-subtitle').textContent).toBe(
      'Good price compared to both the last 6 months and the entire sales period',
    );
  });

  it('localizes the verdict labels to English (GOOD PRICE / OK PRICE / EXPENSIVE PRICE)', () => {
    // Arrange
    const history = makeHistory(100, 200);

    // Act
    const good = renderVerdict('cheap', history, 110, Language.ENGLISH);
    const ok = renderVerdict('normal', history, 150, Language.ENGLISH);
    const expensive = renderVerdict('expensive', history, 190, Language.ENGLISH);

    // Assert
    expect(queryPart(good, '.price-history-verdict-title').textContent).toBe('GOOD PRICE');
    expect(queryPart(ok, '.price-history-verdict-title').textContent).toBe('OK PRICE');
    expect(queryPart(expensive, '.price-history-verdict-title').textContent).toBe(
      'EXPENSIVE PRICE',
    );
  });
});
