import type {
  BestPriceBridgeRequest,
  BestPriceBridgeResponse,
} from './clients/best_price/messages';

const BEST_PRICE_ORIGIN = 'https://www.bestprice.gr';

const isBestPriceBridgeRequest = (value: unknown): value is BestPriceBridgeRequest => {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const request = value as Partial<BestPriceBridgeRequest>;

  return (
    request.action === 'bestprice.fetch' &&
    typeof request.url === 'string' &&
    (request.responseType === 'json' || request.responseType === 'text')
  );
};

const createFormData = (values?: Record<string, string>): FormData | undefined => {
  if (!values) {
    return undefined;
  }

  const formData = new FormData();
  for (const [key, value] of Object.entries(values)) {
    formData.append(key, value);
  }

  return formData;
};

chrome.runtime.onMessage.addListener(
  (
    request: unknown,
    _sender: chrome.runtime.MessageSender,
    sendResponse: (response: BestPriceBridgeResponse<unknown>) => void,
  ) => {
    if (!isBestPriceBridgeRequest(request)) {
      return false;
    }

    void (async () => {
      try {
        const requestUrl = new URL(request.url);
        if (requestUrl.origin !== BEST_PRICE_ORIGIN) {
          throw new Error('Only BestPrice requests are allowed');
        }

        const response = await fetch(requestUrl.toString(), {
          method: request.method ?? (request.formData ? 'POST' : 'GET'),
          body: createFormData(request.formData),
          cache: 'no-store',
        });

        if (!response.ok) {
          sendResponse({
            ok: false,
            status: response.status,
            error: `BestPrice request failed with HTTP ${response.status}`,
          });
          return;
        }

        const data =
          request.responseType === 'json' ? await response.json() : await response.text();

        sendResponse({
          ok: true,
          status: response.status,
          url: response.url,
          data,
        });
      } catch (error) {
        sendResponse({
          ok: false,
          error: error instanceof Error ? error.message : 'Unknown BestPrice request error',
        });
      }
    })();

    return true;
  },
);
