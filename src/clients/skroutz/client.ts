// import { removeOutliers } from '../../common/functions/removeOutliers';
import { PriceChart, PriceChartValue, ProductData, Store } from './types';

type PriceData = {
  price: number;
  shippingCost: number;
  totalPrice: number;
  shopId: number;
};

export type StoreAvailabilityData = {
  cities: string[];
  userCity?: string;
  matchingCities: string[];
  cityShopMap: Record<string, number[]>;
};

export type ProductPriceData = {
  buyThroughSkroutz: PriceData;
  buyThroughStore: PriceData;
  storeAvailability: StoreAvailabilityData;
};

export type ProductPriceHistory = {
  minimumPrice: number;
  maximumPrice: number;
  allPrices: PriceChartValue[];
  sixMonthPrices: PriceChartValue[];
};

export class SkroutzClient {
  private static readonly productDataCache = new Map<string, Promise<ProductData>>();

  public static async getCurrentProductData(): Promise<ProductPriceData> {
    try {
      const productCode = this.getSku();
      const skroutzRawPrice = this.getSkroutzRawPrice();

      const productData = await this.getProductData(productCode);
      const userCity = this.getUserCity();
      const storeAvailability = await this.getStoreAvailability(productData, userCity);

      return {
        buyThroughSkroutz: this.getSkroutzPriceData(productData, skroutzRawPrice),
        buyThroughStore: this.getStorePriceData(productData),
        storeAvailability,
      };
    } catch (error) {
      console.error('There was a problem with the fetch operation:', error);
      throw error;
    }
  }

  public static async getCurrentProductNames(): Promise<string[]> {
    try {
      const productCode = this.getSku();
      const productData = await this.getProductData(productCode);

      return this.extractProductNames(productData);
    } catch (error) {
      console.warn('Failed to fetch Skroutz product names:', error);

      return [];
    }
  }

  public static async getPriceHistory(): Promise<ProductPriceHistory> {
    try {
      const productCode = this.getSku();
      const priceGraphData = await this.getPriceGraphData(productCode);

      const allPrices = priceGraphData.min_price.graphData['all'].values
        .filter((value) => value.value > 0)
        .map((v) => ({ ...v, timestamp: v.timestamp * 1000 }));
      const sixMonthPrices = priceGraphData.min_price.graphData['6_months'].values
        .filter((value) => value.value > 0)
        .map((v) => ({ ...v, timestamp: v.timestamp * 1000 }));

      const allFilteredPrices = allPrices; //removeOutliers(allPrices);
      const sixFilteredPrices = sixMonthPrices; //removeOutliers(sixMonthPrices);

      const allPriceAmounts = allFilteredPrices.map((v) => v.value);

      return {
        minimumPrice: Math.min(...allPriceAmounts),
        maximumPrice: Math.max(...allPriceAmounts),
        allPrices: allFilteredPrices,
        sixMonthPrices: sixFilteredPrices,
      };
    } catch (error) {
      console.error('There was a problem with the fetch operation:', error);
      throw error;
    }
  }

  private static getSkroutzRawPrice(): number {
    // Try new buybox structure first
    const buybox = document.querySelector('article.buybox');
    if (buybox) {
      const finalPrice = buybox.querySelector('.final-price');
      const intEl = finalPrice?.querySelector('.integer-part');
      const decEl = finalPrice?.querySelector('.decimal-part');
      let integerPart = intEl?.textContent?.trim() ?? '';
      let decimalPart = decEl?.textContent?.trim() ?? '';

      // Normalize: keep only digits, remove thousands separators/spaces
      integerPart = integerPart.replace(/[^\d]/g, '');
      decimalPart = decimalPart.replace(/[^\d]/g, '');
      if (!decimalPart) decimalPart = '00';

      if (integerPart) {
        const priceText = `${integerPart}.${decimalPart}`;
        const price = parseFloat(priceText);
        if (!Number.isNaN(price)) {
          return price;
        }
      }
      // As a fallback, try to parse the whole final-price text content
      const whole = finalPrice?.textContent?.replace(/[^\d,.]/g, '') ?? '';
      // Replace comma with dot for decimal
      const normalized = whole.replace(/\./g, '').replace(/,(\d{2})$/, '.$1');
      const fallback = parseFloat(normalized);
      if (!Number.isNaN(fallback)) return fallback;
    }

    // Fallback to legacy offering-card structure
    const offeringCard = document.querySelector('article.offering-card');
    const priceElement = offeringCard?.querySelector('div.price');
    if (priceElement) {
      const integerPart = priceElement.firstChild?.textContent?.trim() || '';
      const decimalPart =
        priceElement.querySelector('span.comma + span')?.textContent?.trim() || '00';
      const priceText = integerPart.replace(/\./g, '') + '.' + decimalPart.replace(/[^\d]/g, '');
      const price = parseFloat(priceText);
      if (!Number.isNaN(price)) {
        return price;
      }
    }

    throw new Error('Failed to fetch/parse current product price');
  }

