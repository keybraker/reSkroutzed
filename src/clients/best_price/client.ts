import { SkroutzClient } from '../skroutz/client';
import bestPriceCategoryMap from './bestprice-category-map';
import type {
  BestPriceBridgeRequest,
  BestPriceBridgeResponse,
  BestPriceBridgeSuccess,
} from './messages';

const BEST_PRICE_BASE_URL = 'https://www.bestprice.gr';
const BEST_PRICE_REQUEST_TIMEOUT_MS = 5000;

const BEST_PRICE_COLOR_HINTS = [
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

const ACCESSORY_HINTS = new Set([
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

type BestPriceDeal = {
  mp?: number;
  title?: string;
  path?: string;
  mc?: number;
  cid?: number;
};

export type BestPriceDealsPayload = {
  deals?: BestPriceDeal[];
};

export type BestPriceProductData = {
  title: string;
  price: number;
  url: string;
  merchantCount?: number;
  categoryId?: number;
  shippingCost?: number;
  totalPrice?: number;
};

type BestPriceScoredProductData = BestPriceProductData & {
  score: number;
};

type BestPriceProductLookupEntity = {
  title?: string;
  path?: string;
  link?: string;
  minPrice?: number;
  min_price?: number;
  price?: number;
  merchantCount?: number;
  mc?: number;
  cid?: number;
  cId?: number;
};

type BestPriceProductLookupPayload = {
  product?: BestPriceProductLookupEntity;
  cluster?: BestPriceProductLookupEntity;
  products?: BestPriceProductLookupEntity[];
};

type BestPriceRuntimeBridge = {
  lastError?: { message: string };
  sendMessage: (
    request: BestPriceBridgeRequest,
    callback: (response?: BestPriceBridgeResponse<unknown>) => void,
  ) => void;
};

const normalizeText = (value: string): string =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9\u0370-\u03ff]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const tokenize = (value: string): string[] =>
  normalizeText(value)
    .split(' ')
    .filter((token) => token.length > 1);

const compactWhitespace = (value?: string | null): string =>
  (value ?? '').replace(/\s+/g, ' ').trim();

const getFirstFiniteNumber = (
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

const parseBestPricePrice = (value?: string | number | null): number | undefined => {
  if (typeof value === 'number') {
    return Number.isFinite(value) && value > 0 ? value : undefined;
  }

  const normalizedValue = compactWhitespace(value).replace(/[^\d.,-]/g, '');
  if (!normalizedValue) {
    return undefined;
  }

  if (normalizedValue.includes(',') && normalizedValue.includes('.')) {
    return getFirstFiniteNumber(normalizedValue.replace(/\./g, '').replace(',', '.'));
  }

  if (normalizedValue.includes(',')) {
    return getFirstFiniteNumber(normalizedValue.replace(',', '.'));
  }

  return getFirstFiniteNumber(normalizedValue);
};

const parseMerchantCount = (value?: string | number | null): number | undefined => {
  if (typeof value === 'number') {
    return Number.isFinite(value) && value > 0 ? value : undefined;
  }

  const match = compactWhitespace(value).match(/(\d+)/);
  return match?.[1] ? getFirstFiniteNumber(match[1]) : undefined;
};

const parseShippingCost = (value?: string | number | null): number | undefined => {
  if (value === undefined || value === null) {
    return undefined;
  }

  if (typeof value === 'number') {
    return Number.isFinite(value) && value >= 0 ? value : undefined;
  }

  const textValue = compactWhitespace(String(value));
  if (!textValue) {
    return undefined;
  }

  const normalizedValue = textValue.replace(/[^\d.,-]/g, '');
  if (!normalizedValue) {
    return undefined;
  }

  if (normalizedValue.includes(',') && normalizedValue.includes('.')) {
    const parsedCost = Number(normalizedValue.replace(/\./g, '').replace(',', '.'));
    return Number.isFinite(parsedCost) && parsedCost >= 0 ? parsedCost : undefined;
  }

  if (normalizedValue.includes(',')) {
    const parsedCost = Number(normalizedValue.replace(',', '.'));
    return Number.isFinite(parsedCost) && parsedCost >= 0 ? parsedCost : undefined;
  }

  const parsedCost = Number(normalizedValue);
  return Number.isFinite(parsedCost) && parsedCost >= 0 ? parsedCost / 100 : undefined;
};

const parseBestPriceCents = (value?: string | number | null): number | undefined => {
  if (value === undefined || value === null) {
    return undefined;
  }

  const textValue = compactWhitespace(String(value));
  if (!textValue) {
    return undefined;
  }

  const parsedValue = parseBestPricePrice(textValue);
  if (parsedValue === undefined) {
    return undefined;
  }

  return /[.,]/.test(textValue) ? parsedValue : parsedValue / 100;
};

const sanitizeBestPriceTitle = (value?: string | null): string =>
  compactWhitespace(value)
    .replace(/\s*\|\s*BestPrice.*$/i, '')
    .replace(/\s*-\s*Τιμές.*$/i, '')
    .replace(/\s*-\s*Χαρακτηριστικά.*$/i, '')
    .trim();

const normalizeBestPriceUrl = (value?: string): string | undefined => {
  if (!value) {
    return undefined;
  }

  if (value.startsWith('http://') || value.startsWith('https://')) {
    return value;
  }

  if (value.startsWith('/')) {
    return `${BEST_PRICE_BASE_URL}${value}`;
  }

  return `${BEST_PRICE_BASE_URL}/item/${value.replace(/^\/+/, '')}.html`;
};

const buildBestPriceSearchQueries = (query: string): string[] => {
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
        `\\b(?:${BEST_PRICE_COLOR_HINTS.map((hint) => hint.replace(/\s+/g, '\\s+')).join('|')})\\b`,
        'gi',
      ),
      ' ',
    ),
  );
  addVariant(query.replace(/[/_-]+/g, ' '));

  return [...variants];
};

