import { SkroutzClient } from '../skroutz/client';
import { compactWhitespace } from './priceMatching';

/**
 * Derive the search queries that identify the product currently open on
 * Skroutz, so provider clients can look it up in their own catalogues.
 */

export const getCanonicalUrl = (): string =>
  document.querySelector('link[rel="canonical"]')?.getAttribute('href')?.trim() ?? '';

export const getCurrentProductQuery = (): string | undefined => {
  const productName = compactWhitespace(
    document.querySelector('h1')?.textContent ??
      document.querySelector('meta[property="og:title"]')?.getAttribute('content') ??
      document.title,
  )
    .replace(/\s*\|\s*Skroutz.*$/i, '')
    .trim();

  return productName || undefined;
};

export const getCurrentProductSlugQuery = (): string | undefined => {
  const canonicalUrl = getCanonicalUrl() || window.location.pathname;
  const slugMatch = canonicalUrl.match(/\/s\/\d+\/([^/?#]+?)(?:\.html)?(?:[?#].*)?$/i);
  if (!slugMatch?.[1]) {
    return undefined;
  }

  return compactWhitespace(decodeURIComponent(slugMatch[1]).replace(/[-_]+/g, ' '));
};

export const getCurrentProductQueries = async (): Promise<string[]> => {
  const queries = new Set<string>();
  const addQuery = (value?: string): void => {
    const candidate = compactWhitespace(value)
      .replace(/\s*\|\s*Skroutz.*$/i, '')
      .trim();
    if (candidate && candidate.length >= 4 && !/^skroutz(?:\.gr)?$/i.test(candidate)) {
      queries.add(candidate);
    }
  };

  addQuery(getCurrentProductQuery());
  addQuery(getCurrentProductSlugQuery());

  const skroutzProductNames = await SkroutzClient.getCurrentProductNames();
  skroutzProductNames.forEach((name) => addQuery(name));

  return [...queries];
};
