import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { BestPriceClient, BestPriceProductData } from '../../src/clients/best_price/client';
import { ShopflixClient } from '../../src/clients/shopflix/client';
import {
  ProductPriceData,
  ProductPriceHistory,
  SkroutzClient,
} from '../../src/clients/skroutz/client';
import { PriceChartValue } from '../../src/clients/skroutz/types';
import { Language } from '../../src/common/enums/Language.enum';
import { PriceComparisonProduct } from '../../src/common/types/PriceComparisonProduct.type';
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

vi.mock('../../src/clients/shopflix/client', () => ({
  ShopflixClient: {
    getCurrentProductData: vi.fn(),
    isSupported: vi.fn(),
  },
}));

vi.mock('../../src/common/components/PriceHistory.component', () => ({
  PriceHistoryComponent: vi.fn(
    (_language: Language, averagePriceLine?: HTMLElement | null): HTMLElement => {
      const element = document.createElement('div');
      element.className = 'mock-price-history';

      const row = document.createElement('div');
      row.className = 'price-history-row';

      if (averagePriceLine) {
        row.appendChild(averagePriceLine);
      }

      const controls = document.createElement('div');
      controls.className = 'price-history-controls';
      row.appendChild(controls);
      element.appendChild(row);

      return element;
    },
  ),
}));

