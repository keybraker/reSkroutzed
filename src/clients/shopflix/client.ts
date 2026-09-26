import type { PriceComparisonProduct } from '../../common/types/PriceComparisonProduct.type';
import type { PriceBridgeRequest, PriceBridgeSuccess } from '../common/priceBridge';
import { requestPriceBridge } from '../common/priceBridge';
import {
  buildSearchQueryVariants,
  compactWhitespace,
  scoreDealMatch,
} from '../common/priceMatching';
import { getCurrentProductQueries } from '../common/skroutzQuery';

const SHOPFLIX_BASE_URL = 'https://shopflix.gr';
const SHOPFLIX_REQUEST_TIMEOUT_MS = 5000;
const SHOPFLIX_SEARCH_HITS_PER_PAGE = 20;
const SHOPFLIX_SUPPORTED_HOSTNAME = 'www.skroutz.gr';

/**
 * Shopflix's storefront searches Algolia straight from the browser using this
 * public, client-embedded search key. Credentials travel in the query string so
 * the lookup stays a plain GET that fits the shared request bridge.
 */
const SHOPFLIX_ALGOLIA_APP_ID = '0K6ZPOM9CU';
const SHOPFLIX_ALGOLIA_API_KEY = '2e9079b59c67a25313192db65c9463fa';
const SHOPFLIX_ALGOLIA_INDEX = 'prod_GR_spryker';
const SHOPFLIX_ALGOLIA_LOCALE_FILTER = 'locale:el_GR';
const SHOPFLIX_ALGOLIA_HOST = `https://${SHOPFLIX_ALGOLIA_APP_ID.toLowerCase()}-dsn.algolia.net`;

type ShopflixAlgoliaRecord = {
  name?: string;
  sku?: string;
  slug?: string;
  price?: number | string;
  vendorIds?: string[];
  [key: string]: unknown;
};

type ShopflixAlgoliaHit = {
  'search-result-data'?: ShopflixAlgoliaRecord;
  'string-facet'?: Array<{ 'facet-map'?: { categoryLinks?: string[] } }>;
};

export type ShopflixSearchPayload = {
  hits?: ShopflixAlgoliaHit[];
};

const parseShopflixPrice = (value?: number | string): number | undefined => {
  const numericValue = typeof value === 'number' ? value : Number(value);

  return Number.isFinite(numericValue) && numericValue > 0 ? numericValue : undefined;
};

const buildShopflixUrl = (record?: ShopflixAlgoliaRecord): string | undefined => {
  const sku = compactWhitespace(record?.sku);
  const slug = compactWhitespace(record?.slug);

  if (!sku || !slug) {
    return undefined;
  }

  return `${SHOPFLIX_BASE_URL}/p/${sku}/${slug}`;
};

/**
 * Shopflix indexes every merchant offer as `vendorIds.N` / `vendorOfferPrices.MERx`
 * style attributes, so the merchant count has to be counted from the record keys.
 */
const countVendors = (record: ShopflixAlgoliaRecord): number | undefined => {
  if (Array.isArray(record.vendorIds)) {
    return record.vendorIds.length || undefined;
  }

  const vendorCount = Object.keys(record).filter((key) => key.startsWith('vendorIds.')).length;

  return vendorCount || undefined;
};

const parseCategoryId = (hit: ShopflixAlgoliaHit): number | undefined => {
  const categoryLink = hit['string-facet']?.[0]?.['facet-map']?.categoryLinks?.[0];
  const match = categoryLink?.match(/\/c\/(\d+)\//);

  if (!match?.[1]) {
    return undefined;
  }

  const categoryId = Number(match[1]);

  return Number.isFinite(categoryId) ? categoryId : undefined;
};

/**
 * Pick the best matching product out of an Algolia search response, mirroring
 * the scoring the BestPrice client uses for its own catalogue.
 */
export function parseShopflixHits(
  payload: ShopflixSearchPayload,
  query: string,
): PriceComparisonProduct | undefined {
  const bestHit = (payload.hits ?? [])
    .map((hit) => {
      const record = hit['search-result-data'];
      const price = parseShopflixPrice(record?.price);
      const title = compactWhitespace(record?.name);
      const url = buildShopflixUrl(record);

      if (price === undefined || !title || !url || !record) {
        return undefined;
      }

      const candidate: PriceComparisonProduct = {
        title,
        price,
        url,
        merchantCount: countVendors(record),
        categoryId: parseCategoryId(hit),
      };

      return {
        ...candidate,
        score: scoreDealMatch(candidate, query),
      };
    })
    .filter((candidate): candidate is PriceComparisonProduct & { score: number } => !!candidate)
    .filter((candidate) => Number.isFinite(candidate.score))
    .sort((left, right) => right.score - left.score)[0];

  if (bestHit && bestHit.score > 0) {
    return {
      title: bestHit.title,
      price: bestHit.price,
      url: bestHit.url,
      merchantCount: bestHit.merchantCount,
      categoryId: bestHit.categoryId,
    };
  }

  return undefined;
}

export class ShopflixClient {
  /**
   * Shopflix only serves the Greek market, so the comparison is only meaningful
   * on skroutz.gr (not on the Romanian, Cypriot, German or Bulgarian sites).
   */
  public static isSupported(): boolean {
    return window.location.hostname === SHOPFLIX_SUPPORTED_HOSTNAME;
  }

  public static async getCurrentProductData(): Promise<PriceComparisonProduct | undefined> {
    if (!this.isSupported()) {
      return undefined;
    }

    const queries = await getCurrentProductQueries();
    const query = queries[0];

    if (!query) {
      return undefined;
    }

    const searchQueries = [
      ...new Set(queries.flatMap((candidate) => buildSearchQueryVariants(candidate))),
    ];

    for (const searchQuery of searchQueries) {
      try {
        const payload = await this.fetchSearchResults(searchQuery);
        const productData = parseShopflixHits(payload, query);

        if (productData) {
          return productData;
        }
      } catch (error) {
        console.warn('[reSkroutzed] Shopflix search failed', { query: searchQuery, error });
      }
    }

    return undefined;
  }

  private static async requestShopflix<T>(
    request: PriceBridgeRequest,
  ): Promise<PriceBridgeSuccess<T>> {
    return await requestPriceBridge<T>(request, 'Shopflix', SHOPFLIX_REQUEST_TIMEOUT_MS);
  }

  private static async fetchSearchResults(query: string): Promise<ShopflixSearchPayload> {
    const searchUrl = new URL(`/1/indexes/${SHOPFLIX_ALGOLIA_INDEX}`, `${SHOPFLIX_ALGOLIA_HOST}/`);
    searchUrl.searchParams.set('query', query);
    searchUrl.searchParams.set('hitsPerPage', String(SHOPFLIX_SEARCH_HITS_PER_PAGE));
    searchUrl.searchParams.set('filters', SHOPFLIX_ALGOLIA_LOCALE_FILTER);
    searchUrl.searchParams.set('x-algolia-application-id', SHOPFLIX_ALGOLIA_APP_ID);
    searchUrl.searchParams.set('x-algolia-api-key', SHOPFLIX_ALGOLIA_API_KEY);

    const response = await this.requestShopflix<ShopflixSearchPayload>({
      action: 'shopflix.fetch',
      url: searchUrl.toString(),
      method: 'GET',
      responseType: 'json',
    });

    return response.data;
  }
}
