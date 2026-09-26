import { afterEach, describe, expect, it, vi } from 'vitest';

import { PriceHistoryComponent } from '../../../src/common/components/PriceHistory.component';
import { Language } from '../../../src/common/enums/Language.enum';

describe('PriceHistoryComponent', () => {
  const queryPart = (wrapper: HTMLElement, selector: string): HTMLElement => {
    const element = wrapper.querySelector(selector);
    if (!element) {
      throw new Error(`${selector} not rendered`);
    }

    return element as HTMLElement;
  };

  afterEach(() => {
    document.body.innerHTML = '';
    vi.restoreAllMocks();
  });

  it('no longer renders a price verdict row', () => {
    // Arrange / Act
    const wrapper = PriceHistoryComponent(Language.GREEK);

    // Assert
    expect(wrapper.querySelector('.price-history-verdict')).toBeNull();
    expect(wrapper.querySelector('.price-history-assessments')).toBeNull();
  });

  it('renders the price history toggle that opens the native chart button', () => {
    // Arrange
    const nativeButton = document.createElement('button');
    nativeButton.className = 'btn-reset icon price-history';
    const nativeClick = vi.spyOn(nativeButton, 'click');
    document.body.appendChild(nativeButton);

    // Act
    const wrapper = PriceHistoryComponent(Language.GREEK);
    const toggle = queryPart(wrapper, '.price-history-toggle-button') as HTMLButtonElement;
    toggle.click();

    // Assert
    expect(toggle.textContent).toContain('Εξέλιξη τιμής');
    expect(toggle.querySelector('.analysis-icon svg')).not.toBeNull();
    expect(nativeClick).toHaveBeenCalledTimes(1);
  });

  it('localizes the toggle label to English', () => {
    // Arrange / Act
    const wrapper = PriceHistoryComponent(Language.ENGLISH);

    // Assert
    expect(wrapper.querySelector('.price-history-toggle-button')?.textContent).toContain(
      'Price history',
    );
  });

  it('exposes the controls container the price checker appends the analysis toggle into', () => {
    // Arrange / Act
    const wrapper = PriceHistoryComponent(Language.GREEK);

    // Assert
    const controls = queryPart(wrapper, '.price-history-controls');
    expect(controls.querySelector('.price-history-toggle-button')).not.toBeNull();
    expect(wrapper.querySelector('.price-history-separator')).not.toBeNull();
  });

  it('places the supplied average-price caption on the left of the toggles', () => {
    // Arrange
    const caption = document.createElement('div');
    caption.className = 'price-average-line';

    // Act
    const wrapper = PriceHistoryComponent(Language.GREEK, caption);

    // Assert
    const row = queryPart(wrapper, '.price-history-row');
    expect(row.firstElementChild).toBe(caption);
    expect(row.lastElementChild?.classList.contains('price-history-controls')).toBe(true);
  });

  it('renders the row without a caption when none is supplied', () => {
    // Arrange / Act
    const wrapper = PriceHistoryComponent(Language.GREEK);

    // Assert
    const row = queryPart(wrapper, '.price-history-row');
    expect(row.querySelector('.price-average-line')).toBeNull();
    expect(row.querySelector('.price-history-controls')).not.toBeNull();
  });
});
