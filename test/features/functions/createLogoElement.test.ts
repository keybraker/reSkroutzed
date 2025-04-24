// filepath: c:\Users\Keybraker\Github\reSkroutzed\test\features\functions\createLogoElement.test.ts
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

import { createLogoElement } from '../../../src/features/functions/createLogoElement';
import { DomClient } from '../../../src/clients/dom/client';

// Mock dependencies
vi.mock('../../../src/clients/dom/client', () => ({
  DomClient: {
    appendElementToElement: vi.fn(),
  },
}));

describe('createLogoElement', () => {
  beforeEach(() => {
    // Reset all mocks
    vi.resetAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should create a logo element with correct classes', () => {
    const icon = createLogoElement();

    expect(icon.tagName).toBe('DIV');
    expect(icon.classList.contains('align-center')).toBe(true);
    expect(icon.classList.contains('icon-border')).toBe(true);
  });

  it('should create and append an image with correct attributes', () => {
    const icon = createLogoElement();

    // Should call appendElementToElement once
    expect(DomClient.appendElementToElement).toHaveBeenCalledTimes(1);

    // The img element should have correct properties
    const imgElement = expect.objectContaining({
      tagName: 'IMG',
      src: 'https://raw.githubusercontent.com/keybraker/reskroutzed/main/icons/128.png',
      alt: 'reSkroutzed',
      width: 18,
      height: 18,
    });

    // Verify the img is appended to the icon
    expect(DomClient.appendElementToElement).toHaveBeenCalledWith(imgElement, icon);
  });

  it('should return a div element', () => {
    const result = createLogoElement();
    expect(result instanceof HTMLDivElement).toBe(true);
  });

  // Note: The SVG element is created but not actually used in the function
  // If this is intentional, that's fine, but you might want to remove the unused code
  it('should not append the SVG element to the icon', () => {
    createLogoElement();

    // Only one call to appendElementToElement should occur (for the img)
    expect(DomClient.appendElementToElement).toHaveBeenCalledTimes(1);

    // Make sure we're not appending any SVG
    expect(DomClient.appendElementToElement).not.toHaveBeenCalledWith(
      expect.objectContaining({
        tagName: 'svg',
      }),
      expect.anything(),
    );
  });
});
