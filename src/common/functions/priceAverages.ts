import { ProductPriceHistory } from '../../clients/skroutz/client';
import { PriceChartValue } from '../../clients/skroutz/types';

/**
 * Mean recorded price for each price-history window. A window is `null` when it
 * holds no usable sample, so the caller can decide to omit that half of the line
 * instead of printing a meaningless zero.
 */
export type PriceAverages = {
  sixMonth: number | null;
  lifetime: number | null;
};

function averageOf(samples: PriceChartValue[]): number | null {
  const values = samples
    .map((sample) => Number(sample.value))
    .filter((value) => Number.isFinite(value) && value > 0);

  if (values.length === 0) {
    return null;
  }

  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

export function getPriceAverages(productPriceHistory: ProductPriceHistory): PriceAverages {
  return {
    sixMonth: averageOf(productPriceHistory.sixMonthPrices),
    lifetime: averageOf(productPriceHistory.allPrices),
  };
}
