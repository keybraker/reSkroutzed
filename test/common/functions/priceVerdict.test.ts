import { describe, expect, it } from 'vitest';

import { ProductPriceHistory } from '../../../src/clients/skroutz/client';
import { PriceChartValue } from '../../../src/clients/skroutz/types';
import { assessPrice } from '../../../src/common/functions/priceVerdict';

describe('assessPrice', () => {
  const samples = (values: number[]): PriceChartValue[] =>
    values.map((value, index) => ({ value, timestamp: index * 86_400_000 }));

  const makeHistory = (
    allPrices: number[],
    sixMonthPrices: number[] = allPrices,
  ): ProductPriceHistory => ({
    minimumPrice: Math.min(...allPrices),
    maximumPrice: Math.max(...allPrices),
    allPrices: samples(allPrices),
    sixMonthPrices: samples(sixMonthPrices),
  });

  it('calls a price normal when it sits inside the typical range of both windows', () => {
    // Arrange
    const history = makeHistory([100, 120, 140, 160, 180]);

    // Act
    const assessment = assessPrice(history, 140);

    // Assert
    expect(assessment).toEqual({ recent: 'normal', lifetime: 'normal', overall: 'normal' });
  });

  it('calls a price cheap when it is below the cheapest quarter of both windows', () => {
    // Arrange
    const history = makeHistory([100, 120, 140, 160, 180]);

    // Act
    const assessment = assessPrice(history, 95);

    // Assert
    expect(assessment).toEqual({ recent: 'cheap', lifetime: 'cheap', overall: 'cheap' });
  });

  it('calls a price expensive when it is above the priciest quarter of both windows', () => {
    // Arrange
    const history = makeHistory([100, 120, 140, 160, 180]);

    // Act
    const assessment = assessPrice(history, 200);

    // Assert
    expect(assessment).toEqual({
      recent: 'expensive',
      lifetime: 'expensive',
      overall: 'expensive',
    });
  });

  it('ignores a one-off flash sale when judging the regular price', () => {
    // Arrange — the product has been sold at 100€ for its whole life, with a
    // single 50€ flash sale; the old min/max scale called 100€ the most expensive
    // price the product ever had.
    const history = makeHistory([50, 100, 100, 100, 100, 100, 100, 100], [100, 100, 100]);

    // Act
    const assessment = assessPrice(history, 100);

    // Assert
    expect(assessment.overall).toBe('normal');
  });

  it('keeps a price normal when only one window calls it cheap', () => {
    // Arrange — cheap against the last 6 months, ordinary over the entire period
    const history = makeHistory([90, 100, 150, 200, 210], [100, 150, 200]);

    // Act
    const assessment = assessPrice(history, 105);

    // Assert
    expect(assessment.recent).toBe('cheap');
    expect(assessment.lifetime).toBe('normal');
    expect(assessment.overall).toBe('normal');
  });

  it('falls back to the only window that has samples', () => {
    // Arrange — a product new enough to have no lifetime history yet
    const history = makeHistory([], [100, 150, 200]);

    // Act
    const assessment = assessPrice(history, 110);

    // Assert
    expect(assessment.recent).toBe('cheap');
    expect(assessment.lifetime).toBeNull();
    expect(assessment.overall).toBe('cheap');
  });

  it('treats a price exactly on the quartile boundary as normal', () => {
    // Arrange — p25 of the sorted samples is 125
    const history = makeHistory([100, 150, 200]);

    // Act
    const assessment = assessPrice(history, 125);

    // Assert
    expect(assessment.overall).toBe('normal');
  });

  it('returns a normal verdict when the history has no usable samples', () => {
    // Arrange
    const history = makeHistory([0, 0]);

    // Act
    const assessment = assessPrice(history, 100);

    // Assert
    expect(assessment).toEqual({ recent: null, lifetime: null, overall: 'normal' });
  });

  it('returns a normal verdict when the current price is not a number', () => {
    // Arrange
    const history = makeHistory([100, 150, 200]);

    // Act
    const assessment = assessPrice(history, Number.NaN);

    // Assert
    expect(assessment).toEqual({ recent: null, lifetime: null, overall: 'normal' });
  });
});
