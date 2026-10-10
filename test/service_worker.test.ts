import { describe, expect, it, vi } from 'vitest';

describe('service_worker', () => {
  it('should register the uninstall survey URL', async () => {
    // Arrange
    const expectedUrl = 'https://itsiakkas.com/support';

    // Act
    await import('../src/service_worker');

    // Assert
    expect(vi.mocked(chrome.runtime.setUninstallURL)).toHaveBeenCalledWith(expectedUrl);
  });
});
