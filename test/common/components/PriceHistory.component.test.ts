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

  it('wraps the averages block and the toggles in the panel', () => {
    // Arrange
    const averagesBlock = document.createElement('div');
    averagesBlock.className = 'price-history-averages';

    // Act
    const wrapper = PriceHistoryComponent(Language.GREEK, averagesBlock);

    // Assert
    const panel = queryPart(wrapper, '.price-history-panel');
    expect(panel.firstElementChild).toBe(averagesBlock);
    expect(panel.lastElementChild?.classList.contains('price-history-controls')).toBe(true);
    // The panel supplies the surface, so the hairline above the row is redundant.
    expect(wrapper.querySelector('.price-history-separator')).toBeNull();
  });

  it('renders the toggles bare when there is no averages block', () => {
    // Arrange / Act
    const wrapper = PriceHistoryComponent(Language.GREEK);

    // Assert
    expect(wrapper.querySelector('.price-history-panel')).toBeNull();
    expect(wrapper.querySelector('.price-history-separator')).not.toBeNull();
    const row = queryPart(wrapper, '.price-history-row');
    expect(row.querySelector('.price-history-controls')).not.toBeNull();
  });
});
