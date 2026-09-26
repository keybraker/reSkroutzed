/**
 * Shape every price-comparison provider returns for the product currently open
 * on Skroutz.
 *
 * `shippingCost` and `totalPrice` are optional because not every provider
 * exposes shipping to an anonymous visitor — Shopflix only reveals it once a
 * postal code (or a signed-in address) is known.
 */
export type PriceComparisonProduct = {
  title: string;
  price: number;
  url: string;
  merchantCount?: number;
  categoryId?: number;
  shippingCost?: number;
  totalPrice?: number;
};
