import { ProductData } from "./types";

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

function getSku(): string {
  const metaTag = document.querySelector(
    'meta[itemprop="sku"]'
  ) as HTMLMetaElement | null;

  if (!metaTag) {
    throw new Error("Failed to fetch product SKU");
  }

  return metaTag.content;
}

async function getProductData(productCode: string): Promise<ProductData> {
  const response = await fetch(
    `https://www.skroutz.gr/s/${productCode}/filter_products.json`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) {
    throw new Error(
      `Failed to fetch (HTTP: ${response.status}) price data for product with SKU ${productCode}`
    );
  }

  return (await response.json()) as ProductData;
}

function getSkroutzPriceData(productData: ProductData): PriceData {
  const productCards = productData.product_cards;

  const sponsoredProductCardId = productData.sponsored_product_card_ids[0];
  const sponsoredProductCard = Object.values(productCards).find(
    (card) => card.id === sponsoredProductCardId
  );
  if (!sponsoredProductCard) {
    throw new Error("Sponsored product card not found");
  }

  return {
    price: sponsoredProductCard.raw_price,
    shippingCost: sponsoredProductCard.shipping_cost,
    totalPrice:
      sponsoredProductCard.raw_price + sponsoredProductCard.shipping_cost,
    shopId: sponsoredProductCard.shop_id,
  };
}

function getStorePriceData(productData: ProductData): PriceData {
  const productCards = productData.product_cards;

  let lowestStorePrice = Number.MAX_VALUE;
  let lowestStoreProductPrice = Number.MAX_VALUE;
  let lowestStoreShippingCost = Number.MAX_VALUE;
  let storeShopId = 0;

  Object.values(productCards).forEach((card) => {
    card.raw_price =
      card.ecommerce_final_price !== 0
        ? card.ecommerce_final_price
        : card.raw_price;
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

export async function marketDataReceiver(): Promise<ProductPriceData> {
  try {
    const productCode = getSku();
    const productData = await getProductData(productCode);

    return {
      buyThroughSkroutz: getSkroutzPriceData(productData),
      buyThroughStore: getStorePriceData(productData),
    };
  } catch (error) {
    console.error("There was a problem with the fetch operation:", error);
    throw error;
  }
}
