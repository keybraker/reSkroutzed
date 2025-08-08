import { removeOutliers } from '../../common/functions/removeOutliers';
import { PriceChart, PriceChartValue, ProductData, Store } from './types';

type PriceData = {
  price: number;
  shippingCost: number;
  totalPrice: number;
  shopId: number;
};

export type ProductPriceData = {
  buyThroughSkroutz: PriceData;
  buyThroughStore: PriceData;
};

export type ProductPriceHistory = {
  minimumPrice: number;
  maximumPrice: number;
  allPrices: PriceChartValue[];
};

export class SkroutzClient {
  public static async getCurrentProductData(): Promise<ProductPriceData> {
    try {
      const productCode = this.getSku();
      const skroutzRawPrice = this.getSkroutzRawPrice();

      const productData = await this.getProductData(productCode);
      // const storeIds = Object.values(productData.product_cards)
      //   .map((card) => card.shop_id)
      //   .filter((id) => id > 0)
      //   .sort((a, b) => a - b);

      return {
        buyThroughSkroutz: this.getSkroutzPriceData(productData, skroutzRawPrice),
        buyThroughStore: this.getStorePriceData(productData),
      };
    } catch (error) {
      console.error('There was a problem with the fetch operation:', error);
      throw error;
    }
  }

  public static async getPriceHistory(): Promise<ProductPriceHistory> {
    try {
      const productCode = this.getSku();

      const priceGraphData = await this.getPriceGraphData(productCode);

      const allPrices = priceGraphData.min_price.graphData['6_months'].values.filter(
        (value) => value.value > 0,
      );

      const filteredPrices = removeOutliers(allPrices);
      const allPriceAmounts = filteredPrices.map((v) => v.value);

      return {
        minimumPrice: Math.min(...allPriceAmounts),
        maximumPrice: Math.max(...allPriceAmounts),
        allPrices: filteredPrices.map((v) => ({
          ...v,
          timestamp: v.timestamp * 1000,
        })),
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

    if (!metaTag) {
      throw new Error('Failed to fetch product SKU');
    }

    return metaTag.content;
  }

  private static async getProductData(productCode: string): Promise<ProductData> {
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
