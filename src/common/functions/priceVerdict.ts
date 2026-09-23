import { ProductPriceHistory } from '../../clients/skroutz/client';
import { PriceChartValue } from '../../clients/skroutz/types';

/** Cheap / fair / expensive, as shown in the price-history verdict box. */
export type PriceVerdict = 'cheap' | 'normal' | 'expensive';

/**
 * Verdict of the current price against the last 6 months and against the entire
 * sales period.
 *
 * Each window is judged on its own distribution of observed prices and by its
 * interquartile range (p25-p75) rather than by its minimum and maximum: a single
 * flash sale or the launch price used to redefine the whole scale, so a perfectly
 * ordinary price could read as expensive and vice versa. "Normal" therefore means
 * "inside the range the product is normally sold at".
 */
export type PriceAssessment = {
  /** Against the last 6 months; `null` when that window has no usable samples. */
  recent: PriceVerdict | null;
  /** Against the entire sales period; `null` when it has no usable samples. */
  lifetime: PriceVerdict | null;
  /**
   * What the user is shown. `cheap` / `expensive` are only claimed when both
   * windows agree, so a dip inside a single window cannot be advertised as a deal.
   */
  overall: PriceVerdict;
};

const CHEAP_BOUNDARY = 0.25;
const EXPENSIVE_BOUNDARY = 0.75;

export function assessPrice(
  productPriceHistory: ProductPriceHistory,
  currentPrice: number,
): PriceAssessment {
  if (!Number.isFinite(currentPrice)) {
    return { recent: null, lifetime: null, overall: 'normal' };
  }

  const recent = getWindowVerdict(toValues(productPriceHistory.sixMonthPrices), currentPrice);
  const lifetime = getWindowVerdict(toValues(productPriceHistory.allPrices), currentPrice);

  return { recent, lifetime, overall: combineVerdicts(recent, lifetime) };
}

function toValues(samples: PriceChartValue[]): number[] {
  return samples
    .map((sample) => Number(sample.value))
    .filter((value) => Number.isFinite(value) && value > 0);
}

function getWindowVerdict(values: number[], currentPrice: number): PriceVerdict | null {
  if (values.length === 0) {
    return null;
  }

  const sortedValues = [...values].sort((left, right) => left - right);

  if (currentPrice < percentile(sortedValues, CHEAP_BOUNDARY)) {
    return 'cheap';
  }

  if (currentPrice > percentile(sortedValues, EXPENSIVE_BOUNDARY)) {
    return 'expensive';
  }

  return 'normal';
}

function combineVerdicts(recent: PriceVerdict | null, lifetime: PriceVerdict | null): PriceVerdict {
  if (recent === null) {
    return lifetime ?? 'normal';
  }

  if (lifetime === null) {
    return recent;
  }

  return recent === lifetime ? recent : 'normal';
}

function percentile(sortedValues: number[], fraction: number): number {
  const index = fraction * (sortedValues.length - 1);
  const lower = Math.floor(index);
  const upper = Math.ceil(index);

  if (lower === upper) {
    return sortedValues[lower];
  }

  const weight = index - lower;

  return sortedValues[lower] * (1 - weight) + sortedValues[upper] * weight;
}
