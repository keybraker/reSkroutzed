import { beforeAll, describe, expect, it, vi } from 'vitest';
import type { PriceBridgeResponse } from '../src/clients/common/priceBridge';

type MessageListener = (
  request: unknown,
  sender: chrome.runtime.MessageSender,
  sendResponse: (response: PriceBridgeResponse<unknown>) => void,
) => boolean;

const getMessageListener = (): MessageListener => {
  const [listener] = vi.mocked(chrome.runtime.onMessage.addListener).mock.calls[0];
  return listener as MessageListener;
};

describe('service_worker', () => {
  beforeAll(async () => {
    await import('../src/service_worker');
  });

  it('should register the uninstall survey URL', () => {
    // Arrange
    const expectedUrl = 'https://itsiakkas.com/support';

    // Act & Assert
    expect(vi.mocked(chrome.runtime.setUninstallURL)).toHaveBeenCalledWith(expectedUrl);
  });

  it('should reject non-HTTPS requests', async () => {
    // Arrange
    const sendResponse = vi.fn();
    const listener = getMessageListener();

    // Act
    const handled = listener(
      { action: 'bestprice.fetch', url: 'http://www.bestprice.gr/x', responseType: 'text' },
      {} as chrome.runtime.MessageSender,
      sendResponse,
    );

    // Assert
    expect(handled).toBe(true);
    await vi.waitFor(() =>
      expect(sendResponse).toHaveBeenCalledWith({
        ok: false,
        error: 'Only HTTPS BestPrice requests are allowed',
      }),
    );
  });
});
