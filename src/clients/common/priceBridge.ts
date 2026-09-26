/**
 * Shared request bridge used by every price-comparison provider client.
 *
 * Content scripts cannot fetch third-party origins directly, so requests are
 * relayed through the MV3 service worker (`src/service_worker.ts`), which
 * allowlists the hosts it is willing to call.
 */
export type PriceBridgeAction = 'bestprice.fetch' | 'shopflix.fetch';

export type PriceBridgeRequest = {
  action: PriceBridgeAction;
  url: string;
  method?: 'GET' | 'POST';
  responseType: 'json' | 'text';
  formData?: Record<string, string>;
};

export type PriceBridgeSuccess<T> = {
  ok: true;
  status: number;
  url: string;
  data: T;
};

export type PriceBridgeError = {
  ok: false;
  status?: number;
  error: string;
};

export type PriceBridgeResponse<T> = PriceBridgeSuccess<T> | PriceBridgeError;

type PriceBridgeRuntime = {
  lastError?: { message: string };
  sendMessage: (
    request: PriceBridgeRequest,
    callback: (response?: PriceBridgeResponse<unknown>) => void,
  ) => void;
};

/**
 * Relay a request through the service worker bridge and resolve with its payload.
 */
export async function requestPriceBridge<T>(
  request: PriceBridgeRequest,
  providerLabel: string,
  timeoutMs: number,
): Promise<PriceBridgeSuccess<T>> {
  const runtime = (globalThis as typeof globalThis & { chrome?: { runtime?: PriceBridgeRuntime } })
    .chrome?.runtime;

  if (!runtime?.sendMessage) {
    throw new Error(`${providerLabel} background bridge is unavailable`);
  }

  return await new Promise<PriceBridgeSuccess<T>>((resolve, reject) => {
    const timeout = window.setTimeout(() => {
      reject(new Error(`${providerLabel} request timed out after ${timeoutMs}ms`));
    }, timeoutMs);

    runtime.sendMessage(request, (response?: PriceBridgeResponse<unknown>) => {
      window.clearTimeout(timeout);

      if (runtime.lastError) {
        reject(new Error(runtime.lastError.message));
        return;
      }

      if (!response) {
        reject(new Error(`${providerLabel} background returned no response`));
        return;
      }

      const typedResponse = response as PriceBridgeResponse<T>;

      if (!typedResponse.ok) {
        reject(new Error(typedResponse.error));
        return;
      }

      resolve(typedResponse);
    });
  });
}
