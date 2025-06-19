import { PriceChartValue } from '../../clients/skroutz/types';

export function removeOutliers(data: PriceChartValue[]): PriceChartValue[] {
  if (data.length < 4) return data;

  const prices = data.map((item) => item.value);
  const sorted = [...prices].sort((a, b) => a - b);
  const q1 = percentile(sorted, 25);
  const q3 = percentile(sorted, 75);
  const iqr = q3 - q1;

  const lowerBound = q1 - 1.5 * iqr;
  const upperBound = q3 + 1.5 * iqr;

  return data.filter((item) => item.value >= lowerBound && item.value <= upperBound);
}

function percentile(arr: number[], p: number): number {
  const index = (p / 100) * (arr.length - 1);
  const lower = Math.floor(index);
  const upper = Math.ceil(index);
  const weight = index - lower;

  if (lower === upper) return arr[lower];
  return arr[lower] * (1 - weight) + arr[upper] * weight;
}
