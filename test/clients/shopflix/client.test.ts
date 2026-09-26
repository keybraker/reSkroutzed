import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  ShopflixClient,
  ShopflixSearchPayload,
  parseShopflixHits,
} from '../../../src/clients/shopflix/client';
import { SkroutzClient } from '../../../src/clients/skroutz/client';

type BridgeResponse = {
  ok: true;
  status: number;
  url: string;
  data: unknown;
};

type BridgeRequest = {
  action: string;
  url: string;
  method?: string;
  responseType: string;
};

type ChromeRuntimeMock = {
  lastError?: { message: string };
  sendMessage: (request: BridgeRequest, callback: (response: BridgeResponse) => void) => void;
};

type ChromeGlobal = {
  chrome?: {
    runtime?: ChromeRuntimeMock;
  };
};

const buildHit = (
  record: Record<string, unknown>,
  facets?: Array<{ 'facet-map'?: { categoryLinks?: string[] } }>,
): { 'search-result-data': Record<string, unknown>; 'string-facet'?: typeof facets } => ({
  'search-result-data': record,
  'string-facet': facets,
});

const buildSearchPayload = (hits: unknown[]): ShopflixSearchPayload =>
  ({ hits }) as ShopflixSearchPayload;

describe('ShopflixClient', () => {
  const originalConsoleWarn = console.warn;
  const chromeGlobal = globalThis as unknown as ChromeGlobal;
  const requests: BridgeRequest[] = [];

  const setHostname = (hostname: string): void => {
    Object.defineProperty(window, 'location', {
      value: {
        hostname,
        pathname: '/',
        href: `https://${hostname}/`,
        origin: `https://${hostname}`,
      },
      writable: true,
      configurable: true,
    });
  };

  const setBridgeResponses = (...responses: BridgeResponse[]): void => {
    chromeGlobal.chrome = {
      runtime: {
        lastError: undefined,
        sendMessage: vi.fn(
          (request: BridgeRequest, callback: (response: BridgeResponse) => void) => {
            requests.push(request);
            const response = responses.shift();
            if (!response) {
              throw new Error('No mocked Shopflix bridge response available');
            }

            callback(response);
          },
        ) as ChromeRuntimeMock['sendMessage'],
      },
    };
  };

  beforeEach(() => {
    vi.restoreAllMocks();
    requests.length = 0;
    console.warn = vi.fn();
    document.body.innerHTML = '';
    document.title = 'Apple iPhone 18 Pro 12GB 256GB Black | Skroutz.gr';
    setHostname('www.skroutz.gr');
    vi.spyOn(SkroutzClient, 'getCurrentProductNames').mockResolvedValue([]);
    chromeGlobal.chrome = {
      runtime: {
        lastError: undefined,
        sendMessage: vi.fn() as ChromeRuntimeMock['sendMessage'],
      },
    };
  });

  afterEach(() => {
    document.body.innerHTML = '';
    console.warn = originalConsoleWarn;
  });

  describe('parseShopflixHits', () => {
    it('prefers the matching product over a loosely related one', () => {
      const payload = buildSearchPayload([
        buildHit({
          name: 'Apple iPhone Air 5G 12GB 256GB Θήκη',
          sku: 'SF-1',
          slug: 'thiki',
          price: 15,
        }),
        buildHit({
          name: 'Apple iPhone 18 Pro 12GB 256GB Black',
          sku: 'SF-202747804',
          slug: 'apple-iphone-18-pro-12gb-256gb-black',
          price: 1499,
        }),
      ]);

      const result = parseShopflixHits(payload, 'Apple iPhone 18 Pro 12GB 256GB Black');

      expect(result?.title).toBe('Apple iPhone 18 Pro 12GB 256GB Black');
      expect(result?.url).toBe(
        'https://shopflix.gr/p/SF-202747804/apple-iphone-18-pro-12gb-256gb-black',
      );
      expect(result?.price).toBe(1499);
    });

    it('reads the merchant count and category id from the Algolia record', () => {
      const payload = buildSearchPayload([
        buildHit(
          {
            name: 'Ninja Air Fryer 10.4lt Μαύρο AF500EU',
            sku: 'SF-18938249',
            slug: 'ninja-air-fryer-10-4lt-mauro-af500eu',
            price: '178',
            vendorIds: ['MER1', 'MER2', 'MER3'],
          },
          [{ 'facet-map': { categoryLinks: ['Φριτέζες*:::*/c/2246/fritezes'] } }],
        ),
      ]);

      const result = parseShopflixHits(payload, 'Ninja Air Fryer 10.4lt Μαύρο AF500EU');

      expect(result?.merchantCount).toBe(3);
      expect(result?.categoryId).toBe(2246);
    });

    it('ignores hits without a usable price or product url', () => {
      const payload = buildSearchPayload([
        buildHit({ name: 'Philips OneBlade Pro 360', sku: 'SF-103964576' }),
        buildHit({ name: 'Philips OneBlade Pro 360', slug: 'philips-oneblade-pro-360' }),
      ]);

      expect(parseShopflixHits(payload, 'Philips OneBlade Pro 360')).toBeUndefined();
    });

    it('returns undefined when no hit shares enough tokens with the query', () => {
      const payload = buildSearchPayload([
        buildHit({
          name: 'Bosch Πλυντήριο Ρούχων',
          sku: 'SF-5',
          slug: 'bosch',
          price: 499,
        }),
      ]);

      expect(parseShopflixHits(payload, 'Apple iPhone 18 Pro 12GB 256GB Black')).toBeUndefined();
    });
  });

  describe('getCurrentProductData', () => {
    it('searches the Shopflix Algolia index through the bridge', async () => {
      setBridgeResponses({
        ok: true,
        status: 200,
        url: 'https://algolia',
        data: buildSearchPayload([
          buildHit({
            name: 'Apple iPhone 18 Pro 12GB 256GB Black',
            sku: 'SF-202747804',
            slug: 'apple-iphone-18-pro-12gb-256gb-black',
            price: 1499,
          }),
        ]),
      });

      const result = await ShopflixClient.getCurrentProductData();

      expect(result?.price).toBe(1499);
      expect(result?.shippingCost).toBeUndefined();
      expect(result?.totalPrice).toBeUndefined();
      expect(requests).toHaveLength(1);
      expect(requests[0].action).toBe('shopflix.fetch');
      expect(requests[0].method).toBe('GET');
      expect(requests[0].responseType).toBe('json');

      const searchUrl = new URL(requests[0].url);
      expect(searchUrl.hostname).toBe('0k6zpom9cu-dsn.algolia.net');
      expect(searchUrl.pathname).toBe('/1/indexes/prod_GR_spryker');
      expect(searchUrl.searchParams.get('query')).toBe('Apple iPhone 18 Pro 12GB 256GB Black');
      expect(searchUrl.searchParams.get('filters')).toBe('locale:el_GR');
      expect(searchUrl.searchParams.get('x-algolia-application-id')).toBe('0K6ZPOM9CU');
    });

    it('does not search when the page is not the Greek Skroutz site', async () => {
      setHostname('www.skroutz.ro');
      setBridgeResponses();

      await expect(ShopflixClient.getCurrentProductData()).resolves.toBeUndefined();

      expect(requests).toHaveLength(0);
    });

    it('falls back to a shorter query when the full title has no usable hit', async () => {
      setBridgeResponses(
        { ok: true, status: 200, url: 'https://algolia', data: buildSearchPayload([]) },
        {
          ok: true,
          status: 200,
          url: 'https://algolia',
          data: buildSearchPayload([
            buildHit({
              name: 'Apple iPhone 18 Pro 12GB 256GB',
              sku: 'SF-202747804',
              slug: 'apple-iphone-18-pro',
              price: 1499,
            }),
          ]),
        },
      );

      const result = await ShopflixClient.getCurrentProductData();

      expect(result?.url).toBe('https://shopflix.gr/p/SF-202747804/apple-iphone-18-pro');
      expect(requests).toHaveLength(2);
      expect(new URL(requests[0].url).searchParams.get('query')).toBe(
        'Apple iPhone 18 Pro 12GB 256GB Black',
      );
      expect(new URL(requests[1].url).searchParams.get('query')).not.toBe(
        'Apple iPhone 18 Pro 12GB 256GB Black',
      );
    });

    it('returns undefined and keeps going when a search request fails', async () => {
      chromeGlobal.chrome = {
        runtime: {
          lastError: undefined,
          sendMessage: vi.fn(
            (request: BridgeRequest, callback: (response: BridgeResponse) => void) => {
              requests.push(request);
              callback({ ok: false, error: 'Shopflix request failed with HTTP 500' } as never);
            },
          ) as ChromeRuntimeMock['sendMessage'],
        },
      };

      await expect(ShopflixClient.getCurrentProductData()).resolves.toBeUndefined();

      expect(requests.length).toBeGreaterThan(0);
      expect(console.warn).toHaveBeenCalled();
    });
  });
});
