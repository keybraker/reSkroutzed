import type {
  PriceBridgeAction,
  PriceBridgeRequest,
  PriceBridgeResponse,
} from './clients/common/priceBridge';

const PROVIDER_LABELS: Record<PriceBridgeAction, string> = {
  'bestprice.fetch': 'BestPrice',
  'shopflix.fetch': 'Shopflix',
};

/**
 * Hosts each provider action is allowed to call. Every bridged request is
 * validated against these before the service worker performs it.
 */
const ALLOWED_HOSTS: Record<PriceBridgeAction, (hostname: string) => boolean> = {
  'bestprice.fetch': (hostname) => hostname === 'www.bestprice.gr',
  'shopflix.fetch': (hostname) =>
    hostname === 'shopflix.gr' ||
    hostname === 'www.shopflix.gr' ||
    hostname.endsWith('.algolia.net') ||
    hostname.endsWith('.algolianet.com'),
};

const isPriceBridgeAction = (value: unknown): value is PriceBridgeAction =>
  value === 'bestprice.fetch' || value === 'shopflix.fetch';

const isPriceBridgeRequest = (value: unknown): value is PriceBridgeRequest => {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const request = value as Partial<PriceBridgeRequest>;

  return (
    isPriceBridgeAction(request.action) &&
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
    sendResponse: (response: PriceBridgeResponse<unknown>) => void,
  ) => {
    if (!isPriceBridgeRequest(request)) {
      return false;
    }

    void (async () => {
      const providerLabel = PROVIDER_LABELS[request.action];

      try {
        const requestUrl = new URL(request.url);

        if (!ALLOWED_HOSTS[request.action](requestUrl.hostname)) {
          throw new Error(`Only ${providerLabel} requests are allowed`);
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
            error: `${providerLabel} request failed with HTTP ${response.status}`,
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
          error: error instanceof Error ? error.message : `Unknown ${providerLabel} request error`,
        });
      }
    })();

    return true;
  },
);
