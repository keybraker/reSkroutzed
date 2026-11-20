import { afterEach, describe, expect, it, vi } from 'vitest';

import { Language } from '../../../src/common/enums/Language.enum';
import {
  removeStoreCountPill,
  STORE_COUNT_PILL_CLASS,
  syncStoreCountPill,
} from '../../../src/features/functions/storeCountPill';

describe('storeCountPill', () => {
  const renderChipRow = (): { row: HTMLElement; nativePill: HTMLButtonElement } => {
    const row = document.createElement('div');
    row.className = 'chip-row';

    const rating = document.createElement('button');
    rating.className = 'btn-reset rating-chip';
    row.appendChild(rating);

    const nativePill = document.createElement('button');
    nativePill.className = 'btn-reset icon price-history';
    row.appendChild(nativePill);

    document.body.appendChild(row);

    return { row, nativePill };
  };

  const renderOffersToggle = (): HTMLButtonElement => {
    const toggle = document.createElement('button');
    toggle.className = 'alternative-option-wrapper btn-reset';
    document.body.appendChild(toggle);

    return toggle;
  };

  afterEach(() => {
    document.body.innerHTML = '';
    vi.restoreAllMocks();
  });

  it('adds the pill right after the native price-history chip', () => {
    // Arrange
    const { row, nativePill } = renderChipRow();

    // Act
    syncStoreCountPill(47, Language.GREEK);

    // Assert
    const pill = row.querySelector<HTMLButtonElement>(`.${STORE_COUNT_PILL_CLASS}`);
    expect(pill).not.toBeNull();
    expect(pill?.previousElementSibling).toBe(nativePill);
    expect(pill?.querySelector('span')?.textContent).toBe('47 καταστήματα');
    expect(pill?.querySelector('svg')).not.toBeNull();
    expect(pill?.title).toBe('Άνοιγμα λίστας καταστημάτων');
    // The chip surface is inline, so a stale stylesheet cannot strip it.
    expect(pill?.style.borderRadius).toBe('999px');
    expect(pill?.style.background).toBe('rgb(241, 241, 241)');
    expect(pill?.style.padding).toBe('5px 12px');
  });

  it('sits beside a chip that nests the price-history button, not inside it', () => {
    // Arrange
    const chip = document.createElement('a');
    chip.className = 'chip';
    const innerButton = document.createElement('button');
    innerButton.className = 'btn-reset icon price-history';
    chip.appendChild(innerButton);
    document.body.appendChild(chip);

    // Act
    syncStoreCountPill(47, Language.GREEK);

    // Assert
    const pill = document.querySelector<HTMLButtonElement>(`.${STORE_COUNT_PILL_CLASS}`);
    expect(pill?.parentElement).toBe(document.body);
    expect(pill?.previousElementSibling).toBe(chip);
    expect(chip.contains(pill)).toBe(false);
  });

  it('darkens the chip on hover and press without a stylesheet', () => {
    // Arrange
    renderChipRow();
    syncStoreCountPill(47, Language.GREEK);
    const pill = document.querySelector<HTMLButtonElement>(`.${STORE_COUNT_PILL_CLASS}`);
    if (!pill) {
      throw new Error('store pill not rendered');
    }

    // Act — hover
    pill.dispatchEvent(new Event('pointerenter'));

    // Assert — the native chips only change surface, nothing moves.
    expect(pill.style.getPropertyValue('background')).toBe('rgb(232, 232, 232)');
    expect(pill.style.getPropertyPriority('background')).toBe('important');
    expect(pill.style.getPropertyValue('transform')).toBe('');

    // Act — press, then release
    pill.dispatchEvent(new Event('pointerdown'));
    expect(pill.style.getPropertyValue('background')).toBe('rgb(226, 226, 226)');

    pill.dispatchEvent(new Event('pointerup'));
    expect(pill.style.getPropertyValue('background')).toBe('rgb(232, 232, 232)');

    // Act — leave
    pill.dispatchEvent(new Event('pointerleave'));

    // Assert — back to the resting chip
    expect(pill.style.getPropertyValue('background')).toBe('rgb(241, 241, 241)');
  });

  it('does not let the click reach the row around it', () => {
    // Arrange
    const { row } = renderChipRow();
    const rowClick = vi.fn();
    row.addEventListener('click', rowClick);
    syncStoreCountPill(47, Language.GREEK);

    // Act
    document.querySelector<HTMLButtonElement>(`.${STORE_COUNT_PILL_CLASS}`)?.click();

    // Assert
    expect(rowClick).not.toHaveBeenCalled();
  });

  it('localizes the label', () => {
    // Arrange
    renderChipRow();

    // Act
    syncStoreCountPill(1, Language.ENGLISH);

    // Assert
    expect(document.querySelector(`.${STORE_COUNT_PILL_CLASS} span`)?.textContent).toBe('1 store');
  });

  it('opens the store list when clicked', () => {
    // Arrange
    renderChipRow();
    const offersToggle = renderOffersToggle();
    const toggleClick = vi.spyOn(offersToggle, 'click');
    syncStoreCountPill(47, Language.GREEK);

    // Act
    document.querySelector<HTMLButtonElement>(`.${STORE_COUNT_PILL_CLASS}`)?.click();

    // Assert
    expect(toggleClick).toHaveBeenCalledTimes(1);
  });

  it('falls back to the innermost row that names the store count', () => {
    // Arrange
    renderChipRow();
    const outer = document.createElement('div');
    outer.setAttribute('role', 'button');
    outer.textContent = 'από 99,99 € σε 47 καταστήματα';
    const inner = document.createElement('button');
    inner.textContent = 'σε 47 καταστήματα';
    outer.appendChild(inner);
    document.body.appendChild(outer);
    const outerClick = vi.spyOn(outer, 'click');
    const innerClick = vi.spyOn(inner, 'click');
    syncStoreCountPill(47, Language.GREEK);

    // Act
    document.querySelector<HTMLButtonElement>(`.${STORE_COUNT_PILL_CLASS}`)?.click();

    // Assert — the row itself, not the wrapper around it.
    expect(innerClick).toHaveBeenCalledTimes(1);
    expect(outerClick).not.toHaveBeenCalled();
  });

  it('replaces a previously rendered pill instead of stacking another', () => {
    // Arrange
    renderChipRow();

    // Act
    syncStoreCountPill(47, Language.GREEK);
    syncStoreCountPill(50, Language.GREEK);

    // Assert
    const pills = document.querySelectorAll(`.${STORE_COUNT_PILL_CLASS}`);
    expect(pills).toHaveLength(1);
    expect(pills[0].textContent).toBe('50 καταστήματα');
  });

  it('renders nothing when the chip row or the count is missing', () => {
    // Arrange
    renderChipRow();

    // Act
    syncStoreCountPill(0, Language.GREEK);

    // Assert
    expect(document.querySelector(`.${STORE_COUNT_PILL_CLASS}`)).toBeNull();
  });

  it('does not add a pill without the native price-history chip', () => {
    // Arrange
    document.body.innerHTML = '<div class="chip-row"></div>';

    // Act
    syncStoreCountPill(47, Language.GREEK);

    // Assert
    expect(document.querySelector(`.${STORE_COUNT_PILL_CLASS}`)).toBeNull();
  });

  it('removes the pill', () => {
    // Arrange
    renderChipRow();
    syncStoreCountPill(47, Language.GREEK);

    // Act
    removeStoreCountPill();

    // Assert
    expect(document.querySelector(`.${STORE_COUNT_PILL_CLASS}`)).toBeNull();
  });
});
