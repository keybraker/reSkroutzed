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
