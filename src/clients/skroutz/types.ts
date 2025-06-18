type Product = {
  id: number;
  name: string;
  url: string;
  instock: boolean;
  filtered: boolean;
  sponsored_filtered: boolean;
  availability: string;
};

type ProductCard = {
  id: number;
  shop_id: number;
  price: string;
  shipping_cost: number;
  marketplace: boolean;
  shop_details_icons: string[];
  products: Product[];
  raw_price: number;
  cash_on_delivery?: boolean;
  ecommerce_available: boolean;
  only_available_through_fbs: boolean | null;
  official_reseller: boolean;
  expert_seller: boolean;
  sponsored: boolean;
  sponsored_by_merchant_tracking_url: string;
  merchant_funded_installments: boolean;
  sponsored_by_merchant_follow_cookie_link_data_cart: Record<string, unknown>;
  discount_voucher_active: boolean;
  fbs_active: boolean;
  force_cargo_shipping_benefits: boolean;
  ecommerce_final_price: number;
  ecommerce_final_price_formatted: string;
  ecommerce_payment_method_cost_formatted: string | null;
  ecommerce_payment_method_cost_supported: boolean | null;
  ecommerce_shipping_cost_formatted: string;
  fbm: boolean;
  final_price: number;
  final_price_formatted: string;
  final_price_without_payment_cost_formatted: string;
  has_merchant_loyalty_points: boolean;
  loyalty_points: string;
  net_price_formatted: string;
  no_credit_card: boolean;
  payment_method_cost_formatted: string | null;
  payment_method_cost_supported: boolean | null;
  shipping_cost_formatted: string;
  untracked_redirect_supported: boolean;
  coupon_info: unknown;
  advertising_badge?: {
    text: string;
    tooltip: string;
    action_url: string;
  };
  shop_details_icons_labels?: Record<string, string>;
};

export type ProductData = {
  product_card_ids: number[];
  sponsored_product_card_ids: number[];
  disabled_product_ids: number[];
  product_cards: Record<string, ProductCard>;
  shop_count: number;
  price_min: string;
  price_drop_percentage: number | null;
};

export type StoreLocationAddress = {
  city: string;
  country: string;
  region: string;
  street: string;
  postcode: string;
  full: string;
};

export type Store = {
  stores_count: number;
  store_location_id: number;
  store_location_address: StoreLocationAddress;
  display_full_store_address: boolean;
  show_added_delay_message: boolean;
};

type PriceChartValue = {
  shop_name?: string;
  timestamp: number;
  value: number;
};

type PriceChartPeriod = {
  values: PriceChartValue[];
  has_values: boolean;
  label: string;
};

type PriceChartGraphData = {
  '1_months': PriceChartPeriod;
  '3_months': PriceChartPeriod;
  '6_months': PriceChartPeriod;
  all: PriceChartPeriod;
};

type PriceChartSection = {
  min: number;
  max: number;
  graphData: PriceChartGraphData;
};

export type PriceChart = {
  min_price: PriceChartSection;
  popularity: PriceChartSection;
  shop_count: PriceChartSection;
};