const scoreDealMatch = (deal: BestPriceProductData, query: string): number => {
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

export function parseBestPriceDealsPayload(
  payload: BestPriceDealsPayload,
  query: string,
): BestPriceProductData | undefined {
  const bestDeal = (payload.deals ?? [])
    .filter((deal) => Number.isFinite(deal.mp) && typeof deal.title === 'string' && !!deal.path)
    .map((deal) => {
      const candidate: BestPriceProductData = {
        title: compactWhitespace(deal.title),
        price: Number(deal.mp) / 100,
        url: `${BEST_PRICE_BASE_URL}/item/${deal.path}.html`,
        merchantCount: deal.mc,
        categoryId: deal.cid,
      };

      return {
        ...candidate,
        score: scoreDealMatch(candidate, query),
      };
    })
    .filter((deal) => Number.isFinite(deal.score))
    .sort((left, right) => right.score - left.score)[0];

  if (bestDeal && bestDeal.score > 0) {
    return {
      title: bestDeal.title,
      price: bestDeal.price,
      url: bestDeal.url,
      merchantCount: bestDeal.merchantCount,
      categoryId: bestDeal.categoryId,
    };
  }

  return undefined;
}

export class BestPriceClient {
  public static async getCurrentProductData(): Promise<BestPriceProductData | undefined> {
    const queries = await this.getCurrentProductQueries();
    const query = queries[0];
    if (!query || queries.length === 0) {
      return undefined;
    }

    try {
      const productPayload = await this.fetchProductPayload(
        window.location.href,
        this.getCanonicalUrl(),
      );
      const productData = this.parseProductPayload(productPayload, query);
      if (productData) {
        return productData;
      }
    } catch (error) {
      console.warn('[reSkroutzed] BestPrice direct lookup failed', error);
      // Fall back to BestPrice search when the direct product lookup is unavailable.
    }

    const searchQueries = queries.flatMap((candidate) => buildBestPriceSearchQueries(candidate));

    for (const searchQuery of new Set(searchQueries)) {
      try {
        const searchResponse = await this.fetchSearchResponse(searchQuery);
        const searchData = this.parseSearchHtml(searchResponse.data, query, searchResponse.url);
        if (searchData) {
          return searchData;
        }
      } catch (error) {
        console.warn('[reSkroutzed] BestPrice search fallback failed', {
          query: searchQuery,
          error,
        });
        // Continue to the next fallback when search is unavailable.
      }
    }

    const skroutzCategoryId = this.getCurrentSkroutzCategoryId();
    if (skroutzCategoryId === undefined) {
      return undefined;
    }

    const bestPriceCategoryId = this.getMappedCategoryId(skroutzCategoryId);

    try {
      const payload = await this.fetchDealsPayload(bestPriceCategoryId);
      return parseBestPriceDealsPayload(payload, query);
    } catch (error) {
      console.warn('[reSkroutzed] BestPrice category fallback failed', {
        skroutzCategoryId,
        bestPriceCategoryId,
        error,
      });
      return undefined;
    }
  }

  private static getMappedCategoryId(categoryId: number): number {
    return bestPriceCategoryMap[String(categoryId)] ?? categoryId;
  }

  private static getCanonicalUrl(): string {
    return document.querySelector('link[rel="canonical"]')?.getAttribute('href')?.trim() ?? '';
  }

  private static async getCurrentProductQueries(): Promise<string[]> {
    const queries = new Set<string>();
    const addQuery = (value?: string): void => {
      const candidate = compactWhitespace(value)
        .replace(/\s*\|\s*Skroutz.*$/i, '')
        .trim();
      if (candidate && candidate.length >= 4 && !/^skroutz(?:\.gr)?$/i.test(candidate)) {
        queries.add(candidate);
      }
    };

    addQuery(this.getCurrentProductQuery());
    addQuery(this.getCurrentProductSlugQuery());

    const skroutzProductNames = await SkroutzClient.getCurrentProductNames();
    skroutzProductNames.forEach((name) => addQuery(name));

    return [...queries];
  }

  private static getCurrentProductSlugQuery(): string | undefined {
    const canonicalUrl = this.getCanonicalUrl() || window.location.pathname;
    const slugMatch = canonicalUrl.match(/\/s\/\d+\/([^/?#]+?)(?:\.html)?(?:[?#].*)?$/i);
    if (!slugMatch?.[1]) {
      return undefined;
    }

    return compactWhitespace(decodeURIComponent(slugMatch[1]).replace(/[-_]+/g, ' '));
  }

  private static parseProductPayload(
    payload: unknown,
    fallbackTitle: string,
  ): BestPriceProductData | undefined {
    if (!payload || typeof payload !== 'object') {
      return undefined;
    }

    const typedPayload = payload as BestPriceProductLookupPayload;

    const cluster = typedPayload.cluster ?? typedPayload.products?.[0];
    const product = typedPayload.product;
    const primary = cluster ?? product;

    const price = getFirstFiniteNumber(
      primary?.minPrice,
      primary?.min_price,
      primary?.price,
      product?.minPrice,
      product?.min_price,
      product?.price,
    );
    const url = normalizeBestPriceUrl(
      primary?.link ?? product?.link ?? primary?.path ?? product?.path,
    );

    if (!price || !url) {
      return undefined;
    }

    return {
      title: sanitizeBestPriceTitle(primary?.title ?? product?.title) || fallbackTitle,
      price,
      url,
      merchantCount: getFirstFiniteNumber(
        primary?.merchantCount,
        primary?.mc,
        product?.merchantCount,
        product?.mc,
      ),
      categoryId: getFirstFiniteNumber(primary?.cid, primary?.cId, product?.cid, product?.cId),
    };
  }

  private static parseSearchHtml(
    html: string,
    query: string,
    responseUrl?: string,
  ): BestPriceProductData | undefined {
    const parsedDocument = new DOMParser().parseFromString(html, 'text/html');

    return (
      this.parseSearchItemPage(parsedDocument, query, responseUrl) ??
      this.parseSearchResultsPage(parsedDocument, query)
    );
  }

  private static parseSearchItemPage(
    parsedDocument: Document,
    query: string,
    responseUrl?: string,
  ): BestPriceProductData | undefined {
    const bestOfferCard =
      parsedDocument.querySelector('.prices__product[data-is-bestprice]') ??
      parsedDocument.querySelector('.prices__product');
    const url = normalizeBestPriceUrl(
      parsedDocument.querySelector('link[rel="canonical"]')?.getAttribute('href') ??
        parsedDocument.querySelector('meta[property="og:url"]')?.getAttribute('content') ??
        responseUrl,
    );
    const pagePrice = parseBestPricePrice(
      parsedDocument.querySelector('meta[itemprop="lowPrice"]')?.getAttribute('content') ??
        parsedDocument
          .querySelector('meta[property="product:price:amount"]')
          ?.getAttribute('content'),
    );
    const offerPrice = parseBestPricePrice(
      bestOfferCard?.querySelector('.prices__price-wrapper a')?.textContent ??
        bestOfferCard?.querySelector('.prices__price a')?.textContent,
    );
    const offerPriceFromAttributes = parseBestPriceCents(bestOfferCard?.getAttribute('data-price'));
    const shippingCost = parseShippingCost(
      bestOfferCard?.getAttribute('data-shipping-cost') ??
        bestOfferCard?.querySelector('.prices__cost-value')?.textContent,
    );
    const price = offerPriceFromAttributes ?? offerPrice ?? pagePrice;

    if (!url || !price || !url.includes('/item/')) {
      return undefined;
    }

    const candidate: BestPriceProductData = {
      title:
        sanitizeBestPriceTitle(
          parsedDocument.querySelector('meta[property="og:title"]')?.getAttribute('content') ??
            parsedDocument.querySelector('h1')?.textContent,
        ) || query,
      price,
      shippingCost,
      totalPrice: shippingCost !== undefined ? price + shippingCost : price,
      url,
      merchantCount: parseMerchantCount(
        parsedDocument.querySelector('meta[itemprop="offerCount"]')?.getAttribute('content'),
      ),
    };

    return scoreDealMatch(candidate, query) > 0 ? candidate : undefined;
  }

  private static parseSearchResultsPage(
    parsedDocument: Document,
    query: string,
  ): BestPriceProductData | undefined {
    const bestCandidate = Array.from(parsedDocument.querySelectorAll('.p'))
      .map((card): BestPriceScoredProductData | undefined => {
        const itemLink = card.querySelector('.p__title a[href*="/item/"]');
        if (!itemLink) {
          return undefined;
        }

        const url = normalizeBestPriceUrl(itemLink.getAttribute('href') ?? '');
        const price = parseBestPricePrice(card.querySelector('.p__price--current')?.textContent);
        if (!url || !price) {
          return undefined;
        }

        const candidate: BestPriceProductData = {
          title:
            sanitizeBestPriceTitle(itemLink.getAttribute('title') ?? itemLink.textContent) || query,
          price,
          url,
          merchantCount: parseMerchantCount(card.querySelector('.p__merchants')?.textContent),
          categoryId: getFirstFiniteNumber(card.getAttribute('data-cid') ?? undefined),
        };

        return {
          ...candidate,
          score: scoreDealMatch(candidate, query),
        };
      })
      .filter((candidate): candidate is BestPriceScoredProductData => !!candidate)
      .sort((left, right) => right.score - left.score)[0];

    if (!bestCandidate || bestCandidate.score <= 0) {
      return undefined;
    }

    return {
      title: bestCandidate.title,
      price: bestCandidate.price,
      shippingCost: bestCandidate.shippingCost,
      totalPrice: bestCandidate.totalPrice,
      url: bestCandidate.url,
      merchantCount: bestCandidate.merchantCount,
      categoryId: bestCandidate.categoryId,
    };
  }

  private static getCurrentSkroutzCategoryId(): number | undefined {
    const extractCategoryIdFromHref = (href: string): number | undefined => {
      const match = href.match(/\/c\/(\d+)\//i);
      if (!match?.[1]) {
        return undefined;
      }

      const categoryId = Number(match[1]);
      return Number.isFinite(categoryId) ? categoryId : undefined;
    };

    const getLastCategoryId = (hrefs: string[]): number | undefined => {
      let categoryId: number | undefined;

      for (const href of hrefs) {
        const candidate = extractCategoryIdFromHref(href);
        if (candidate !== undefined) {
          categoryId = candidate;
        }
      }

      return categoryId;
    };

    const extractCategoryIdFromContainer = (container: ParentNode): number | undefined => {
      const hrefs = Array.from(container.querySelectorAll('a[href*="/c/"]')).map(
        (link) => link.getAttribute('href') ?? '',
      );

      return getLastCategoryId(hrefs);
    };

    const categoryAroundHeading = (() => {
      const heading = document.querySelector('h1');
      if (!heading) {
        return undefined;
      }

      const breadcrumbSelectors = [
        '[aria-label*="breadcrumb" i]',
        '[data-testid*="breadcrumb" i]',
        'nav',
        'ol',
        'ul',
      ];

      let current: Element | null = heading;
      for (let depth = 0; depth < 6 && current; depth += 1) {
        for (const selector of breadcrumbSelectors) {
          for (const element of current.querySelectorAll(selector)) {
            const categoryId = extractCategoryIdFromContainer(element);
            if (categoryId !== undefined) {
              return categoryId;
            }
          }
        }

        const categoryId = extractCategoryIdFromContainer(current);
        if (categoryId !== undefined) {
          return categoryId;
        }

        current = current.parentElement;
      }

      return undefined;
    })();

    if (categoryAroundHeading !== undefined) {
      return categoryAroundHeading;
    }

    const breadcrumbSelectors = [
      '[aria-label*="breadcrumb" i]',
      'nav.breadcrumb',
      'nav.breadcrumbs',
      'ol.breadcrumb',
      'ol.breadcrumbs',
      'ul.breadcrumb',
      'ul.breadcrumbs',
    ];

    for (const selector of breadcrumbSelectors) {
      for (const element of document.querySelectorAll(selector)) {
        const categoryId = extractCategoryIdFromContainer(element);
        if (categoryId !== undefined) {
          return categoryId;
        }
      }
    }

    for (const script of document.querySelectorAll('script[type="application/ld+json"]')) {
      try {
        const parsed = JSON.parse(script.textContent ?? '');
        const entries = Array.isArray(parsed) ? parsed : [parsed];

        for (const entry of entries) {
          if (entry?.['@type'] !== 'BreadcrumbList') {
            continue;
          }

          const hrefs: string[] = [];
          for (const breadcrumbItem of entry.itemListElement ?? []) {
            const rawItem = breadcrumbItem?.item;
            const href =
              typeof rawItem === 'string'
                ? rawItem
                : typeof rawItem?.['@id'] === 'string'
                  ? rawItem['@id']
                  : typeof breadcrumbItem?.['@id'] === 'string'
                    ? breadcrumbItem['@id']
                    : '';

            hrefs.push(href);
          }

          const categoryId = getLastCategoryId(hrefs);
          if (categoryId !== undefined) {
            return categoryId;
          }
        }
      } catch {
        // Ignore malformed structured data.
      }
    }

    const navigationElements = Array.from(
      document.querySelectorAll('nav, ol, ul, [role="navigation"]'),
    );

    for (const element of navigationElements) {
      const categoryId = extractCategoryIdFromContainer(element);
      if (categoryId !== undefined) {
        return categoryId;
      }
    }

    const hrefs = Array.from(document.querySelectorAll('a[href*="/c/"]')).map(
      (link) => link.getAttribute('href') ?? '',
    );

    return getLastCategoryId(hrefs);
  }

  private static getCurrentProductQuery(): string | undefined {
    const productName = compactWhitespace(
      document.querySelector('h1')?.textContent ??
        document.querySelector('meta[property="og:title"]')?.getAttribute('content') ??
        document.title,
    )
      .replace(/\s*\|\s*Skroutz.*$/i, '')
      .trim();

    return productName || undefined;
  }

  private static async requestBestPrice<T>(
    request: BestPriceBridgeRequest,
  ): Promise<BestPriceBridgeSuccess<T>> {
    const runtime = (
      globalThis as typeof globalThis & { chrome?: { runtime?: BestPriceRuntimeBridge } }
    ).chrome?.runtime;
    if (!runtime?.sendMessage) {
      throw new Error('BestPrice background bridge is unavailable');
    }

    return await new Promise<BestPriceBridgeSuccess<T>>((resolve, reject) => {
      const timeout = window.setTimeout(() => {
        reject(new Error(`BestPrice request timed out after ${BEST_PRICE_REQUEST_TIMEOUT_MS}ms`));
      }, BEST_PRICE_REQUEST_TIMEOUT_MS);

      runtime.sendMessage(request, (response?: BestPriceBridgeResponse<unknown>) => {
        window.clearTimeout(timeout);

        if (runtime.lastError) {
          reject(new Error(runtime.lastError.message));
          return;
        }

        if (!response) {
          reject(new Error('BestPrice background returned no response'));
          return;
        }

        const typedResponse = response as BestPriceBridgeResponse<T>;

        if (!typedResponse.ok) {
          reject(new Error(typedResponse.error));
          return;
        }

        resolve(typedResponse);
      });
    });
  }

  private static async fetchDealsPayload(categoryId: number): Promise<BestPriceDealsPayload> {
    const response = await this.requestBestPrice<BestPriceDealsPayload>({
      action: 'bestprice.fetch',
      url: `${BEST_PRICE_BASE_URL}/api/getDeals`,
      method: 'POST',
      responseType: 'json',
      formData: {
        cids: `[${categoryId}]`,
        bp: 'true',
        pcFrom: '1',
        origin: window.location.origin,
      },
    });

    return response.data;
  }

  private static async fetchProductPayload(uri: string, canonical: string): Promise<unknown> {
    const response = await this.requestBestPrice<unknown>({
      action: 'bestprice.fetch',
      url: `${BEST_PRICE_BASE_URL}/api/getProduct`,
      method: 'POST',
      responseType: 'json',
      formData: {
        uri,
        canonical,
        verbose: 'true',
        bp: 'true',
      },
    });

    return response.data;
  }

  private static async fetchSearchResponse(query: string): Promise<BestPriceBridgeSuccess<string>> {
    const searchUrl = new URL('/search', BEST_PRICE_BASE_URL);
    searchUrl.searchParams.set('q', query);

    return await this.requestBestPrice<string>({
      action: 'bestprice.fetch',
      url: searchUrl.toString(),
      method: 'GET',
      responseType: 'text',
    });
  }
}
