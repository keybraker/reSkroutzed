import { describe, expect, it } from 'vitest';

import { Language } from '../../../src/common/enums/Language.enum';
import {
  createPriceDifferenceBadge,
  createPriceDifferenceBadgeSpacer,
} from '../../../src/features/functions/createPriceDifferenceBadge';

describe('createPriceDifferenceBadge', () => {
  it('renders a cheaper pill with a negative amount', () => {
    // Act
    const badge = createPriceDifferenceBadge(-3.12, Language.GREEK);

    // Assert
    expect(badge).not.toBeNull();
    expect(badge?.classList.contains('price-difference-badge--cheaper')).toBe(true);
    expect(badge?.textContent).toBe('-3,12€');
  });

  it('renders a pricier pill with a positive amount', () => {
    // Act
    const badge = createPriceDifferenceBadge(3.12, Language.GREEK);

    // Assert
    expect(badge).not.toBeNull();
    expect(badge?.classList.contains('price-difference-badge--pricier')).toBe(true);
    expect(badge?.textContent).toBe('+3,12€');
  });

  it('renders nothing at all when the totals match', () => {
    // Act
    const badge = createPriceDifferenceBadge(0, Language.GREEK);

    // Assert
    expect(badge).toBeNull();
  });

  it('renders nothing for a floating-point residue', () => {
    // Act
    const badge = createPriceDifferenceBadge(1e-12, Language.GREEK);

    // Assert
    expect(badge).toBeNull();
  });

  it('keeps long amounts on one line', () => {
    // Act
    const badge = createPriceDifferenceBadge(-1234.56, Language.GREEK);

    // Assert
    expect(badge?.textContent).toBe('-1234,56€');
  });

  it('describes the comparison in both languages', () => {
    // Act
    const cheaper = createPriceDifferenceBadge(-3.12, Language.GREEK);
    const pricier = createPriceDifferenceBadge(3.12, Language.ENGLISH);

    // Assert
    expect(cheaper?.getAttribute('aria-label')).toBe('3,12€ φθηνότερα από την αγορά μέσω Skroutz');
    expect(cheaper?.title).toBe('3,12€ φθηνότερα από την αγορά μέσω Skroutz');
    expect(pricier?.getAttribute('aria-label')).toBe(
      '3,12€ more expensive than buying through Skroutz',
    );
  });

  it('reserves the pill row with an empty twin when there is no difference', () => {
    // Act
    const spacer = createPriceDifferenceBadgeSpacer();

    // Assert — a separate class, so it never counts as a pill of its own.
    expect(spacer.classList.contains('price-difference-badge-spacer')).toBe(true);
    expect(spacer.classList.contains('price-difference-badge')).toBe(false);
    expect(spacer.textContent).toBe('');
  });
});