vi.mock('../../src/features/functions/createReskoutzedReviewElement', () => ({
  createReSkoutzedReviewElement: vi.fn(() => {
    const promotion = document.createElement('div');
    promotion.className = 'own-promotion';

    const row = document.createElement('div');
    row.className = 'store-availability-row';

    const left = document.createElement('div');
    left.className = 'store-availability-left own-promotion-left';

    const right = document.createElement('div');
    right.className = 'store-availability-right own-promotion-right';

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
    hideRecommendationAds: false,
    hideSkoopAds: false,
    hideAISlop: false,
    wideMode: false,
    hideUniversalToggle: false,
    hideSponsorships: false,
    priceCheckerEnabled: true,
    productAdCount: 0,
    videoAdCount: 0,
    shelfAdCount: 0,
    recommendationAdCount: 0,
    skoopAdCount: 0,
    sponsorshipAdCount: 0,
    minimumPriceDifference: 5,
    showShopflix: true,
    isMobile: false,
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
      availableShopCount: 3,
      cities: ['Athens', 'Patras'],
      userCity: 'Athens',
      userZip: '10563',
      matchingCities: ['Athens'],
      cityShopMap: {
        Athens: [202],
        Patras: [303],
      },
      orderCities: ['Athens', 'Patras', 'Heraklion'],
      orderCityShopMap: {
        Athens: [202],
        Patras: [303],
        Heraklion: [404, 405],
      },
      onlineOnlyShopCount: 1,
    },
  };

  const mockBestPriceData: BestPriceProductData = {
    title: 'BestPrice listing',
    price: 94,
    shippingCost: 2,
    totalPrice: 96,
    url: 'https://www.bestprice.gr/item/mock.html',
  };

  // Shopflix exposes no shipping cost to anonymous visitors, so the badge falls
  // back to a price-only comparison.
  const mockShopflixData: PriceComparisonProduct = {
    title: 'Shopflix listing',
    price: 92,
    url: 'https://shopflix.gr/p/SF-1/mock-product',
  };

  const mockPriceHistory: ProductPriceHistory = {
    allPrices: [],
    sixMonthPrices: [],
  };

  const samples = (values: number[]): PriceChartValue[] =>
    values.map((value, index) => ({ value, timestamp: index * 86_400_000 }));

  const mockPriceHistoryWithSamples: ProductPriceHistory = {
    allPrices: samples([100, 110, 120]),
    sixMonthPrices: samples([90, 100]),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockState.language = Language.ENGLISH;
    mockState.priceCheckerEnabled = true;
    mockState.showShopflix = true;
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
      decorator.destroy();
      decorator = undefined;
    }

    document.body.innerHTML = '';
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it('renders both comparison columns when the Shopflix comparison is enabled', async () => {
    vi.mocked(ShopflixClient.isSupported).mockReturnValue(true);
    vi.mocked(SkroutzClient.getCurrentProductData).mockResolvedValue(mockProductPriceData);
    vi.mocked(SkroutzClient.getPriceHistory).mockResolvedValue(mockPriceHistory);
    vi.mocked(BestPriceClient.getCurrentProductData).mockResolvedValue(mockBestPriceData);
    vi.mocked(ShopflixClient.getCurrentProductData).mockResolvedValue(mockShopflixData);

    decorator = new PriceCheckerDecorator(mockState);
    await decorator.execute();
    await flushPromises();

    const shopflixBadge = document.querySelector('.shopflix-badge') as HTMLAnchorElement | null;
    expect(shopflixBadge).not.toBeNull();
    expect(shopflixBadge?.href).toBe('https://shopflix.gr/p/SF-1/mock-product');
    expect(shopflixBadge?.textContent).toContain('Buy through Shopflix');
    expect(shopflixBadge?.classList.contains('price-display-shopflix-action')).toBe(true);
    expect(shopflixBadge?.querySelector('.shopflix-badge-logo')?.textContent).toBe('shopflix');
    expect(shopflixBadge?.querySelector('.price-display-shipping-note')?.textContent).toContain(
      'Delivery costs may apply',
    );

    const bestPriceBadge = document.querySelector('.bestprice-badge') as HTMLAnchorElement | null;
    expect(bestPriceBadge).not.toBeNull();
    expect(bestPriceBadge?.href).toBe('https://www.bestprice.gr/item/mock.html');
    expect(bestPriceBadge?.textContent).toContain('Buy through BestPrice');

    // Store | divider | BestPrice | divider | Shopflix
    expect(document.querySelectorAll('.price-display-divider')).toHaveLength(2);
    expect(document.querySelector('.shopflix-comparison-text')?.textContent).toContain('Shopflix');
    expect(document.querySelector('.bestprice-comparison-text')?.textContent).toContain(
      'BestPrice',
    );
  });

  it('keeps a pending provider skeleton while the other provider hydrates', async () => {
    vi.mocked(ShopflixClient.isSupported).mockReturnValue(true);

    const productDataDeferred = createDeferred<ProductPriceData>();
    const bestPriceDeferred = createDeferred<PriceComparisonProduct | undefined>();
    const shopflixDeferred = createDeferred<PriceComparisonProduct | undefined>();

    vi.mocked(SkroutzClient.getCurrentProductData).mockReturnValue(productDataDeferred.promise);
    vi.mocked(SkroutzClient.getPriceHistory).mockResolvedValue(mockPriceHistory);
    vi.mocked(BestPriceClient.getCurrentProductData).mockReturnValue(bestPriceDeferred.promise);
    vi.mocked(ShopflixClient.getCurrentProductData).mockReturnValue(shopflixDeferred.promise);

    decorator = new PriceCheckerDecorator(mockState);
    const executePromise = decorator.execute();

    await flushPromises();

    expect(document.querySelector('.bestprice-badge-loading')).not.toBeNull();
    expect(document.querySelector('.shopflix-badge-loading')).not.toBeNull();

    productDataDeferred.resolve(mockProductPriceData);
    await flushPromises();

    bestPriceDeferred.resolve(mockBestPriceData);
    await flushPromises();

    expect(document.querySelector('.bestprice-badge')).not.toBeNull();
    expect(document.querySelector('.shopflix-badge-loading')).not.toBeNull();

    shopflixDeferred.resolve(mockShopflixData);
    await executePromise;
    await flushPromises();

    expect(document.querySelector('.shopflix-badge')).not.toBeNull();
  });

  it('shows the Shopflix unavailable state next to a working BestPrice column', async () => {
    vi.mocked(ShopflixClient.isSupported).mockReturnValue(true);
    vi.mocked(SkroutzClient.getCurrentProductData).mockResolvedValue(mockProductPriceData);
    vi.mocked(SkroutzClient.getPriceHistory).mockResolvedValue(mockPriceHistory);
    vi.mocked(BestPriceClient.getCurrentProductData).mockResolvedValue(mockBestPriceData);
    vi.mocked(ShopflixClient.getCurrentProductData).mockResolvedValue(undefined);

    decorator = new PriceCheckerDecorator(mockState);
    await decorator.execute();
    await flushPromises();

    expect(document.querySelector('.shopflix-unavailable')?.textContent).toBe(
      'Shopflix not available',
    );
    expect(document.querySelector('.shopflix-badge')).toBeNull();
    expect(document.querySelector('.bestprice-badge')).not.toBeNull();
  });

  it('never requests Shopflix on the non-Greek Skroutz storefronts', async () => {
    vi.mocked(ShopflixClient.isSupported).mockReturnValue(false);
    vi.mocked(SkroutzClient.getCurrentProductData).mockResolvedValue(mockProductPriceData);
    vi.mocked(SkroutzClient.getPriceHistory).mockResolvedValue(mockPriceHistory);
    vi.mocked(BestPriceClient.getCurrentProductData).mockResolvedValue(mockBestPriceData);

    decorator = new PriceCheckerDecorator(mockState);
    await decorator.execute();
    await flushPromises();

    expect(ShopflixClient.getCurrentProductData).not.toHaveBeenCalled();
    expect(document.querySelector('.bestprice-badge')).not.toBeNull();
    expect(document.querySelector('.shopflix-badge')).toBeNull();
    expect(document.querySelector('.shopflix-badge-loading')).toBeNull();
    expect(document.querySelectorAll('.price-display-divider')).toHaveLength(1);
  });

  it('skips the Shopflix column when the comparison is switched off', async () => {
    mockState.showShopflix = false;
    vi.mocked(ShopflixClient.isSupported).mockReturnValue(true);
    vi.mocked(SkroutzClient.getCurrentProductData).mockResolvedValue(mockProductPriceData);
    vi.mocked(SkroutzClient.getPriceHistory).mockResolvedValue(mockPriceHistory);
    vi.mocked(BestPriceClient.getCurrentProductData).mockResolvedValue(mockBestPriceData);

    decorator = new PriceCheckerDecorator(mockState);
    await decorator.execute();
    await flushPromises();

    expect(ShopflixClient.getCurrentProductData).not.toHaveBeenCalled();
    expect(document.querySelector('.bestprice-badge')).not.toBeNull();
    expect(document.querySelector('.shopflix-badge')).toBeNull();
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
    expect(document.querySelector('.go-to-shop-button-positive')).toBeNull();
    expect(document.querySelector('.go-to-shop-button-negative')).toBeNull();
    expect(document.querySelector('.price-display-divider')).not.toBeNull();
    const storeAction = document.querySelector(
      '.price-display-store-action',
    ) as HTMLButtonElement | null;
    expect(storeAction).not.toBeNull();
    expect(storeAction?.tagName).toBe('BUTTON');
    expect(storeAction?.textContent).toContain('Buy through store');
    expect(
      document.querySelector('.price-display-wrapper .shipping-cost-text')?.textContent,
    ).toContain('(+3,00€ shipping)');
    expect(document.querySelector('.store-availability-status')?.textContent).toContain(
      'Available in your area.',
    );
    // Store chips were removed: the row is informational and hands the real
    // store list over to Skroutz's native store-pickup view.
    expect(document.querySelectorAll('.store-location-entry').length).toBe(0);
    expect(document.querySelector('.store-availability-shops-list')).toBeNull();
    expect(document.querySelector('.store-availability-shops-summary')).toBeNull();
    expect(document.querySelector('.store-availability-summary')).toBeNull();
    expect(document.querySelector('.store-availability-online-summary')).toBeNull();
    const moreLink = document.querySelector(
      '.store-availability-more-link',
    ) as HTMLButtonElement | null;
    expect(moreLink).not.toBeNull();
    expect(moreLink?.textContent).toContain('See where you can pick it up.');

    bestPriceDeferred.resolve(mockBestPriceData);
    await flushPromises();

    const bestPriceBadge = document.querySelector('.bestprice-badge') as HTMLAnchorElement | null;
    expect(document.querySelector('.bestprice-badge-loading')).toBeNull();
    expect(bestPriceBadge).not.toBeNull();
    expect(bestPriceBadge?.href).toBe('https://www.bestprice.gr/item/mock.html');
    expect(bestPriceBadge?.textContent).toContain('Buy through BestPrice');
    expect(bestPriceBadge?.classList.contains('price-display-bestprice-action')).toBe(true);
    expect(bestPriceBadge?.classList.contains('price-display-action-positive')).toBe(true);
    expect(bestPriceBadge?.querySelector('.bestprice-badge-logo')).not.toBeNull();
    expect(bestPriceBadge?.querySelector('.price-display-shipping-note')).toBeNull();
    expect(document.querySelector('.price-history-loading-wrapper')).not.toBeNull();

    const hydratedStoreAction = document.querySelector(
      '.price-display-store-action',
    ) as HTMLButtonElement | null;
    expect(hydratedStoreAction?.classList.contains('price-display-action-positive')).toBe(true);
    expect(
      document.querySelector('.price-checker-outline')?.classList.contains('info-label-positive'),
    ).toBe(false);
    expect(
      document.querySelector('.price-checker-outline')?.classList.contains('info-label-negative'),
    ).toBe(false);

    priceHistoryDeferred.resolve(mockPriceHistory);
    await flushPromises();

    expect(document.querySelector('.price-history-loading-wrapper')).toBeNull();
    expect(document.querySelector('.mock-price-history')).not.toBeNull();
  });

  it('shows the six-month and lifetime average prices under the price columns', async () => {
    // Arrange
    vi.mocked(SkroutzClient.getCurrentProductData).mockResolvedValue(mockProductPriceData);
    vi.mocked(SkroutzClient.getPriceHistory).mockResolvedValue(mockPriceHistoryWithSamples);
    vi.mocked(BestPriceClient.getCurrentProductData).mockResolvedValue(mockBestPriceData);
    vi.mocked(ShopflixClient.isSupported).mockReturnValue(false);

    // Act
    decorator = new PriceCheckerDecorator(mockState);
    await decorator.execute();
    await flushPromises();

    // Assert
    const line = document.querySelector('.price-average-line') as HTMLDivElement | null;
    expect(line).not.toBeNull();
    expect(line?.parentElement?.classList.contains('price-history-row')).toBe(true);
    expect(line?.querySelector('.price-average-icon svg')).not.toBeNull();

    // Six months on top, the whole sales period underneath.
    const lines = Array.from(line?.querySelectorAll('.price-average-item') ?? []).map(
      (item) => item.textContent,
    );
    expect(lines).toEqual(['6-month average: 95,00€', 'All-time average: 110,00€']);

    // The toggles sit to the right of the line, inside the same row.
    const controls = line?.nextElementSibling as HTMLElement | null;
    expect(controls?.classList.contains('price-history-controls')).toBe(true);
    expect(controls?.querySelector('.analysis-toggle-button')).not.toBeNull();
  });

  it('translates the average line to Greek', async () => {
    // Arrange
    mockState.language = Language.GREEK;
    vi.mocked(SkroutzClient.getCurrentProductData).mockResolvedValue(mockProductPriceData);
    vi.mocked(SkroutzClient.getPriceHistory).mockResolvedValue(mockPriceHistoryWithSamples);
    vi.mocked(BestPriceClient.getCurrentProductData).mockResolvedValue(mockBestPriceData);
    vi.mocked(ShopflixClient.isSupported).mockReturnValue(false);

    // Act
    decorator = new PriceCheckerDecorator(mockState);
    await decorator.execute();
    await flushPromises();

    // Assert
    const lines = Array.from(
      document.querySelectorAll('.price-average-line .price-average-item'),
    ).map((item) => item.textContent);
    expect(lines).toEqual(['Μέση τιμή εξαμήνου: 95,00€', 'Μέση τιμή όλης της περιόδου: 110,00€']);
  });

  it('omits the average for a window with no usable samples', async () => {
    // Arrange
    const lifetimeOnlyHistory: ProductPriceHistory = {
      allPrices: samples([100, 200]),
      sixMonthPrices: [],
    };
    vi.mocked(SkroutzClient.getCurrentProductData).mockResolvedValue(mockProductPriceData);
    vi.mocked(SkroutzClient.getPriceHistory).mockResolvedValue(lifetimeOnlyHistory);
    vi.mocked(BestPriceClient.getCurrentProductData).mockResolvedValue(mockBestPriceData);
    vi.mocked(ShopflixClient.isSupported).mockReturnValue(false);

    // Act
    decorator = new PriceCheckerDecorator(mockState);
    await decorator.execute();
    await flushPromises();

    // Assert
    expect(document.querySelector('.price-average-line')?.textContent).toBe(
      'All-time average: 150,00€',
    );
  });

  it('does not render an average line when the history has no samples', async () => {
    // Arrange
    vi.mocked(SkroutzClient.getCurrentProductData).mockResolvedValue(mockProductPriceData);
    vi.mocked(SkroutzClient.getPriceHistory).mockResolvedValue(mockPriceHistory);
    vi.mocked(BestPriceClient.getCurrentProductData).mockResolvedValue(mockBestPriceData);
    vi.mocked(ShopflixClient.isSupported).mockReturnValue(false);

    // Act
    decorator = new PriceCheckerDecorator(mockState);
    await decorator.execute();
    await flushPromises();

    // Assert
    expect(document.querySelector('.price-average-line')).toBeNull();
  });

  it('shows each option its own difference pill, measured against Skroutz', async () => {
    // Arrange — store 98,00€ and BestPrice 96,00€ vs Buy through Skroutz 104,00€
    vi.mocked(SkroutzClient.getCurrentProductData).mockResolvedValue(mockProductPriceData);
    vi.mocked(SkroutzClient.getPriceHistory).mockResolvedValue(mockPriceHistory);
    vi.mocked(BestPriceClient.getCurrentProductData).mockResolvedValue(mockBestPriceData);
    vi.mocked(ShopflixClient.isSupported).mockReturnValue(false);

    // Act
    decorator = new PriceCheckerDecorator(mockState);
    await decorator.execute();
    await flushPromises();

    // Assert — each pill lives inside its own price block, not on the card.
    const storeBadge = document.querySelector(
      '.price-display-store-action .price-difference-badge',
    );
    const bestPriceBadge = document.querySelector(
      '.price-display-bestprice-action .price-difference-badge',
    );
    expect(storeBadge?.textContent).toBe('-6,00€');
    expect(bestPriceBadge?.textContent).toBe('-8,00€');
    expect(storeBadge?.classList.contains('price-difference-badge--cheaper')).toBe(true);

    // The pill leads its block, directly above the price it refers to.
    expect(storeBadge?.nextElementSibling?.classList.contains('price-indicator-price')).toBe(true);
    expect(document.querySelectorAll('.price-difference-badge')).toHaveLength(2);
  });

  it('gives the Shopflix option a pill too when that comparison is on', async () => {
    // Arrange — store 98,00€, BestPrice 96,00€, Shopflix 92,00€ vs Skroutz 104,00€
    vi.mocked(ShopflixClient.isSupported).mockReturnValue(true);
    vi.mocked(SkroutzClient.getCurrentProductData).mockResolvedValue(mockProductPriceData);
    vi.mocked(SkroutzClient.getPriceHistory).mockResolvedValue(mockPriceHistory);
    vi.mocked(BestPriceClient.getCurrentProductData).mockResolvedValue(mockBestPriceData);
    vi.mocked(ShopflixClient.getCurrentProductData).mockResolvedValue(mockShopflixData);

    // Act
    decorator = new PriceCheckerDecorator(mockState);
    await decorator.execute();
    await flushPromises();

    // Assert
    const badges = [
      '.price-display-store-action',
      '.price-display-bestprice-action',
      '.price-display-shopflix-action',
    ].map((selector) => document.querySelector(`${selector} .price-difference-badge`));
    expect(badges.map((badge) => badge?.textContent)).toEqual(['-6,00€', '-8,00€', '-12,00€']);
  });

  it('renders no pill on an option that costs the same as Skroutz', async () => {
    // Arrange — store 104,00€ matches Buy through Skroutz 104,00€
    const matchingProductData: ProductPriceData = {
      ...mockProductPriceData,
      buyThroughStore: {
        ...mockProductPriceData.buyThroughStore,
        totalPrice: mockProductPriceData.buyThroughSkroutz.totalPrice,
      },
    };
    vi.mocked(SkroutzClient.getCurrentProductData).mockResolvedValue(matchingProductData);
    vi.mocked(SkroutzClient.getPriceHistory).mockResolvedValue(mockPriceHistory);
    vi.mocked(BestPriceClient.getCurrentProductData).mockResolvedValue(mockBestPriceData);
    vi.mocked(ShopflixClient.isSupported).mockReturnValue(false);

    // Act
    decorator = new PriceCheckerDecorator(mockState);
    await decorator.execute();
    await flushPromises();

    // Assert
    expect(
      document.querySelector('.price-display-store-action .price-difference-badge'),
    ).toBeNull();
    expect(document.querySelectorAll('.price-difference-badge')).toHaveLength(1);
  });

  it('turns the store pill red when the store total is pricier', async () => {
    // Arrange — store 110,00€ vs Buy through Skroutz 104,00€
    const pricierProductData: ProductPriceData = {
      ...mockProductPriceData,
      buyThroughStore: { ...mockProductPriceData.buyThroughStore, totalPrice: 110 },
    };
    vi.mocked(SkroutzClient.getCurrentProductData).mockResolvedValue(pricierProductData);
    vi.mocked(SkroutzClient.getPriceHistory).mockResolvedValue(mockPriceHistory);
    vi.mocked(BestPriceClient.getCurrentProductData).mockResolvedValue(mockBestPriceData);
    vi.mocked(ShopflixClient.isSupported).mockReturnValue(false);

    // Act
    decorator = new PriceCheckerDecorator(mockState);
    await decorator.execute();
    await flushPromises();

    // Assert
    const badge = document.querySelector('.price-display-store-action .price-difference-badge');
    expect(badge?.classList.contains('price-difference-badge--pricier')).toBe(true);
    expect(badge?.textContent).toBe('+6,00€');
  });

  it('clicking the store price reuses the store navigation behavior', async () => {
    vi.mocked(SkroutzClient.getCurrentProductData).mockResolvedValue(mockProductPriceData);
    vi.mocked(SkroutzClient.getPriceHistory).mockResolvedValue(mockPriceHistory);
    vi.mocked(BestPriceClient.getCurrentProductData).mockResolvedValue(mockBestPriceData);

    const sliderToggleButton = document.createElement('button');
    sliderToggleButton.className = 'alternative-option-wrapper btn-reset';
    const sliderClickSpy = vi.spyOn(sliderToggleButton, 'click');
    document.body.appendChild(sliderToggleButton);

    const firstTarget = document.createElement('div');
    firstTarget.id = 'shop-202';
    const secondTarget = document.createElement('div');
    secondTarget.id = 'shop-202';
    const scrollIntoViewSpy = vi.fn();
    secondTarget.scrollIntoView = scrollIntoViewSpy;
    document.body.appendChild(firstTarget);
    document.body.appendChild(secondTarget);

    decorator = new PriceCheckerDecorator(mockState);
    await decorator.execute();
    await flushPromises();

    vi.useFakeTimers();

    const storeAction = document.querySelector(
      '.price-display-store-action',
    ) as HTMLButtonElement | null;
    expect(storeAction).not.toBeNull();

    storeAction?.click();
    vi.advanceTimersByTime(300);

    expect(sliderClickSpy).toHaveBeenCalledTimes(1);
    expect(scrollIntoViewSpy).toHaveBeenCalledTimes(1);
    expect(secondTarget.classList.contains('lowest-price-store-highlight')).toBe(true);
  });

  it('shows the not-available link and opens the native pickup modal on click', async () => {
    vi.mocked(SkroutzClient.getCurrentProductData).mockResolvedValue({
      ...mockProductPriceData,
      storeAvailability: {
        availableShopCount: 1,
        cities: ['Athens'],
        userCity: 'Heraklion',
        userZip: '71305',
        matchingCities: [],
        cityShopMap: {
          Athens: [202],
        },
        orderCities: [],
        orderCityShopMap: {},
        onlineOnlyShopCount: 0,
      },
    });
    vi.mocked(SkroutzClient.getPriceHistory).mockResolvedValue(mockPriceHistory);
    vi.mocked(BestPriceClient.getCurrentProductData).mockResolvedValue(mockBestPriceData);

    const nativePickupButton = document.createElement('button');
    nativePickupButton.setAttribute(
      'data-sku-page--offerings--offering-service-props-value',
      JSON.stringify({ service: 'store_pickup', zip: '71305' }),
    );
    document.body.appendChild(nativePickupButton);
    const nativeClickSpy = vi.spyOn(nativePickupButton, 'click');

    decorator = new PriceCheckerDecorator(mockState);
    await decorator.execute();
    await flushPromises();

    const status = document.querySelector('.store-availability-status') as HTMLElement | null;
    const moreLink = document.querySelector(
      '.store-availability-more-link',
    ) as HTMLButtonElement | null;

    expect(status).not.toBeNull();
    expect(status?.classList.contains('not-available')).toBe(true);
    expect(status?.textContent).toContain('Not available in your area.');
    expect(document.querySelectorAll('.store-location-entry').length).toBe(0);
    expect(moreLink).not.toBeNull();
    expect(moreLink?.textContent).toContain('See where you can pick it up.');

    moreLink?.click();
    expect(nativeClickSpy).toHaveBeenCalledTimes(1);
  });

  it('shows a pickup hint and opens the native pickup modal when the user is not logged in', async () => {
    // A bare header city without a connected zip is treated as "not logged in":
    // matching cities must be ignored and only the native-loading hint shown.
    vi.mocked(SkroutzClient.getCurrentProductData).mockResolvedValue({
      ...mockProductPriceData,
      storeAvailability: {
        availableShopCount: 1,
        cities: ['Athens'],
        userCity: 'Thessaloniki',
        userZip: undefined,
        matchingCities: ['Thessaloniki'],
        cityShopMap: {
          Athens: [202],
        },
        orderCities: [],
        orderCityShopMap: {},
        onlineOnlyShopCount: 0,
      },
    });
    vi.mocked(SkroutzClient.getPriceHistory).mockResolvedValue(mockPriceHistory);
    vi.mocked(BestPriceClient.getCurrentProductData).mockResolvedValue(mockBestPriceData);

    const nativePickupButton = document.createElement('button');
    nativePickupButton.setAttribute(
      'data-sku-page--offerings--offering-service-props-value',
      JSON.stringify({ service: 'store_pickup', zip: '10563' }),
    );
    document.body.appendChild(nativePickupButton);
    const nativeClickSpy = vi.spyOn(nativePickupButton, 'click');

    decorator = new PriceCheckerDecorator(mockState);
    await decorator.execute();
    await flushPromises();

    const status = document.querySelector('.store-availability-status') as HTMLElement | null;
    const loadLink = document.querySelector(
      '.store-availability-more-link',
    ) as HTMLButtonElement | null;

    expect(status).not.toBeNull();
    expect(status?.textContent).toContain(
      'This product is available for store pickup in selected cities.',
    );
    expect(loadLink).not.toBeNull();
    expect(loadLink?.textContent).toContain('See where you can pick it up.');
    // The unconnected hint must not render the detailed store chip list.
    expect(document.querySelector('.store-availability-shops-list')).toBeNull();
    expect(document.querySelectorAll('.store-location-entry').length).toBe(0);

    loadLink?.click();
    expect(nativeClickSpy).toHaveBeenCalledTimes(1);
  });

  it('hides the store availability row when the user is not logged in and there is no pickup data', async () => {
    vi.mocked(SkroutzClient.getCurrentProductData).mockResolvedValue({
      ...mockProductPriceData,
      storeAvailability: {
        availableShopCount: 1,
        cities: [],
        userCity: undefined,
        userZip: undefined,
        matchingCities: [],
        cityShopMap: {},
        orderCities: [],
        orderCityShopMap: {},
        onlineOnlyShopCount: 0,
      },
    });
    vi.mocked(SkroutzClient.getPriceHistory).mockResolvedValue(mockPriceHistory);
    vi.mocked(BestPriceClient.getCurrentProductData).mockResolvedValue(mockBestPriceData);

    decorator = new PriceCheckerDecorator(mockState);
    await decorator.execute();
    await flushPromises();

    expect(document.querySelector('.store-availability-outline')).toBeNull();
    expect(document.querySelector('.store-availability-status')).toBeNull();
    expect(document.querySelector('.store-availability-shops-list')).toBeNull();
  });

  it('keeps the store CTA as a button when BestPrice is unavailable', async () => {
    vi.mocked(SkroutzClient.getCurrentProductData).mockResolvedValue(mockProductPriceData);
    vi.mocked(SkroutzClient.getPriceHistory).mockResolvedValue(mockPriceHistory);
    vi.mocked(BestPriceClient.getCurrentProductData).mockResolvedValue(undefined);

    decorator = new PriceCheckerDecorator(mockState);
    await decorator.execute();
    await flushPromises();

    const storeAction = document.querySelector(
      '.price-display-store-action',
    ) as HTMLButtonElement | null;
    const unavailableStatus = document.querySelector(
      '.bestprice-unavailable',
    ) as HTMLDivElement | null;
    const priceRow = document.querySelector('.price-display-row') as HTMLDivElement | null;

    expect(priceRow).not.toBeNull();
    expect(storeAction).not.toBeNull();
    expect(storeAction?.tagName).toBe('BUTTON');
    expect(storeAction?.textContent).toContain('Buy through store');
    expect(unavailableStatus).not.toBeNull();
    expect(unavailableStatus?.textContent).toContain('BestPrice not available');
    expect(priceRow?.lastElementChild).toBe(unavailableStatus);
    expect(document.querySelector('.price-display-shipping-note')).toBeNull();
  });

  it('notes possible delivery costs in the shipping slot when BestPrice has no shipping cost', async () => {
    vi.mocked(SkroutzClient.getCurrentProductData).mockResolvedValue(mockProductPriceData);
    vi.mocked(SkroutzClient.getPriceHistory).mockResolvedValue(mockPriceHistory);
    vi.mocked(BestPriceClient.getCurrentProductData).mockResolvedValue({
      ...mockBestPriceData,
      shippingCost: undefined,
      totalPrice: undefined,
    });

    decorator = new PriceCheckerDecorator(mockState);
    await decorator.execute();
    await flushPromises();

    const bestPriceBadge = document.querySelector('.bestprice-badge') as HTMLAnchorElement | null;
    const shippingNote = bestPriceBadge?.querySelector(
      '.price-display-shipping-note',
    ) as HTMLDivElement | null;

    expect(shippingNote).not.toBeNull();
    expect(shippingNote?.textContent).toBe('(Delivery costs may apply)');
    expect(shippingNote?.classList.contains('shipping-cost-text')).toBe(true);
    expect(shippingNote?.classList.contains('price-display-action-positive')).toBe(true);
    expect(bestPriceBadge?.querySelectorAll('.shipping-cost-text').length).toBe(1);
  });

  it('styles each offer independently against the Skroutz total price', async () => {
    vi.mocked(SkroutzClient.getCurrentProductData).mockResolvedValue({
      ...mockProductPriceData,
      buyThroughStore: {
        ...mockProductPriceData.buyThroughStore,
        price: 108,
        shippingCost: 2,
        totalPrice: 110,
      },
    });
    vi.mocked(SkroutzClient.getPriceHistory).mockResolvedValue(mockPriceHistory);
    vi.mocked(BestPriceClient.getCurrentProductData).mockResolvedValue({
      ...mockBestPriceData,
      price: 99,
      shippingCost: 1,
      totalPrice: 100,
    });

    decorator = new PriceCheckerDecorator(mockState);
    await decorator.execute();
    await flushPromises();

    const storeAction = document.querySelector(
      '.price-display-store-action',
    ) as HTMLButtonElement | null;
    const bestPriceBadge = document.querySelector('.bestprice-badge') as HTMLAnchorElement | null;

    expect(storeAction?.classList.contains('price-display-action-negative')).toBe(true);
    expect(
      storeAction
        ?.querySelector('.price-indicator-price')
        ?.classList.contains('price-display-action-negative'),
    ).toBe(true);
    expect(bestPriceBadge?.classList.contains('price-display-action-positive')).toBe(true);
    expect(
      bestPriceBadge
        ?.querySelector('.price-indicator-price')
        ?.classList.contains('price-display-action-positive'),
    ).toBe(true);
  });

  it('describes BestPrice against the Buy through Skroutz total in the analysis text', async () => {
    vi.mocked(SkroutzClient.getCurrentProductData).mockResolvedValue({
      ...mockProductPriceData,
      buyThroughSkroutz: {
        price: 718.89,
        shippingCost: 0,
        totalPrice: 718.89,
        shopId: 101,
      },
      buyThroughStore: {
        price: 667,
        shippingCost: 0,
        totalPrice: 667,
        shopId: 202,
      },
    });
    vi.mocked(SkroutzClient.getPriceHistory).mockResolvedValue(mockPriceHistory);
    vi.mocked(BestPriceClient.getCurrentProductData).mockResolvedValue({
      ...mockBestPriceData,
      price: 659,
      shippingCost: 4.9,
      totalPrice: 663.9,
    });

    decorator = new PriceCheckerDecorator(mockState);
    await decorator.execute();
    await flushPromises();

    const comparisonText = document.querySelector('.bestprice-comparison-text');
    const analysisRows = document.querySelectorAll('.analysis-metric-row');
    const storeText = analysisRows[0];

    expect(storeText?.textContent).toContain('Buying through "Store" is 51.89€ cheaper');
    expect(storeText?.textContent).toContain('718.89€ - 667.00€');
    expect(comparisonText?.textContent).toContain('Buying through "BestPrice" is 54.99€ cheaper');
    expect(comparisonText?.textContent).toContain('718.89€ - 663.90€');
    expect(comparisonText?.textContent).not.toContain('667.00€ - 663.90€');
  });

  it('states the minimum difference threshold in euros rather than a percentage', async () => {
    // Arrange - 104€ vs 98€ leaves a 6€ gap, past the 5€ threshold
    mockState.minimumPriceDifference = 5;
    vi.mocked(SkroutzClient.getCurrentProductData).mockResolvedValue(mockProductPriceData);
    vi.mocked(SkroutzClient.getPriceHistory).mockResolvedValue(mockPriceHistory);
    vi.mocked(BestPriceClient.getCurrentProductData).mockResolvedValue(mockBestPriceData);

    // Act
    decorator = new PriceCheckerDecorator(mockState);
    await decorator.execute();
    await flushPromises();

    // Assert
    const thresholdText = document.querySelector('.minimum-price-difference-text');
    expect(thresholdText).not.toBeNull();
    expect(thresholdText?.textContent).toContain('above 5.00€');
    expect(thresholdText?.textContent).toContain('Δ 6.00€');
    expect(thresholdText?.textContent).not.toContain('%');
  });

  it('does not touch the page when the price checker is disabled', async () => {
    // Arrange
    mockState.priceCheckerEnabled = false;
    vi.mocked(SkroutzClient.getCurrentProductData).mockResolvedValue(mockProductPriceData);
    vi.mocked(SkroutzClient.getPriceHistory).mockResolvedValue(mockPriceHistory);
    vi.mocked(BestPriceClient.getCurrentProductData).mockResolvedValue(mockBestPriceData);

    // Act
    decorator = new PriceCheckerDecorator(mockState);
    await decorator.execute();
    await flushPromises();

    // Assert
    expect(SkroutzClient.getCurrentProductData).not.toHaveBeenCalled();
    expect(BestPriceClient.getCurrentProductData).not.toHaveBeenCalled();
    expect(document.querySelector('.price-checker-stack')).toBeNull();
    expect(document.querySelector('.price-checker-outline')).toBeNull();
    expect(document.querySelector('.shipping-cost-text')).toBeNull();
  });

  it('removes every rendered artifact when destroyed', async () => {
    // Arrange
    vi.mocked(SkroutzClient.getCurrentProductData).mockResolvedValue(mockProductPriceData);
    vi.mocked(SkroutzClient.getPriceHistory).mockResolvedValue(mockPriceHistory);
    vi.mocked(BestPriceClient.getCurrentProductData).mockResolvedValue(mockBestPriceData);

    decorator = new PriceCheckerDecorator(mockState);
    await decorator.execute();
    await flushPromises();

    expect(document.querySelector('.price-checker-outline')).not.toBeNull();
    expect(document.querySelector('.shipping-cost-text')).not.toBeNull();
    expect(document.querySelector('.skroutz-breakdown-inline')).not.toBeNull();

    // Act
    decorator.destroy();

    // Assert
    expect(document.querySelector('.price-checker-outline')).toBeNull();
    expect(document.querySelector('.price-checker-stack')).toBeNull();
    expect(document.querySelector('.shipping-cost-text')).toBeNull();
    expect(document.querySelector('.skroutz-breakdown-inline')).toBeNull();
  });

  it('renders again when executed after being destroyed', async () => {
    // Arrange
    vi.mocked(SkroutzClient.getCurrentProductData).mockResolvedValue(mockProductPriceData);
    vi.mocked(SkroutzClient.getPriceHistory).mockResolvedValue(mockPriceHistory);
    vi.mocked(BestPriceClient.getCurrentProductData).mockResolvedValue(mockBestPriceData);

    decorator = new PriceCheckerDecorator(mockState);
    await decorator.execute();
    await flushPromises();
    decorator.destroy();
    expect(document.querySelector('.price-checker-outline')).toBeNull();

    // Act
    await decorator.execute();
    await flushPromises();

    // Assert
    expect(document.querySelector('.price-checker-outline')).not.toBeNull();
  });

  it('closes the card with the review and support promotion band', async () => {
    // Arrange
    const productDataDeferred = createDeferred<ProductPriceData>();
    vi.mocked(SkroutzClient.getCurrentProductData).mockReturnValue(productDataDeferred.promise);
    vi.mocked(SkroutzClient.getPriceHistory).mockResolvedValue(mockPriceHistory);
    vi.mocked(BestPriceClient.getCurrentProductData).mockResolvedValue(mockBestPriceData);

    decorator = new PriceCheckerDecorator(mockState);
    const executePromise = decorator.execute();

    await flushPromises();

    // Assert - the skeleton mirrors the final layout
    const skeletonCard = document.querySelector('.price-checker-outline');
    expect(skeletonCard?.lastElementChild?.classList.contains('own-promotion')).toBe(true);

    // Act
    productDataDeferred.resolve(mockProductPriceData);
    await executePromise;
    await flushPromises();

    // Assert
    const card = document.querySelector('.price-checker-outline');
    const promotion = card?.lastElementChild;
    expect(promotion?.classList.contains('own-promotion')).toBe(true);
    expect(promotion?.querySelector('.own-promotion-left')).not.toBeNull();
    expect(promotion?.querySelector('.buy-me-coffee')).not.toBeNull();
  });
});
