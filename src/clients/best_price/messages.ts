export type BestPriceBridgeRequest = {
  action: 'bestprice.fetch';
  url: string;
  method?: 'GET' | 'POST';
  responseType: 'json' | 'text';
  formData?: Record<string, string>;
};

export type BestPriceBridgeSuccess<T> = {
  ok: true;
  status: number;
  url: string;
  data: T;
};

export type BestPriceBridgeError = {
  ok: false;
  status?: number;
  error: string;
};

export type BestPriceBridgeResponse<T> = BestPriceBridgeSuccess<T> | BestPriceBridgeError;
