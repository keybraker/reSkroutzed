import { ShopCard } from './types';

const SHOP_CARDS_ROOT_SELECTOR = '#prices';
const SHOP_CARD_SELECTOR = 'li[data-shop-id][data-raw-price]';
const SHOP_CARD_NAME_SELECTOR = '.product-name';
const SHOP_CARD_FEE_TEXT_SELECTOR = '.product-card-fee-text';
const SHOP_CARD_FEE_SUBTEXT_SELECTOR = '.product-card-fee-subtext';
const SHOP_CARD_FEE_VALUE_SELECTOR = '.product-card-fee-value';

const FREE_SHIPPING_PATTERN = /δωρεάν|δωρεαν|free/i;
const GREEK_AMOUNT_PATTERN = /(\d{1,3}(?:\.\d{3})+|\d+)(?:,(\d{1,2}))?/;

function parseAmount(text: string | null | undefined): number | undefined {
  if (!text) {
    return undefined;
  }

  const match = text.replace(/\s/g, '').match(GREEK_AMOUNT_PATTERN);
  if (!match) {
    return undefined;
  }

  const integerPart = match[1].replace(/\./g, '');
  const decimalPart = match[2] ?? '0';
  const amount = Number.parseFloat(`${integerPart}.${decimalPart}`);

  return Number.isFinite(amount) ? amount : undefined;
}

function parseShippingCost(card: Element): number {
  const feeText = card.querySelector(SHOP_CARD_FEE_TEXT_SELECTOR)?.textContent ?? '';

  if (FREE_SHIPPING_PATTERN.test(feeText)) {
    return 0;
  }

  // The subtext ("ή 3,50 € μεταφορικά") carries the regular home delivery cost.
  // Store price totals are compared on that cost, not on the cheaper Skroutz
  // Point pickup fee shown next to it.
  const homeShippingCost = parseAmount(
    card.querySelector(SHOP_CARD_FEE_SUBTEXT_SELECTOR)?.textContent,
  );
  if (homeShippingCost !== undefined) {
    return homeShippingCost;
  }

  return parseAmount(card.querySelector(SHOP_CARD_FEE_VALUE_SELECTOR)?.textContent) ?? 0;
}

function parseProductName(card: Element): string {
  const nameElement = card.querySelector(SHOP_CARD_NAME_SELECTOR);
  const title = nameElement?.getAttribute('title')?.trim();

  return title || nameElement?.textContent?.trim() || '';
}

function parseShopCard(card: Element): ShopCard | undefined {
  const shopId = Number.parseInt(card.getAttribute('data-shop-id') ?? '', 10);
  const rawPrice = Number.parseFloat(card.getAttribute('data-raw-price') ?? '');

  if (!Number.isFinite(shopId) || !Number.isFinite(rawPrice)) {
    return undefined;
  }

  return {
    shopId,
    rawPrice,
    finalPrice: parseAmount(card.getAttribute('data-price')) ?? rawPrice,
    shippingCost: parseShippingCost(card),
    productName: parseProductName(card),
  };
}

export function parseShopCards(html: string): ShopCard[] {
  const shopCardsDocument = new DOMParser().parseFromString(html, 'text/html');
  const root = shopCardsDocument.querySelector(SHOP_CARDS_ROOT_SELECTOR) ?? shopCardsDocument;

  return Array.from(root.querySelectorAll(SHOP_CARD_SELECTOR))
    .map((card) => parseShopCard(card))
    .filter((card): card is ShopCard => card !== undefined);
}