  private static getSku(): string {
    const metaTag = document.querySelector('meta[itemprop="sku"]') as HTMLMetaElement | null;

    if (metaTag) {
      return metaTag.content;
    }

    const urlMatch = window.location.pathname.match(/\/s\/(\d+)/);
    if (urlMatch && urlMatch[1]) {
      return urlMatch[1];
    }

    throw new Error('Failed to fetch product SKU');
  }

  private static async getProductData(productCode: string): Promise<ProductData> {
    const cachedProductData = this.productDataCache.get(productCode);
    if (cachedProductData) {
      return await cachedProductData;
    }

    const productDataPromise = (async (): Promise<ProductData> => {
      const response = await fetch(`https://www.skroutz.gr/s/${productCode}/filter_products.json`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(
          `Failed to fetch (HTTP: ${response.status}) price data for product with SKU ${productCode}`,
        );
      }

      return (await response.json()) as ProductData;
    })();

    this.productDataCache.set(productCode, productDataPromise);

    try {
      return await productDataPromise;
    } catch (error) {
      this.productDataCache.delete(productCode);
      throw error;
    }
  }

  private static extractProductNames(productData: ProductData): string[] {
    const productNameCounts = new Map<string, number>();

    Object.values(productData.product_cards).forEach((productCard) => {
      productCard.products.forEach((product) => {
        const name = product.name.trim();
        if (!name) {
          return;
        }

        productNameCounts.set(name, (productNameCounts.get(name) ?? 0) + 1);
      });
    });

    return [...productNameCounts.entries()]
      .sort((left, right) => right[1] - left[1] || right[0].length - left[0].length)
      .map(([name]) => name);
  }

  private static async getPriceGraphData(productCode: string): Promise<PriceChart> {
    const response = await fetch(
      `https://www.skroutz.gr/s/${productCode}/reskroutz/price_graph.json?shipping_country=GR&currency=EUR`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      },
    );

    if (!response.ok) {
      throw new Error(
        `Failed to fetch (HTTP: ${response.status}) price data for product with SKU ${productCode}`,
      );
    }

