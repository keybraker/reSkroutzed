import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { onBodyMutations } from '../../src/common/functions/bodyMutationObserver';
import { LogoHatDecorator } from '../../src/features/LogoHat.decorator';

vi.mock('../../src/common/functions/bodyMutationObserver', () => ({
  onBodyMutations: vi.fn(),
}));

describe('LogoHatDecorator', () => {
  let decorator: LogoHatDecorator;
  let mutationCallback: ((mutations: MutationRecord[]) => void) | undefined;
  let unsubscribe: ReturnType<typeof vi.fn>;
  let viewportListener: (() => void) | undefined;
  let mediaQuery: {
    matches: boolean;
    addEventListener: (type: string, listener: () => void) => void;
    removeEventListener: (type: string, listener: () => void) => void;
  };

  beforeEach(() => {
    unsubscribe = vi.fn();
    viewportListener = undefined;
    mediaQuery = {
      matches: false,
      addEventListener: vi.fn((_type: string, listener: () => void) => {
        viewportListener = listener;
      }),
      removeEventListener: vi.fn(),
    };

    vi.mocked(onBodyMutations).mockImplementation((callback) => {
      mutationCallback = callback;
      return unsubscribe as () => void;
    });

    document.body.innerHTML = '<h1><a id="index-link" href="/"><img alt="Skroutz" /></a></h1>';

    vi.stubGlobal(
      'matchMedia',
      vi.fn(() => mediaQuery),
    );

    decorator = new LogoHatDecorator();
    decorator.execute();
  });

  afterEach(() => {
    decorator.destroy();
    document.body.innerHTML = '';
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('wraps the logo with the hat', () => {
    // Assert
    const wrapper = document.querySelector('h1 > div');
    expect(wrapper).not.toBeNull();
    expect(wrapper?.querySelector('img[alt="reSkroutzed hat"]')).not.toBeNull();
    expect(wrapper?.querySelector('a#index-link')).not.toBeNull();
  });

  it('re-attaches the hat when the header renders a new logo link', () => {
    // Arrange
    document.body.innerHTML = '<h1><a id="index-link" href="/"><img alt="Skroutz" /></a></h1>';

    // Act
    mutationCallback?.([]);

    // Assert
    const wrapper = document.querySelector('h1 > div');
    expect(wrapper).not.toBeNull();
    expect(wrapper?.querySelectorAll('a#index-link')).toHaveLength(1);
    expect(wrapper?.querySelector('img[alt="reSkroutzed hat"]')).not.toBeNull();
  });

  it('stops observing and listening on destroy', () => {
    // Act
    decorator.destroy();

    // Assert
    expect(unsubscribe).toHaveBeenCalledTimes(1);
    expect(mediaQuery.removeEventListener).toHaveBeenCalledWith('change', viewportListener);
  });

  it('updates the hat styles when the viewport changes', () => {
    // Arrange
    const hat = document.querySelector<HTMLImageElement>('img[alt="reSkroutzed hat"]');
    mediaQuery.matches = true;

    // Act
    viewportListener?.();

    // Assert
    expect(hat?.style.width).toBe('18px');
  });
});
