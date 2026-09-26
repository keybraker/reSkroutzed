import type { PriceComparisonProduct } from '../../common/types/PriceComparisonProduct.type';
import type {
  PriceBridgeRequest as BestPriceBridgeRequest,
  PriceBridgeSuccess as BestPriceBridgeSuccess,
} from '../common/priceBridge';
import { requestPriceBridge } from '../common/priceBridge';
import {
  buildSearchQueryVariants,
  compactWhitespace,
  getFirstFiniteNumber,
  scoreDealMatch,
} from '../common/priceMatching';
import { getCanonicalUrl, getCurrentProductQueries } from '../common/skroutzQuery';
import bestPriceCategoryMap from './bestprice-category-map';

const BEST_PRICE_BASE_URL = 'https://www.bestprice.gr';
const BEST_PRICE_REQUEST_TIMEOUT_MS = 5000;

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

export type BestPriceProductData = PriceComparisonProduct;

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

const extractItemPageShippingCost = (parsedDocument: Document): number | undefined => {
  const bestOfferCard =
    parsedDocument.querySelector('.prices__product[data-is-bestprice]') ??
    parsedDocument.querySelector('.prices__product');

  return parseShippingCost(
    bestOfferCard?.getAttribute('data-shipping-cost') ??
      bestOfferCard?.querySelector('.prices__cost-value')?.textContent,
  );
};

const parseItemPageShippingCost = (html: string): number | undefined =>
  extractItemPageShippingCost(new DOMParser().parseFromString(html, 'text/html'));

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
    const queries = await getCurrentProductQueries();
    const query = queries[0];
    if (!query || queries.length === 0) {
      return undefined;
    }

    try {
      const productPayload = await this.fetchProductPayload(
        window.location.href,
        getCanonicalUrl(),
      );
      const productData = this.parseProductPayload(productPayload, query);
      if (productData) {
        return await this.withShippingCost(productData);
      }
    } catch (error) {
      console.warn('[reSkroutzed] BestPrice direct lookup failed', error);
      // Fall back to BestPrice search when the direct product lookup is unavailable.
    }

    const searchQueries = queries.flatMap((candidate) => buildSearchQueryVariants(candidate));

    for (const searchQuery of new Set(searchQueries)) {
      try {
        const searchResponse = await this.fetchSearchResponse(searchQuery);
        const searchData = this.parseSearchHtml(searchResponse.data, query, searchResponse.url);
        if (searchData) {
          return await this.withShippingCost(searchData);
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
      const dealsData = parseBestPriceDealsPayload(payload, query);

      return dealsData ? await this.withShippingCost(dealsData) : undefined;
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

  /**
   * BestPrice only exposes a shipping cost on the item page (the listing cards
   * and the lookup/deals payloads carry a price alone). When a resolution path
   * returns no shipping cost, read it from the resolved item page so the total
   * price stays comparable with the Buy through Skroutz total.
   */
  private static async withShippingCost(
    productData: BestPriceProductData,
  ): Promise<BestPriceProductData> {
    if (productData.shippingCost !== undefined || !productData.url.includes('/item/')) {
      return productData;
    }

    try {
      const itemPage = await this.fetchItemPage(productData.url);
      const shippingCost = parseItemPageShippingCost(itemPage);

      if (shippingCost === undefined) {
        return productData;
      }

      return {
        ...productData,
        shippingCost,
        totalPrice: productData.price + shippingCost,
      };
    } catch (error) {
      console.warn('[reSkroutzed] BestPrice shipping cost lookup failed', error);
      return productData;
    }
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
    const shippingCost = extractItemPageShippingCost(parsedDocument);
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

  private static async requestBestPrice<T>(
    request: BestPriceBridgeRequest,
  ): Promise<BestPriceBridgeSuccess<T>> {
    return await requestPriceBridge<T>(request, 'BestPrice', BEST_PRICE_REQUEST_TIMEOUT_MS);
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

  private static async fetchItemPage(url: string): Promise<string> {
    const response = await this.requestBestPrice<string>({
      action: 'bestprice.fetch',
      url,
      method: 'GET',
      responseType: 'text',
    });

    return response.data;
  }
}
