import { describe, expect, it } from 'vitest';

import { ProductPriceHistory } from '../../../src/clients/skroutz/client';
import { PriceChartValue } from '../../../src/clients/skroutz/types';
import { getPriceAverages } from '../../../src/common/functions/priceAverages';

const samples = (values: number[]): PriceChartValue[] =>
  values.map((value, index) => ({ value, timestamp: index * 86_400_000 }));

const makeHistory = (
  allPrices: number[],
  sixMonthPrices: number[] = allPrices,
): ProductPriceHistory => ({
  allPrices: samples(allPrices),
  sixMonthPrices: samples(sixMonthPrices),
});

describe('getPriceAverages', () => {
  it('averages both the six-month and the lifetime windows', () => {
    // Arrange
    const history = makeHistory([100, 110, 120], [90, 100]);

    // Act
    const averages = getPriceAverages(history);

    // Assert
    expect(averages).toEqual({ sixMonth: 95, lifetime: 110 });
  });

  it('ignores non-positive and non-finite samples', () => {
    // Arrange
    const history = makeHistory([0, -10, 100, 200], [Number.NaN, 50, 150]);

    // Act
    const averages = getPriceAverages(history);

    // Assert
    expect(averages).toEqual({ sixMonth: 100, lifetime: 150 });
  });

  it('returns null for a window with no usable samples', () => {
    // Arrange
    const history = makeHistory([100, 200], []);

    // Act
    const averages = getPriceAverages(history);

    // Assert
    expect(averages).toEqual({ sixMonth: null, lifetime: 150 });
  });

  it('returns null for both windows when there is no history at all', () => {
    // Arrange
    const history = makeHistory([], []);

    // Act
    const averages = getPriceAverages(history);

    // Assert
    expect(averages).toEqual({ sixMonth: null, lifetime: null });
  });
});
