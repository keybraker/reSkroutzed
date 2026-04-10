import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  BestPriceClient,
  BestPriceDealsPayload,
  parseBestPriceDealsPayload,
} from '../../../src/clients/best_price/client';
import { SkroutzClient } from '../../../src/clients/skroutz/client';

type BridgeResponse = {
  ok: true;
  status: number;
  url: string;
  data: unknown;
};

type ChromeRuntimeMock = {
  lastError?: { message: string };
  sendMessage: (request: unknown, callback: (response: BridgeResponse) => void) => void;
};

type ChromeGlobal = {
  chrome?: {
    runtime?: ChromeRuntimeMock;
  };
};

describe('BestPriceClient', () => {
  const originalConsoleWarn = console.warn;
  const chromeGlobal = globalThis as unknown as ChromeGlobal;

  const getChromeRuntime = (): ChromeRuntimeMock =>
    chromeGlobal.chrome?.runtime ?? {
      lastError: undefined,
      sendMessage: vi.fn() as ChromeRuntimeMock['sendMessage'],
    };

  const setBridgeResponses = (...responses: BridgeResponse[]): void => {
    chromeGlobal.chrome = {
      runtime: {
        ...getChromeRuntime(),
        lastError: undefined,
        sendMessage: vi.fn((_request: unknown, callback: (response: BridgeResponse) => void) => {
          const response = responses.shift();
          if (!response) {
            throw new Error('No mocked BestPrice bridge response available');
          }

          callback(response);
        }) as ChromeRuntimeMock['sendMessage'],
      },
    };
  };

  const getSendMessageMock = (): ChromeRuntimeMock['sendMessage'] => getChromeRuntime().sendMessage;

  beforeEach(() => {
    vi.restoreAllMocks();
    console.warn = vi.fn();
    document.body.innerHTML = '';
    document.title = 'Apple iPhone 17 Pro Max 256GB | Skroutz.gr';
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

  describe('parseBestPriceDealsPayload', () => {
    it('prefers the real product over accessory matches', () => {
      const payload: BestPriceDealsPayload = {
        deals: [
          {
            title: 'Apple iPhone 17 Pro Max 256GB Θήκη TPU',
            path: 'accessories/iphone-case',
            mp: 1999,
            mc: 8,
            cid: 900,
          },
          {
            title: 'Apple iPhone 17 Pro Max 256GB',
            path: 'phones/apple-iphone-17-pro-max-256gb',
            mp: 148247,
            mc: 12,
            cid: 806,
          },
        ],
      };

      const result = parseBestPriceDealsPayload(payload, 'Apple iPhone 17 Pro Max 256GB');

      expect(result).toEqual({
        title: 'Apple iPhone 17 Pro Max 256GB',
        price: 1482.47,
        url: 'https://www.bestprice.gr/item/phones/apple-iphone-17-pro-max-256gb.html',
        merchantCount: 12,
        categoryId: 806,
      });
    });
  });

  describe('getCurrentProductData', () => {
    it('uses the direct product lookup endpoint when it resolves a product', async () => {
      document.body.innerHTML = [
        '<link rel="canonical" href="https://www.skroutz.gr/s/62596505/apple-iphone-17-pro-max-12-256gb-deep-blue.html">',
        '<nav aria-label="breadcrumb">',
        '<a href="/c/1/root.html">Root</a>',
        '<a href="/c/40/kinhta-thlefwna.html">Κινητά Τηλέφωνα</a>',
        '</nav>',
        '<h1>Apple iPhone 17 Pro Max (12/256GB) Deep Blue</h1>',
        '<meta property="og:title" content="Apple iPhone 17 Pro Max (12/256GB) Deep Blue | Skroutz.gr">',
      ].join('');

      setBridgeResponses({
        ok: true,
        status: 200,
        url: 'https://www.bestprice.gr/api/getProduct',
        data: {
          product: {
            path: 'kinhta-thlefwna/apple-iphone-17-pro-max-256gb-deep-blue',
            minPrice: 1482.45,
          },
          products: [
            {
              title: 'Apple iPhone 17 Pro Max (12/256GB) Deep Blue',
              path: 'kinhta-thlefwna/apple-iphone-17-pro-max-256gb-deep-blue',
              minPrice: 1482.45,
              merchantCount: 14,
              cid: 806,
            },
          ],
        },
      });

      const result = await BestPriceClient.getCurrentProductData();
      const sendMessage = getSendMessageMock();

      expect(sendMessage).toHaveBeenCalledWith(
        {
          action: 'bestprice.fetch',
          url: 'https://www.bestprice.gr/api/getProduct',
          method: 'POST',
          responseType: 'json',
          formData: {
            uri: window.location.href,
            canonical:
              'https://www.skroutz.gr/s/62596505/apple-iphone-17-pro-max-12-256gb-deep-blue.html',
            verbose: 'true',
            bp: 'true',
          },
        },
        expect.any(Function),
      );

      expect(result).toEqual({
        title: 'Apple iPhone 17 Pro Max (12/256GB) Deep Blue',
        price: 1482.45,
        url: 'https://www.bestprice.gr/item/kinhta-thlefwna/apple-iphone-17-pro-max-256gb-deep-blue.html',
        merchantCount: 14,
        categoryId: 806,
      });
    });

    it('falls back to BestPrice search results when direct product lookup returns no product', async () => {
      document.body.innerHTML = [
        '<nav aria-label="breadcrumb">',
        '<a href="/c/1/root.html">Root</a>',
        '<a href="/c/40/kinhta-thlefwna.html">Κινητά Τηλέφωνα</a>',
        '</nav>',
        '<h1>Apple iPhone 17 Pro Max 256GB</h1>',
        '<meta property="og:title" content="Apple iPhone 17 Pro Max 256GB | Skroutz.gr">',
      ].join('');

      const expectedSearchUrl = new URL('https://www.bestprice.gr/search');
      expectedSearchUrl.searchParams.set('q', 'Apple iPhone 17 Pro Max 256GB');

      const searchHtml = [
        '<div class="p" data-cid="806">',
        '<div class="p__category">Phones</div>',
        '<h3 class="p__title">',
        '<a href="/item/2162499901/apple-iphone-17-pro-max-256gb.html" title="Apple iPhone 17 Pro Max 256GB">Apple iPhone 17 Pro Max 256GB</a>',
        '</h3>',
        '<div class="p__price--current">1.259,00€</div>',
        '<div class="p__merchants">66 stores</div>',
        '</div>',
        '<div class="p" data-cid="3145">',
        '<div class="p__category">Screen Protectors</div>',
        '<h3 class="p__title">',
        '<a href="/to/202820150/sunshine-ss-057a-hq-hydrogel.html" title="Hydrogel Screen Protector for Apple iPhone 17 Pro Max 256GB">Hydrogel Screen Protector for Apple iPhone 17 Pro Max 256GB</a>',
        '</h3>',
        '<div class="p__price--current">9,50€</div>',
        '<div class="p__merchants">1 store</div>',
        '</div>',
      ].join('');

      setBridgeResponses(
        {
          ok: true,
          status: 200,
          url: 'https://www.bestprice.gr/api/getProduct',
          data: false,
        },
        {
          ok: true,
          status: 200,
          url: expectedSearchUrl.toString(),
          data: searchHtml,
        },
      );

      const result = await BestPriceClient.getCurrentProductData();
      const sendMessage = getSendMessageMock();

      expect(sendMessage).toHaveBeenNthCalledWith(
        1,
        expect.objectContaining({
          action: 'bestprice.fetch',
          url: 'https://www.bestprice.gr/api/getProduct',
          method: 'POST',
          responseType: 'json',
        }),
        expect.any(Function),
      );
      expect(sendMessage).toHaveBeenNthCalledWith(
        2,
        {
          action: 'bestprice.fetch',
          url: expectedSearchUrl.toString(),
          method: 'GET',
          responseType: 'text',
        },
        expect.any(Function),
      );

      expect(result).toEqual({
        title: 'Apple iPhone 17 Pro Max 256GB',
        price: 1259,
        url: 'https://www.bestprice.gr/item/2162499901/apple-iphone-17-pro-max-256gb.html',
        merchantCount: 66,
        categoryId: 806,
      });
    });

    it('uses the item page shipping cost when BestPrice returns a product page', async () => {
      document.body.innerHTML = [
        '<nav aria-label="breadcrumb">',
        '<a href="/c/1/root.html">Root</a>',
        '<a href="/c/40/kinhta-thlefwna.html">Κινητά Τηλέφωνα</a>',
        '</nav>',
        '<h1>Apple iPhone 17 Pro Max 256GB</h1>',
      ].join('');

      const itemHtml = [
        '<html>',
        '<head>',
        '<link rel="canonical" href="https://www.bestprice.gr/item/2162499901/apple-iphone-17-pro-max-256gb.html">',
        '<meta property="og:title" content="Apple iPhone 17 Pro Max 256GB | BestPrice.gr">',
        '<meta itemprop="lowPrice" content="1259.00">',
        '<meta itemprop="offerCount" content="66">',
        '</head>',
        '<body>',
        '<div class="prices__product" data-is-bestprice data-price="125900" data-shipping-cost="490">',
        '<div class="prices__price-wrapper"><a href="/item/2162499901/apple-iphone-17-pro-max-256gb.html">1.259,00€</a></div>',
        '<div class="prices__costs"><div class="prices__cost-label">Μεταφορικά</div><div class="prices__cost-value prices__cost-value--add">4,90€</div></div>',
        '</div>',
        '</body>',
        '</html>',
      ].join('');

      setBridgeResponses(
        {
          ok: true,
          status: 200,
          url: 'https://www.bestprice.gr/api/getProduct',
          data: false,
        },
        {
          ok: true,
          status: 200,
          url: 'https://www.bestprice.gr/search?q=Apple+iPhone+17+Pro+Max+256GB',
          data: itemHtml,
        },
      );

      const result = await BestPriceClient.getCurrentProductData();

      expect(result).toEqual({
        title: 'Apple iPhone 17 Pro Max 256GB',
        price: 1259,
        shippingCost: 4.9,
        totalPrice: 1263.9,
        url: 'https://www.bestprice.gr/item/2162499901/apple-iphone-17-pro-max-256gb.html',
        merchantCount: 66,
      });
    });

    it('keeps free shipping visible as zero when BestPrice returns a product page', async () => {
      document.body.innerHTML = [
        '<nav aria-label="breadcrumb">',
        '<a href="/c/1/root.html">Root</a>',
        '<a href="/c/40/kinhta-thlefwna.html">Κινητά Τηλέφωνα</a>',
        '</nav>',
        '<h1>Apple iPhone 17 Pro Max 256GB</h1>',
      ].join('');

      const itemHtml = [
        '<html>',
        '<head>',
        '<link rel="canonical" href="https://www.bestprice.gr/item/2162499901/apple-iphone-17-pro-max-256gb.html">',
        '<meta property="og:title" content="Apple iPhone 17 Pro Max 256GB | BestPrice.gr">',
        '<meta itemprop="lowPrice" content="1259.00">',
        '<meta itemprop="offerCount" content="66">',
        '</head>',
        '<body>',
        '<div class="prices__product" data-is-bestprice data-price="125900" data-shipping-cost="0">',
        '<div class="prices__price-wrapper"><a href="/item/2162499901/apple-iphone-17-pro-max-256gb.html">1.259,00€</a></div>',
        '<div class="prices__costs"><div class="prices__cost-label">Μεταφορικά</div><div class="prices__cost-value prices__cost-value--add">0,00€</div></div>',
        '</div>',
        '</body>',
        '</html>',
      ].join('');

      setBridgeResponses(
        {
          ok: true,
          status: 200,
          url: 'https://www.bestprice.gr/api/getProduct',
          data: false,
        },
        {
          ok: true,
          status: 200,
          url: 'https://www.bestprice.gr/search?q=Apple+iPhone+17+Pro+Max+256GB',
          data: itemHtml,
        },
      );

      const result = await BestPriceClient.getCurrentProductData();

      expect(result).toEqual({
        title: 'Apple iPhone 17 Pro Max 256GB',
        price: 1259,
        shippingCost: 0,
        totalPrice: 1259,
        url: 'https://www.bestprice.gr/item/2162499901/apple-iphone-17-pro-max-256gb.html',
        merchantCount: 66,
      });
    });

    it('falls back to category deals when search has no usable item match', async () => {
      document.body.innerHTML = [
        '<nav aria-label="breadcrumb">',
        '<a href="/c/1/root.html">Root</a>',
        '<a href="/c/40/kinhta-thlefwna.html">Κινητά Τηλέφωνα</a>',
        '</nav>',
        '<h1>Apple iPhone 17 Pro Max 256GB</h1>',
      ].join('');

      const expectedSearchUrl = new URL('https://www.bestprice.gr/search');
      expectedSearchUrl.searchParams.set('q', 'Apple iPhone 17 Pro Max 256GB');

      setBridgeResponses(
        {
          ok: true,
          status: 200,
          url: 'https://www.bestprice.gr/api/getProduct',
          data: false,
        },
        {
          ok: true,
          status: 200,
          url: expectedSearchUrl.toString(),
          data: '<div id="no-results__wrapper"></div>',
        },
        {
          ok: true,
          status: 200,
          url: 'https://www.bestprice.gr/api/getDeals',
          data: {
            deals: [
              {
                title: 'Apple iPhone 17 Pro Max 256GB Deep Blue',
                path: 'kinhta-thlefwna/apple-iphone-17-pro-max-256gb-deep-blue',
                mp: 148245,
                mc: 14,
                cid: 806,
              },
            ],
          },
        },
      );

      const result = await BestPriceClient.getCurrentProductData();
      const sendMessage = getSendMessageMock();

      expect(sendMessage).toHaveBeenNthCalledWith(
        3,
        {
          action: 'bestprice.fetch',
          url: 'https://www.bestprice.gr/api/getDeals',
          method: 'POST',
          responseType: 'json',
          formData: {
            cids: '[806]',
            bp: 'true',
            pcFrom: '1',
            origin: window.location.origin,
          },
        },
        expect.any(Function),
      );

      expect(result).toEqual({
        title: 'Apple iPhone 17 Pro Max 256GB Deep Blue',
        price: 1482.45,
        url: 'https://www.bestprice.gr/item/kinhta-thlefwna/apple-iphone-17-pro-max-256gb-deep-blue.html',
        merchantCount: 14,
        categoryId: 806,
      });
    });

    it('returns undefined when no usable category can be detected', async () => {
      document.body.innerHTML = '<h1>Apple iPhone 17 Pro Max 256GB</h1>';

      const expectedSearchUrl = new URL('https://www.bestprice.gr/search');
      expectedSearchUrl.searchParams.set('q', 'Apple iPhone 17 Pro Max 256GB');

      setBridgeResponses(
        {
          ok: true,
          status: 200,
          url: 'https://www.bestprice.gr/api/getProduct',
          data: false,
        },
        {
          ok: true,
          status: 200,
          url: expectedSearchUrl.toString(),
          data: '<div id="no-results__wrapper"></div>',
        },
      );

      const result = await BestPriceClient.getCurrentProductData();
      const sendMessage = getSendMessageMock();

      expect(result).toBeUndefined();
      expect(sendMessage).toHaveBeenCalledTimes(2);
    });

    it('uses Skroutz product names as search fallbacks when live page text is noisy', async () => {
      document.body.innerHTML = '<div class="product-shell"></div>';
      document.title = 'Skroutz.gr';

      vi.spyOn(SkroutzClient, 'getCurrentProductNames').mockResolvedValue([
        'Apple iPhone 17 Pro Max 256GB',
      ]);

      const expectedSearchUrl = new URL('https://www.bestprice.gr/search');
      expectedSearchUrl.searchParams.set('q', 'Apple iPhone 17 Pro Max 256GB');

      setBridgeResponses(
        {
          ok: true,
          status: 200,
          url: 'https://www.bestprice.gr/api/getProduct',
          data: false,
        },
        {
          ok: true,
          status: 200,
          url: expectedSearchUrl.toString(),
          data: [
            '<div class="p" data-cid="806">',
            '<h3 class="p__title">',
            '<a href="/item/2162499901/apple-iphone-17-pro-max-256gb.html" title="Apple iPhone 17 Pro Max 256GB">Apple iPhone 17 Pro Max 256GB</a>',
            '</h3>',
            '<div class="p__price--current">1.259,00€</div>',
            '<div class="p__merchants">66 καταστήματα</div>',
            '</div>',
          ].join(''),
        },
      );

      const result = await BestPriceClient.getCurrentProductData();
      const sendMessage = getSendMessageMock();

      expect(sendMessage).toHaveBeenNthCalledWith(
        2,
        {
          action: 'bestprice.fetch',
          url: expectedSearchUrl.toString(),
          method: 'GET',
          responseType: 'text',
        },
        expect.any(Function),
      );

      expect(result).toEqual({
        title: 'Apple iPhone 17 Pro Max 256GB',
        price: 1259,
        url: 'https://www.bestprice.gr/item/2162499901/apple-iphone-17-pro-max-256gb.html',
        merchantCount: 66,
        categoryId: 806,
      });
    });
  });
});
