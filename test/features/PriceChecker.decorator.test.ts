import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { BestPriceClient, BestPriceProductData } from '../../src/clients/best_price/client';
import {
  ProductPriceData,
  ProductPriceHistory,
  SkroutzClient,
} from '../../src/clients/skroutz/client';
import { Language } from '../../src/common/enums/Language.enum';
import { State } from '../../src/common/types/State.type';
import { PriceCheckerDecorator } from '../../src/features/PriceChecker.decorator';

vi.mock('../../src/clients/skroutz/client', () => ({
  SkroutzClient: {
    getCurrentProductData: vi.fn(),
    getPriceHistory: vi.fn(),
  },
}));

vi.mock('../../src/clients/best_price/client', () => ({
  BestPriceClient: {
    getCurrentProductData: vi.fn(),
  },
}));

vi.mock('../../src/common/components/PriceHistory.component', () => ({
  PriceHistoryComponent: vi.fn(() => {
    const element = document.createElement('div');
    element.className = 'mock-price-history';
    return element;
  }),
}));

vi.mock('../../src/features/functions/createReskoutzedReviewElement', () => ({
  createReSkoutzedReviewElement: vi.fn(() => {
    const promotion = document.createElement('div');
    promotion.className = 'own-promotion';

    const row = document.createElement('div');
    row.className = 'store-availability-row';

    const left = document.createElement('div');
    left.className = 'store-availability-left';

    const right = document.createElement('div');
    right.className = 'store-availability-right';

    row.appendChild(left);
    row.appendChild(right);
    promotion.appendChild(row);

    return promotion;
  }),
}));

vi.mock('../../src/features/functions/createBuyMeCoffeeElement', () => ({
  createBuyMeCoffeeElement: vi.fn(() => {
    const element = document.createElement('div');
    element.className = 'buy-me-coffee';
    return element;
  }),
}));

type Deferred<T> = {
  promise: Promise<T>;
  resolve: (value: T) => void;
  reject: (reason?: unknown) => void;
};

const createDeferred = <T>(): Deferred<T> => {
  let resolve!: (value: T) => void;
  let reject!: (reason?: unknown) => void;

  const promise = new Promise<T>((promiseResolve, promiseReject) => {
    resolve = promiseResolve;
    reject = promiseReject;
  });

  return { promise, resolve, reject };
};

const flushPromises = async (): Promise<void> => {
  await Promise.resolve();
  await Promise.resolve();
  await Promise.resolve();
  await new Promise((resolve) => setTimeout(resolve, 0));
};

