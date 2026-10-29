import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

describe('darkModeBoot', () => {
  beforeEach(() => {
    vi.resetModules();
    document.documentElement.classList.remove('resk-dark');
  });

  afterEach(() => {
    document.documentElement.classList.remove('resk-dark');
  });

  it('should apply the dark mode class when the preference is enabled', async () => {
    // Arrange
    localStorage.getItem = vi.fn().mockReturnValue('true');

    // Act
    await import('../src/darkModeBoot');

    // Assert
    expect(document.documentElement.classList.contains('resk-dark')).toBe(true);
  });

  it('should leave the page untouched when the preference is disabled', async () => {
    // Arrange
    localStorage.getItem = vi.fn().mockReturnValue('false');

    // Act
    await import('../src/darkModeBoot');

    // Assert
    expect(document.documentElement.classList.contains('resk-dark')).toBe(false);
  });

  it('should leave the page untouched when nothing has been stored yet', async () => {
    // Arrange
    localStorage.getItem = vi.fn().mockReturnValue(null);

    // Act
    await import('../src/darkModeBoot');

    // Assert
    expect(document.documentElement.classList.contains('resk-dark')).toBe(false);
  });

  it('should not issue any storage request — it runs at document_start', async () => {
    // Arrange
    localStorage.getItem = vi.fn().mockReturnValue('true');

    // Act
    await import('../src/darkModeBoot');

    // Assert
    expect(chrome.storage.local.get).not.toHaveBeenCalled();
  });
});
