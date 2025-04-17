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

function getSkroutzRawPrice(): number {
  const offeringCard = document.querySelector("article.offering-card")!;
  const priceElement = offeringCard.querySelector("div.price")!;

  if (!priceElement) {
    throw new Error("Failed to fetch price");
  }

  // Get the integer part (including thousand separators)
  const integerPart = priceElement.firstChild?.textContent?.trim() || ""; // "1.028"

  // Get the decimal part that comes after the comma
  const decimalPart =
    priceElement.querySelector("span.comma + span")?.textContent?.trim() || ""; // "89"

  // Combine parts, removing thousand separators (dots)
  const priceText = integerPart.replace(/\./g, "") + "." + decimalPart;

  // Convert to a number and return
  const price = parseFloat(priceText);

  if (isNaN(price)) {
    throw new Error("Failed to parse price");
  }

  return price;
}

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

function getSkroutzPriceData(
  productData: ProductData,
  skroutzRawPrice: number
): PriceData {
  const productCards = productData.product_cards;

  const firstCard = Object.values(productCards).find(
    (card) => card.raw_price === skroutzRawPrice
  );
  if (!firstCard) {
    throw new Error("No product cards found");
  }

  if (!firstCard) {
    throw new Error("No sponsored product cards found");
  }

  return {
    price: firstCard.raw_price,
    shippingCost: firstCard.shipping_cost,
    totalPrice: firstCard.raw_price + firstCard.shipping_cost,
    shopId: firstCard.shop_id,
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
    const skroutzRawPrice = getSkroutzRawPrice();
    const productData = await getProductData(productCode);

    return {
      buyThroughSkroutz: getSkroutzPriceData(productData, skroutzRawPrice),
      buyThroughStore: getStorePriceData(productData),
    };
  } catch (error) {
    console.error("There was a problem with the fetch operation:", error);
    throw error;
  }
}