describe('PriceCheckerDecorator', () => {
  let decorator: PriceCheckerDecorator | undefined;

  const mockState: State = {
    language: Language.ENGLISH,
    darkMode: false,
    hideProductAds: false,
    hideVideoAds: false,
    hideShelfProductAds: false,
    hideSponsorships: false,
    productAdCount: 0,
    videoAdCount: 0,
    ShelfAdCount: 0,
    sponsorshipAdCount: 0,
    minimumPriceDifference: 5,
  };

  const mockProductPriceData: ProductPriceData = {
    buyThroughSkroutz: {
      price: 100,
      shippingCost: 4,
      totalPrice: 104,
      shopId: 101,
    },
    buyThroughStore: {
      price: 95,
      shippingCost: 3,
      totalPrice: 98,
      shopId: 202,
    },
    storeAvailability: {
      cities: ['Athens', 'Patras'],
      userCity: 'Athens',
      matchingCities: ['Athens'],
      cityShopMap: {
        Athens: [202],
        Patras: [303],
      },
    },
  };

  const mockBestPriceData: BestPriceProductData = {
    title: 'BestPrice listing',
    price: 94,
    shippingCost: 2,
    totalPrice: 96,
    url: 'https://www.bestprice.gr/item/mock.html',
  };

  const mockPriceHistory: ProductPriceHistory = {
    minimumPrice: 90,
    maximumPrice: 120,
    allPrices: [],
    sixMonthPrices: [],
  };

  beforeEach(() => {
    vi.clearAllMocks();
    document.body.innerHTML = `
      <article class="buybox">
        <div class="price-box">
          <div class="price-and-installments"></div>
          <div class="final-price"></div>
        </div>
      </article>
      <div class="buy-section">
        <h3>Buy through Store</h3>
      </div>
      <div class="buy-section">
        <h3>Skroutz</h3>
      </div>
    `;
  });

  afterEach(() => {
    if (decorator) {
      const activeDecorator = decorator as PriceCheckerDecorator & {
        observer?: MutationObserver | null;
      };
      activeDecorator.observer?.disconnect();
      activeDecorator.observer = null;
      decorator = undefined;
    }

    document.body.innerHTML = '';
    vi.restoreAllMocks();
  });

  it('renders a skeleton immediately before product data resolves', async () => {
    const productDataDeferred = createDeferred<ProductPriceData>();
    const priceHistoryDeferred = createDeferred<ProductPriceHistory>();
    const bestPriceDeferred = createDeferred<BestPriceProductData | undefined>();

    vi.mocked(SkroutzClient.getCurrentProductData).mockReturnValue(productDataDeferred.promise);
    vi.mocked(SkroutzClient.getPriceHistory).mockReturnValue(priceHistoryDeferred.promise);
    vi.mocked(BestPriceClient.getCurrentProductData).mockReturnValue(bestPriceDeferred.promise);

    decorator = new PriceCheckerDecorator(mockState);
    const executePromise = decorator.execute();

    await flushPromises();

    expect(document.querySelector('.price-checker-loading')).not.toBeNull();
    expect(document.querySelector('.price-checker-skeleton-price')).not.toBeNull();
    expect(document.querySelector('.bestprice-badge-loading')).not.toBeNull();
    expect(document.querySelector('.store-availability-loading')).not.toBeNull();
    expect(document.querySelector('.own-promotion-loading')).not.toBeNull();

    productDataDeferred.resolve(mockProductPriceData);
    priceHistoryDeferred.resolve(mockPriceHistory);
    bestPriceDeferred.resolve(mockBestPriceData);

    await executePromise;
    await flushPromises();
  });

  it('hydrates core data first and fills async sections as they resolve', async () => {
    const productDataDeferred = createDeferred<ProductPriceData>();
    const priceHistoryDeferred = createDeferred<ProductPriceHistory>();
    const bestPriceDeferred = createDeferred<BestPriceProductData | undefined>();

    vi.mocked(SkroutzClient.getCurrentProductData).mockReturnValue(productDataDeferred.promise);
    vi.mocked(SkroutzClient.getPriceHistory).mockReturnValue(priceHistoryDeferred.promise);
    vi.mocked(BestPriceClient.getCurrentProductData).mockReturnValue(bestPriceDeferred.promise);

    decorator = new PriceCheckerDecorator(mockState);
    const executePromise = decorator.execute();

    productDataDeferred.resolve(mockProductPriceData);
    await executePromise;
    await flushPromises();

    expect(document.querySelector('.price-checker-loading')).toBeNull();
    expect(document.querySelector('.price-checker-outline')).not.toBeNull();
    expect(document.querySelector('.bestprice-badge-loading')).not.toBeNull();
    expect(document.querySelector('.price-history-loading-wrapper')).not.toBeNull();
    expect(
      document.querySelector('.price-display-wrapper .shipping-cost-text')?.textContent,
    ).toContain('(+3,00€ shipping)');

    bestPriceDeferred.resolve(mockBestPriceData);
    await flushPromises();

    const bestPriceBadge = document.querySelector('.bestprice-badge') as HTMLAnchorElement | null;
    expect(document.querySelector('.bestprice-badge-loading')).toBeNull();
    expect(bestPriceBadge).not.toBeNull();
    expect(bestPriceBadge?.href).toBe('https://www.bestprice.gr/item/mock.html');
    expect(document.querySelector('.price-history-loading-wrapper')).not.toBeNull();

    priceHistoryDeferred.resolve(mockPriceHistory);
    await flushPromises();

    expect(document.querySelector('.price-history-loading-wrapper')).toBeNull();
    expect(document.querySelector('.mock-price-history')).not.toBeNull();
  });
});
