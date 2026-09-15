export type ShopCard = {
  shopId: number;
  rawPrice: number;
  finalPrice: number;
  shippingCost: number;
  productName: string;
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

export type PriceChartValue = {
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
