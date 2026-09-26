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
 * Marketing filler that says nothing about which product is being looked at.
 * Provider search engines AND every term, so these words only reduce recall.
 */
const FILLER_HINTS = new Set([
  'ips',
  'retina',
  'display',
  'screen',
  'panel',
  'ssd',
  'hdd',
  'nand',
  'gpu',
  'cpu',
  'npu',
  'chip',
  'core',
  'cores',
  'keyboard',
  'panel',
  'nano',
  'texture',
  'us',
  'uk',
  'with',
  'and',
]);

/** A value glued to its unit: "48GB", "1TB", "120Hz", "5000mAh". */
const GLUED_SPEC_PATTERN = /^\d+(?:[.,]\d+)?(?:gb|tb|mb|ghz|mhz|hz|mah|mp)$/i;

/** A standalone number, which is either a screen size or a spec value. */
const STANDALONE_NUMBER_PATTERN = /^\d+(?:[.,]\d+)?$/;

/** Units that turn the number before them into a spec rather than a size. */
const SPEC_UNITS = new Set(['core', 'cores', 'gb', 'tb', 'mb', 'ghz', 'mhz', 'hz', 'mah', 'mp']);

/** Screens are never smaller than this, so a smaller number is a spec value. */
const MINIMUM_SCREEN_SIZE = 10;

/**
 * Reduce a title to the words that actually identify the product: the brand,
 * the family, the model and the screen size. Provider search engines AND every
 * term, so an over-specified query matches nothing at all - BestPrice answers
 * "Apple MacBook Pro 14.2\" IPS Retina Display 120Hz (M5 Pro-15-Core/48GB/1TB
 * SSD/16-Core GPU) Space Black (US Keyboard)" with no results and the advice
 * to use fewer terms, while "Apple MacBook Pro 14 M5 Pro" finds it.
 */
const buildBroadQuery = (query: string): string => {
  const tokens = compactWhitespace(query.replace(/[/_+(),-]+/g, ' ')).split(' ');

  return compactWhitespace(
    tokens
      .filter((token, index) => {
        const lowered = token.toLowerCase();

        if (!/\d/.test(lowered)) {
          return !FILLER_HINTS.has(lowered);
        }

        if (GLUED_SPEC_PATTERN.test(lowered)) {
          return false;
        }

        if (STANDALONE_NUMBER_PATTERN.test(lowered)) {
          const nextToken = tokens[index + 1]?.toLowerCase() ?? '';

          // "15 Core" is a core count, not a screen size.
          return Number(lowered) >= MINIMUM_SCREEN_SIZE && !SPEC_UNITS.has(nextToken);
        }

        return true;
      })
      .join(' '),
  );
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

  // Tried last: the broadest form, so it only runs when nothing more specific
  // found a match. Being last keeps precision intact for well-covered products.
  const broadQuery = buildBroadQuery(query);
  addVariant(broadQuery);
  addVariant(
    broadQuery.replace(
      new RegExp(
        `\\b(?:${COLOR_HINTS.map((hint) => hint.replace(/\s+/g, '\\s+')).join('|')})\\b`,
        'gi',
      ),
      ' ',
    ),
  );

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

/**
 * Greek catalogues write thousands with a dot ("5.000 mAh") where Skroutz
 * writes them plain, so fold those before comparing. Decimals ("14.2") keep
 * their dot and commas become dots.
 */
const normalizeSpecValue = (value: string): string =>
  /^\d{1,3}(?:\.\d{3})+$/.test(value) ? value.replace(/\./g, '') : value.replace(',', '.');

const extractSpecValues = (title: string): Map<string, string[]> => {
  const specs = new Map<string, string[]>();
  const addSpec = (unit: string, value: string): void => {
    specs.set(unit, [...(specs.get(unit) ?? []), normalizeSpecValue(value)]);
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

const compareSpecValuesDescending = (left: string, right: string): number =>
  Number(right) - Number(left);

/**
 * Catalogue titles drop or add the lower-order specs relative to Skroutz
 * ("256GB" where Skroutz writes "12GB 256GB"), so values are compared from the
 * largest downwards over the shorter list. The top spec - storage, screen size,
 * refresh rate - has to agree, while a listing that simply says less is fine.
 */
const specValuesAgree = (queryValues: string[], titleValues: string[]): boolean => {
  const sortedQuery = [...queryValues].sort(compareSpecValuesDescending);
  const sortedTitle = [...titleValues].sort(compareSpecValuesDescending);
  const comparable = Math.min(sortedQuery.length, sortedTitle.length);

  return sortedQuery.slice(0, comparable).every((value, index) => value === sortedTitle[index]);
};

/**
 * Whether a candidate lists a configuration compatible with the Skroutz title.
 *
 * Catalogue titles are regularly wordier or terser than Skroutz's, so a
 * candidate may omit a spec or list only some of its values. Only a candidate
 * that disagrees on an aligned value - a 24GB listing for a 48GB product, a
 * 512GB phone for a 256GB one - is a different configuration and must never
 * rank as a match.
 */
export const isVariantCompatible = (query: string, title: string): boolean => {
  const querySpecs = extractSpecValues(query);

  if (querySpecs.size === 0) {
    return true;
  }

  const titleSpecs = extractSpecValues(title);

  for (const [unit, queryValues] of querySpecs) {
    const titleValues = titleSpecs.get(unit);

    if (titleValues && !specValuesAgree(queryValues, titleValues)) {
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