    return (await response.json()) as PriceChart;
  }

  private static async getStoreData(storeIds: number[]): Promise<Store[]> {
    const response = await fetch('https://www.skroutz.gr/s/product_cards_nearest_location.json', {
      body: JSON.stringify({ store_ids: storeIds.map((id) => id.toString()) }),
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(
        `Failed to fetch (HTTP: ${response.status}) store data for store IDs: ${storeIds.join(', ')}`,
      );
    }

    return (await response.json()) as Store[];
  }

  private static async getStoreAvailability(
    productData: ProductData,
    userCity?: string,
  ): Promise<StoreAvailabilityData> {
    const { cities: domCities, cityShopMap: domCityShopMap } = this.getStoreAvailabilityFromDom();
    if (domCities.length > 0) {
      return {
        cities: domCities,
        userCity,
        matchingCities: this.getMatchingCities(domCities, userCity),
        cityShopMap: domCityShopMap,
      };
    }

    const storeIds = Array.from(
      new Set(
        Object.values(productData.product_cards)
          .map((card) => card.shop_id)
          .filter((id) => id > 0),
      ),
    ).sort((left, right) => left - right);

    if (storeIds.length === 0) {
      return {
        cities: [],
        userCity,
        matchingCities: [],
        cityShopMap: {},
      };
    }

    try {
      const stores = await this.getStoreData(storeIds);
      const cities = this.extractUniqueCities(stores);
      const cityShopMap = this.buildCityShopMapFromApi(stores, storeIds);

      return {
        cities,
        userCity,
        matchingCities: this.getMatchingCities(cities, userCity),
        cityShopMap,
      };
    } catch (error) {
      console.warn('Failed to fetch store availability data:', error);

      return {
        cities: [],
        userCity,
        matchingCities: [],
        cityShopMap: {},
      };
    }
  }

  private static buildCityShopMapFromApi(
    stores: Store[],
    storeIds: number[],
  ): Record<string, number[]> {
    const cityShopMap: Record<string, number[]> = {};
    stores.forEach((store, index) => {
      const city = store.store_location_address?.city?.trim();
      const shopId = storeIds[index];
      if (!city || shopId === undefined) return;
      if (!cityShopMap[city]) {
        cityShopMap[city] = [];
      }
      if (!cityShopMap[city].includes(shopId)) {
        cityShopMap[city].push(shopId);
      }
    });
    return cityShopMap;
  }

  private static getStoreAvailabilityFromDom(): {
    cities: string[];
    cityShopMap: Record<string, number[]>;
  } {
    const cityData = new Map<string, { displayCity: string; shopIds: number[] }>();
    const offerCards = Array.from(document.querySelectorAll('#prices .product-card-redesigned'));

    offerCards.forEach((offerCard) => {
      const merchantContent = offerCard.querySelector('.merchant-box-bottom-content');
      if (!merchantContent) {
        return;
      }

      const hasStorePickup = !!merchantContent.querySelector('.store-pickup');
      if (!hasStorePickup) {
        return;
      }

      const locationText = merchantContent.querySelector('.location span')?.textContent?.trim();
      const city = this.extractCityFromLocation(locationText);
      if (!city) {
        return;
      }

      const normalizedCity = this.normalizeLocation(city);
      if (!cityData.has(normalizedCity)) {
        cityData.set(normalizedCity, { displayCity: city, shopIds: [] });
      }

      const idAttr = (offerCard as HTMLElement).id || offerCard.closest('[id^="shop-"]')?.id || '';
      const shopIdMatch = idAttr.match(/^shop-(\d+)$/);
      if (shopIdMatch) {
        const shopId = parseInt(shopIdMatch[1], 10);
        const entry = cityData.get(normalizedCity)!;
        if (!entry.shopIds.includes(shopId)) {
          entry.shopIds.push(shopId);
        }
      }
    });

    const sorted = Array.from(cityData.values()).sort((a, b) =>
      a.displayCity.localeCompare(b.displayCity, 'el'),
    );

    const cities = sorted.map((e) => e.displayCity);
    const cityShopMap: Record<string, number[]> = Object.fromEntries(
      sorted.map((e) => [e.displayCity, e.shopIds]),
    );

    return { cities, cityShopMap };
  }

  private static getUserCity(): string | undefined {
    const locationElement = document.querySelector(
      '.header-user-actions .country-picker-text.js-cp-link, .country-picker-text.js-cp-link',
    );

    const locationText = locationElement?.textContent;
    if (!locationText) {
      return undefined;
    }

    const sanitized = locationText
      .replace(/\s+/g, ' ')
      .trim()
      .replace(/\s+\d{5}$/, '');
    return sanitized || undefined;
  }

  private static extractUniqueCities(stores: Store[]): string[] {
    const cityMap = new Map<string, string>();

    stores.forEach((store) => {
      const city = store.store_location_address?.city?.trim();
      if (!city) {
        return;
      }

      const normalizedCity = this.normalizeLocation(city);
      if (!cityMap.has(normalizedCity)) {
        cityMap.set(normalizedCity, city);
      }
    });

    return Array.from(cityMap.values()).sort((left, right) => left.localeCompare(right, 'el'));
  }

  private static extractCityFromLocation(locationText?: string): string | undefined {
    if (!locationText) {
      return undefined;
    }

    const sanitized = locationText.replace(/\s+/g, ' ').trim();
    if (!sanitized) {
      return undefined;
    }

    return sanitized.split(',')[0]?.trim() || undefined;
  }

  private static getMatchingCities(cities: string[], userCity?: string): string[] {
    if (!userCity) {
      return [];
    }

    const normalizedUserCity = this.normalizeLocation(userCity);

    return cities.filter((city) => {
      const normalizedCity = this.normalizeLocation(city);
      return (
        normalizedUserCity.includes(normalizedCity) || normalizedCity.includes(normalizedUserCity)
      );
    });
  }

  private static normalizeLocation(value: string): string {
    return value
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/\s+/g, ' ')
      .trim()
      .toLocaleLowerCase('el-GR');
  }

  private static getSkroutzPriceData(productData: ProductData, skroutzRawPrice: number): PriceData {
    const productCards = productData.product_cards;

    const firstCard = Object.values(productCards).find(
      (card) => card.raw_price === skroutzRawPrice,
    );
    if (!firstCard) {
      throw new Error('No product cards found');
    }

    if (!firstCard) {
      throw new Error('No sponsored product cards found');
    }

    return {
      price: firstCard.raw_price,
      shippingCost: firstCard.shipping_cost,
      totalPrice: firstCard.raw_price + firstCard.shipping_cost,
      shopId: firstCard.shop_id,
    };
  }

  private static getStorePriceData(productData: ProductData): PriceData {
    const productCards = productData.product_cards;

    let lowestStorePrice = Number.MAX_VALUE;
    let lowestStoreProductPrice = Number.MAX_VALUE;
    let lowestStoreShippingCost = Number.MAX_VALUE;
    let storeShopId = 0;

    Object.values(productCards).forEach((card) => {
      card.raw_price =
        card.ecommerce_final_price !== 0 ? card.ecommerce_final_price : card.raw_price;
      const totalCost = card.raw_price + card.shipping_cost;
      if (totalCost < lowestStorePrice) {
        lowestStorePrice = totalCost;
        lowestStoreProductPrice = card.raw_price;
        lowestStoreShippingCost = card.shipping_cost;
        storeShopId = card.shop_id;
      }
    });

    return {
      price: lowestStoreProductPrice,
      shippingCost: lowestStoreShippingCost,
      totalPrice: lowestStorePrice,
      shopId: storeShopId,
    };
  }
}
