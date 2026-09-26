/**
 * Shared text normalisation, scoring and query-variant helpers used by every
 * price-comparison provider client to match a Skroutz product against an
 * external catalogue.
 */

export const COLOR_HINTS = [
  'natural titanium',
  'desert titanium',
  'space gray',
  'deep blue',
  'graphite',
  'starlight',
  'midnight',
  'titanium',
  'silver',
  'black',
  'white',
  'blue',
  'green',
  'red',
  'gold',
  'pink',
  'purple',
  'grey',
  'gray',
];

export const ACCESSORY_HINTS = new Set([
  'case',
  'cover',
  'film',
  'glass',
  'hydrogel',
  'protector',
  'screen',
  'tempered',
  'tpu',
  'θήκη',
  'θηκη',
  'προστασιας',
  'προστασίας',
  'τζαμακι',
  'τζαμάκι',
  'μεμβρανη',
  'μεμβράνη',
  'φορτιστης',
  'φορτιστής',
  'charger',
  'cable',
  'adapter',
]);

export const compactWhitespace = (value?: string | null): string =>
  (value ?? '').replace(/\s+/g, ' ').trim();

export const normalizeText = (value: string): string =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9\u0370-\u03ff]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

export const tokenize = (value: string): string[] =>
  normalizeText(value)
    .split(' ')
    .filter((token) => token.length > 1);

export const getFirstFiniteNumber = (
  ...values: Array<number | string | undefined>
): number | undefined => {
  for (const value of values) {
    const numericValue = typeof value === 'number' ? value : Number(value);
    if (Number.isFinite(numericValue) && numericValue > 0) {
      return numericValue;
    }
  }

  return undefined;
};

/**
 * Build alternative search queries from a Skroutz product title so a provider
 * catalogue can still be searched when the literal title is too specific.
 */
export const buildSearchQueryVariants = (query: string): string[] => {
  const variants = new Set<string>();
  const addVariant = (value: string): void => {
    const candidate = compactWhitespace(value);
    if (candidate.length >= 4) {
      variants.add(candidate);
    }
  };

  addVariant(query);
  addVariant(query.replace(/[|,:;+]+/g, ' '));
  addVariant(query.replace(/\((?:\d+\s*\/\s*)?(\d+\s*(?:gb|tb))\)/gi, '$1'));
  addVariant(query.replace(/\(([^)]*)\)/g, ' $1 '));
  addVariant(query.replace(/\([^)]*\)/g, ' '));
  addVariant(
    query.replace(
      new RegExp(
        `\\b(?:${COLOR_HINTS.map((hint) => hint.replace(/\s+/g, '\\s+')).join('|')})\\b`,
        'gi',
      ),
      ' ',
    ),
  );
  addVariant(query.replace(/[/_-]+/g, ' '));

  return [...variants];
};

/**
 * Configuration-bearing tokens: capacity, refresh rate, battery, camera, core
 * count and screen size. Two listings for the "same" product regularly differ
 * here - a 48GB and a 24GB MacBook Pro share every other word in their titles -
 * so a candidate whose specs disagree with the Skroutz title must never rank as
 * a match, no matter how much of the rest of the title overlaps.
 */
const SPEC_PATTERN_SOURCE =
  '(\\d+(?:[.,]\\d+)?)[-\\s]*(gb|tb|mb|ghz|mhz|hz|mah|mp|core)\\b|(\\d+(?:[.,]\\d+)?)[-\\s]*(?:"|”|inch(?:es)?)';

const extractSpecValues = (title: string): Map<string, string[]> => {
  const specs = new Map<string, string[]>();
  const addSpec = (unit: string, value: string): void => {
    specs.set(unit, [...(specs.get(unit) ?? []), value.replace(',', '.')]);
  };

  // A fresh regex per call: a shared /g/ literal keeps lastIndex between calls.
  const pattern = new RegExp(SPEC_PATTERN_SOURCE, 'gi');
  let match = pattern.exec(title);

  while (match) {
    if (match[1] !== undefined && match[2] !== undefined) {
      addSpec(match[2].toLowerCase(), match[1]);
    } else if (match[3] !== undefined) {
      addSpec('in', match[3]);
    }

    match = pattern.exec(title);
  }

  return specs;
};

const areSpecValuesEqual = (left: string[], right: string[]): boolean =>
  [...left].sort().join('|') === [...right].sort().join('|');

/**
 * Whether a candidate lists a configuration compatible with the Skroutz title.
 * A candidate that simply omits a spec stays acceptable, but one that states a
 * conflicting value (48GB vs 24GB, 120Hz vs 60Hz) is rejected.
 */
export const isVariantCompatible = (query: string, title: string): boolean => {
  const querySpecs = extractSpecValues(query);

  if (querySpecs.size === 0) {
    return true;
  }

  const titleSpecs = extractSpecValues(title);

  for (const [unit, queryValues] of querySpecs) {
    const titleValues = titleSpecs.get(unit);

    if (titleValues && !areSpecValuesEqual(queryValues, titleValues)) {
      return false;
    }
  }

  return true;
};

/**
 * Score how well a provider catalogue title matches the Skroutz product title.
 * Returns `Number.NEGATIVE_INFINITY` when the titles are too far apart.
 */
export const scoreDealMatch = (
  deal: { title: string; merchantCount?: number },
  query: string,
): number => {
  const normalizedQuery = normalizeText(query);
  const normalizedTitle = normalizeText(deal.title);
  const queryTokens = new Set(tokenize(query));
  const titleTokens = new Set(tokenize(deal.title));
  const commonTokens = [...titleTokens].filter((token) => queryTokens.has(token));

  if (commonTokens.length < 2) {
    return Number.NEGATIVE_INFINITY;
  }

  if (!isVariantCompatible(query, deal.title)) {
    return Number.NEGATIVE_INFINITY;
  }

  let score = 12 * commonTokens.length;
  score += (commonTokens.length / Math.max(queryTokens.size, 1)) * 30;

  if (normalizedQuery === normalizedTitle) {
    score += 30;
  }

  if (normalizedQuery.includes(normalizedTitle) || normalizedTitle.includes(normalizedQuery)) {
    score += 12;
  }

  score -= 18 * [...titleTokens].filter((token) => ACCESSORY_HINTS.has(token)).length;

  if (deal.merchantCount) {
    score += Math.min(deal.merchantCount, 99) / 8;
  }

  return score;
};
