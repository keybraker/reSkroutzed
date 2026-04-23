// import { removeOutliers } from '../../common/functions/removeOutliers';
import { PriceChart, PriceChartValue, ProductData, Store } from './types';

type PriceData = {
  price: number;
  shippingCost: number;
  totalPrice: number;
  shopId: number;
};

export type StoreAvailabilityData = {
  availableShopCount: number;
  cities: string[];
  userCity?: string;
  matchingCities: string[];
  cityShopMap: Record<string, number[]>;
  orderCities: string[];
  orderCityShopMap: Record<string, number[]>;
  onlineOnlyShopCount: number;
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

type DomStoreAvailability = {
  cities: string[];
  cityShopMap: Record<string, number[]>;
  orderCities: string[];
  orderCityShopMap: Record<string, number[]>;
  hasExplicitNoStoreCitiesMessage: boolean;
};

export class SkroutzClient {
  private static readonly productDataCache = new Map<string, Promise<ProductData>>();

  private static pricesMatch(left: number, right: number): boolean {
    return Math.round(left * 100) === Math.round(right * 100);
  }

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

    return this.normalizeStoreResponse(await response.json());
  }

  private static async getRefreshShowDocument(productCode: string): Promise<Document> {
    const configuredPath = document
      .querySelector('[data-sku-page--index-refresh-show-url-value]')
      ?.getAttribute('data-sku-page--index-refresh-show-url-value');
    const refreshShowPath = configuredPath?.trim() || `/s/${productCode}/refresh_show`;

    const response = await fetch(refreshShowPath, {
      method: 'GET',
      headers: {
        'X-Requested-With': 'XMLHttpRequest',
      },
    });

    if (!response.ok) {
      throw new Error(
        `Failed to fetch (HTTP: ${response.status}) refresh_show data for product with SKU ${productCode}`,
      );
    }

    const html = await response.text();
    return new DOMParser().parseFromString(html, 'text/html');
  }

  private static async getStoreAvailability(
    productData: ProductData,
    userCity?: string,
  ): Promise<StoreAvailabilityData> {
    const productCode = this.getSku();
    const storeIds = this.getUniqueShopIds(productData);
    const {
      cities: domCities,
      cityShopMap: domCityShopMap,
      orderCities: domOrderCities,
      orderCityShopMap: domOrderCityShopMap,
      hasExplicitNoStoreCitiesMessage,
    } = this.getStoreAvailabilityFromDom();

    if (storeIds.length === 0) {
      return {
        availableShopCount: 0,
        cities: [],
        userCity,
        matchingCities: [],
        cityShopMap: {},
        orderCities: [],
        orderCityShopMap: {},
        onlineOnlyShopCount: 0,
      };
    }

    if (hasExplicitNoStoreCitiesMessage) {
      return {
        availableShopCount: storeIds.length,
        cities: [],
        userCity,
        matchingCities: [],
        cityShopMap: {},
        orderCities: domOrderCities,
        orderCityShopMap: domOrderCityShopMap,
        onlineOnlyShopCount: storeIds.length,
      };
    }

    try {
      const stores = await this.getStoreData(storeIds);
      const apiCities = this.extractUniqueCities(stores);
      const apiCityShopMap = this.buildCityShopMapFromApi(stores, storeIds);
      const onlineOnlyShopCount = this.getOnlineOnlyShopCount(stores, storeIds.length);

      let finalCities = domCities;
      let finalCityShopMap = domCityShopMap;

      let finalOrderCities = apiCities.filter(
        (c) => !domCities.some((dc) => this.normalizeLocation(dc) === this.normalizeLocation(c)),
      );

      let finalOrderCityShopMap = Object.fromEntries(
        Object.entries(apiCityShopMap).filter(
          ([c]) =>
            !domCities.some((dc) => this.normalizeLocation(dc) === this.normalizeLocation(c)),
        ),
      );

      let finalOnlineCount = onlineOnlyShopCount;
      const hasNoDomLocationData = domCities.length === 0 && domOrderCities.length === 0;
      const initialDistinctCityCount = new Set(
        [...domCities, ...apiCities].map((city) => this.normalizeLocation(city)),
      ).size;
      const shouldFetchRefreshShow =
        hasNoDomLocationData ||
        apiCities.length === 0 ||
        finalOnlineCount > 0 ||
        (storeIds.length > 1 && initialDistinctCityCount <= 1);

      if (shouldFetchRefreshShow) {
        // If API did not return cities, or if it missed some shops (online only count > 0),
        // try to use the DOM buybox as a fallback.
        if (apiCities.length === 0 && domOrderCities.length > 0) {
          finalCities = domCities;
          finalCityShopMap = domCityShopMap;
          finalOrderCities = domOrderCities;
          finalOrderCityShopMap = domOrderCityShopMap;
          finalOnlineCount = Math.max(storeIds.length - this.countMappedShops(domCityShopMap), 0);
        }

        // Try fetching refresh_show to get the entire drawer HTML and its full location list.
        try {
          const refreshShowDocument = await this.getRefreshShowDocument(productCode);
          const refreshShowAvailability = this.getStoreAvailabilityFromDom(refreshShowDocument);

          if (
            refreshShowAvailability.cities.length > 0 ||
            refreshShowAvailability.orderCities.length > 0
          ) {
            // Merge refreshShow data with whatever we already collected
            [...refreshShowAvailability.cities, ...refreshShowAvailability.orderCities].forEach(
              (city) => {
                const pShops = refreshShowAvailability.cityShopMap[city] || [];
                const oShops = refreshShowAvailability.orderCityShopMap[city] || [];
                const norm = this.normalizeLocation(city);

                // Add to pickup
                if (pShops.length > 0) {
                  if (!finalCities.find((c) => this.normalizeLocation(c) === norm)) {
                    finalCities.push(city);
                    finalCityShopMap[city] = [];
                  }
                  const existingCity = finalCities.find((c) => this.normalizeLocation(c) === norm)!;
                  const set = new Set([...(finalCityShopMap[existingCity] || []), ...pShops]);
                  finalCityShopMap[existingCity] = Array.from(set);
                }

                // Add to order
                if (oShops.length > 0) {
                  // Only add to orderCities if it's not already in pickup cities (mutually exclusive requirement)
                  if (!finalCities.find((c) => this.normalizeLocation(c) === norm)) {
                    if (!finalOrderCities.find((c) => this.normalizeLocation(c) === norm)) {
                      finalOrderCities.push(city);
                      finalOrderCityShopMap[city] = [];
                    }
                    const existingOrderCity = finalOrderCities.find(
                      (c) => this.normalizeLocation(c) === norm,
                    )!;
                    const set2 = new Set([
                      ...(finalOrderCityShopMap[existingOrderCity] || []),
                      ...oShops,
                    ]);
                    finalOrderCityShopMap[existingOrderCity] = Array.from(set2);
                  }
                }
              },
            );

            // Recalculate online count after merge
            const allMappedIds = new Set<number>();
            Object.values(finalCityShopMap)
              .flat()
              .forEach((id) => allMappedIds.add(id));
            Object.values(finalOrderCityShopMap)
              .flat()
              .forEach((id) => allMappedIds.add(id));
            finalOnlineCount = Math.max(storeIds.length - allMappedIds.size, 0);
          }
        } catch (refreshShowError) {
          console.warn('Failed to fetch refresh_show store availability data:', refreshShowError);
        }
      }

      return {
        availableShopCount: storeIds.length,
        cities: finalCities,
        userCity,
        matchingCities: this.getMatchingCities(finalCities, userCity),
        cityShopMap: finalCityShopMap,
        orderCities: finalOrderCities,
        orderCityShopMap: finalOrderCityShopMap,
        onlineOnlyShopCount: finalOnlineCount,
      };
    } catch (error) {
      console.warn('Failed to fetch store availability data:', error);

      return {
        availableShopCount: storeIds.length,
        cities: domCities,
        userCity,
        matchingCities: this.getMatchingCities(domCities, userCity),
        cityShopMap: domCityShopMap,
        orderCities: domOrderCities,
        orderCityShopMap: domOrderCityShopMap,
        onlineOnlyShopCount: Math.max(storeIds.length - this.countMappedShops(domCityShopMap), 0),
      };
    }
  }

  private static getUniqueShopIds(productData: ProductData): number[] {
    return Array.from(
      new Set(
        Object.values(productData.product_cards)
          .map((card) => card.shop_id)
          .filter((id) => id > 0),
      ),
    ).sort((left, right) => left - right);
  }

  private static normalizeStoreResponse(payload: unknown): Store[] {
    if (Array.isArray(payload)) {
      return payload as Store[];
    }

    if (!payload || typeof payload !== 'object') {
      return [];
    }

    const data = payload as {
      stores?: unknown;
      data?: unknown;
    };

    if (Array.isArray(data.stores)) {
      return data.stores as Store[];
    }

    if (Array.isArray(data.data)) {
      return data.data as Store[];
    }

    if (
      data.data &&
      typeof data.data === 'object' &&
      Array.isArray((data.data as { stores?: unknown }).stores)
    ) {
      return (data.data as { stores: Store[] }).stores;
    }

    return [];
  }

  private static buildCityShopMapFromApi(
    stores: Store[],
    storeIds: number[],
  ): Record<string, number[]> {
    const cityShopMap: Record<string, number[]> = {};
    const canMapShopIdsReliably = stores.length === storeIds.length;

    stores.forEach((store, index) => {
      const city = store.store_location_address?.city?.trim();
      if (!city) return;

      if (!cityShopMap[city]) {
        cityShopMap[city] = [];
      }

      if (!canMapShopIdsReliably) {
        return;
      }

      const shopId = storeIds[index];
      if (shopId === undefined) return;

      if (!cityShopMap[city].includes(shopId)) {
        cityShopMap[city].push(shopId);
      }
    });
    return cityShopMap;
  }

  private static getOnlineOnlyShopCount(stores: Store[], requestedShopCount: number): number {
    const storesWithCityCount = stores.filter((store) => {
      const city = store.store_location_address?.city?.trim();
      return !!city;
    }).length;

    return Math.max(requestedShopCount - storesWithCityCount, 0);
  }

  private static countMappedShops(cityShopMap: Record<string, number[]>): number {
    return Object.values(cityShopMap).reduce((total, shopIds) => total + shopIds.length, 0);
  }

  private static getStoreAvailabilityFromDom(root: ParentNode = document): DomStoreAvailability {
    const pickupCityData = new Map<string, { displayCity: string; shopIds: number[] }>();
    const orderCityData = new Map<string, { displayCity: string; shopIds: number[] }>();
    const processedNodes = new Set<Element>();

    // Scan all possible product card containers on the page/drawer.
    const contentNodes = Array.from(
      root.querySelectorAll(
        '.merchant-box-bottom, .merchant-box-bottom-content, .product-card-redesigned, .offering-card, .price-card',
      ),
    );

    contentNodes.forEach((content) => {
      this.collectStoreAvailabilityFromNode(content, pickupCityData, orderCityData, processedNodes);
    });

    // Some live layouts expose location rows directly under outer merchant containers.
    // Scan the location nodes too so we do not depend on a single inner wrapper shape.
    Array.from(root.querySelectorAll('.location')).forEach((locationElement) => {
      const container = locationElement.closest(
        '.merchant-box-bottom, .merchant-box-bottom-content, .product-card-redesigned, .offering-card, .price-card',
      );
      if (!container) {
        return;
      }

      this.collectStoreAvailabilityFromNode(
        container,
        pickupCityData,
        orderCityData,
        processedNodes,
      );
    });

    const sortedPickup = Array.from(pickupCityData.values()).sort((a, b) =>
      a.displayCity.localeCompare(b.displayCity, 'el'),
    );
    const sortedOrder = Array.from(orderCityData.entries())
      .filter(([normalizedCity]) => !pickupCityData.has(normalizedCity))
      .map(([_, e]) => e)
      .sort((a, b) => a.displayCity.localeCompare(b.displayCity, 'el'));

    const cities = sortedPickup.map((e) => e.displayCity);
    const cityShopMap: Record<string, number[]> = Object.fromEntries(
      sortedPickup.map((e) => [e.displayCity, e.shopIds]),
    );
    const orderCities = sortedOrder.map((e) => e.displayCity);
    const orderCityShopMap: Record<string, number[]> = Object.fromEntries(
      sortedOrder.map((e) => [e.displayCity, e.shopIds]),
    );

    return {
      cities,
      cityShopMap,
      orderCities,
      orderCityShopMap,
      hasExplicitNoStoreCitiesMessage: this.hasExplicitNoStoreCitiesMessage(root),
    };
  }

  private static collectStoreAvailabilityFromNode(
    content: Element,
    pickupCityData: Map<string, { displayCity: string; shopIds: number[] }>,
    orderCityData: Map<string, { displayCity: string; shopIds: number[] }>,
    processedNodes: Set<Element>,
  ): void {
    if (processedNodes.has(content)) {
      return;
    }

    const locationText = content.querySelector('.location')?.textContent?.trim();
    const city = this.extractCityFromLocation(locationText);
    if (!city) {
      return;
    }

    processedNodes.add(content);

    const normalizedCity = this.normalizeLocation(city);

    let href = content.querySelector('.storefront-link')?.getAttribute('href');
    if (!href) {
      href = content.querySelector('a[href*="/shop/"]')?.getAttribute('href') ?? '';
    }

    const shopIds: number[] = [];
    const shopIdMatch = href.match(/\/shop\/(\d+)\//);
    if (shopIdMatch) {
      shopIds.push(parseInt(shopIdMatch[1], 10));
    }

    this.addCityDataEntry(orderCityData, normalizedCity, city, shopIds);

    const hasStorePickup = !!content.querySelector('.store-pickup, .stock');
    if (hasStorePickup) {
      this.addCityDataEntry(pickupCityData, normalizedCity, city, shopIds);
    }
  }

  private static addCityDataEntry(
    cityData: Map<string, { displayCity: string; shopIds: number[] }>,
    normalizedCity: string,
    displayCity: string,
    shopIds: number[],
  ): void {
    if (!cityData.has(normalizedCity)) {
      cityData.set(normalizedCity, { displayCity, shopIds: [] });
    }

    const entry = cityData.get(normalizedCity);
    if (!entry) {
      return;
    }

    shopIds.forEach((shopId) => {
      if (!entry.shopIds.includes(shopId)) {
        entry.shopIds.push(shopId);
      }
    });
  }

  private static getUserCity(): string | undefined {
    const drawerPrompt = document.querySelector('.blp-prompt p, .js-blp-prompt p');
    const drawerPromptText = this.getPromptLocationText(drawerPrompt);
    if (drawerPromptText) {
      return drawerPromptText;
    }

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
    if (!sanitized || this.isCountryOnlyLocation(sanitized)) {
      return undefined;
    }

    return sanitized;
  }

  private static getPromptLocationText(element: Element | null): string | undefined {
    if (!element) {
      return undefined;
    }

    const directText = Array.from(element.childNodes)
      .filter((node) => node.nodeType === Node.TEXT_NODE)
      .map((node) => node.textContent ?? '')
      .join(' ')
      .replace(/\s+/g, ' ')
      .trim();

    if (directText) {
      return directText;
    }

    const promptText = element.textContent?.replace(/\s+/g, ' ').trim();
    if (!promptText) {
      return undefined;
    }

    const city = promptText
      .replace(/^(Υπολογισμός τιμών για:|Price calculation for:|Prices calculated for:)\s*/i, '')
      .trim();

    if (!city || this.isCountryOnlyLocation(city)) {
      return undefined;
    }

    return city;
  }

  private static hasExplicitNoStoreCitiesMessage(root: ParentNode = document): boolean {
    const pricesElement = root.querySelector('#prices');
    const drawerRoot =
      pricesElement?.parentElement?.closest('.bottom-drawer-content') ??
      root.querySelector('.bottom-drawer-content');
    const drawerText = drawerRoot?.textContent?.replace(/\s+/g, ' ').trim();

    if (!drawerText) {
      return false;
    }

    const normalizedText = this.normalizeLocation(drawerText);
    return [
      'Το προϊόν δεν έχει αυτή τη στιγμή διαθέσιμες πόλεις καταστημάτων.',
      'This product does not currently have any store cities available.',
    ].some((message) => normalizedText.includes(this.normalizeLocation(message)));
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

  private static isCountryOnlyLocation(value: string): boolean {
    const normalizedValue = this.normalizeLocation(value);
    return normalizedValue === 'ελλαδα' || normalizedValue === 'greece';
  }

  private static getSkroutzPriceData(productData: ProductData, skroutzRawPrice: number): PriceData {
    const productCards = productData.product_cards;

    // Primary match: raw_price (the net/base price shown in the ecommerce buybox)
    const cardByRawPrice = Object.values(productCards).find((card) =>
      this.pricesMatch(card.raw_price, skroutzRawPrice),
    );
    if (cardByRawPrice) {
      return {
        price: cardByRawPrice.raw_price,
        shippingCost: cardByRawPrice.shipping_cost,
        totalPrice: cardByRawPrice.raw_price + cardByRawPrice.shipping_cost,
        shopId: cardByRawPrice.shop_id,
      };
    }

    // Fallback match: ecommerce_final_price (Skroutz-subsidised/discounted price)
    const firstCard = Object.values(productCards).find((card) =>
      this.pricesMatch(this.getEffectiveCardPrice(card), skroutzRawPrice),
    );
    if (firstCard) {
      return {
        price: this.getEffectiveCardPrice(firstCard),
        shippingCost: firstCard.shipping_cost,
        totalPrice: this.getEffectiveCardPrice(firstCard) + firstCard.shipping_cost,
        shopId: firstCard.shop_id,
      };
    }

    const currentBuyboxShopId = this.getCurrentBuyboxShopId();
    if (currentBuyboxShopId !== undefined) {
      const cardByBuyboxShop = Object.values(productCards).find(
        (card) => card.shop_id === currentBuyboxShopId,
      );

      if (cardByBuyboxShop) {
        return {
          price: skroutzRawPrice,
          shippingCost: cardByBuyboxShop.shipping_cost,
          totalPrice: skroutzRawPrice + cardByBuyboxShop.shipping_cost,
          shopId: cardByBuyboxShop.shop_id,
        };
      }
    }

    throw new Error('No product cards found');
  }

  private static getCurrentBuyboxShopId(): number | undefined {
    const buybox = document.querySelector('article.buybox');
    if (!buybox) {
      return undefined;
    }

    const shopHref = buybox.querySelector('.merchant-box a[href*="/shop/"]')?.getAttribute('href');

    if (shopHref) {
      const shopIdMatch = shopHref.match(/\/shop\/(\d+)\//);
      if (shopIdMatch?.[1]) {
        return parseInt(shopIdMatch[1], 10);
      }
    }

    return undefined;
  }

  private static getStorePriceData(productData: ProductData): PriceData {
    const productCards = productData.product_cards;

    let lowestStorePrice = Number.MAX_VALUE;
    let lowestStoreProductPrice = Number.MAX_VALUE;
    let lowestStoreShippingCost = Number.MAX_VALUE;
    let storeShopId = 0;

    Object.values(productCards).forEach((card) => {
      const effectivePrice = this.getEffectiveCardPrice(card);
      const totalCost = effectivePrice + card.shipping_cost;
      if (totalCost < lowestStorePrice) {
        lowestStorePrice = totalCost;
        lowestStoreProductPrice = effectivePrice;
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

  private static getEffectiveCardPrice(card: ProductData['product_cards'][string]): number {
    return card.ecommerce_final_price !== 0 ? card.ecommerce_final_price : card.raw_price;
  }
}
