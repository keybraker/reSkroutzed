import { DomClient } from '../../clients/dom/client';
import { Language } from '../../common/enums/Language.enum';

/**
 * How an option compares with the Buy-through-Skroutz total. The same comparison
 * drives the green / red colouring of the price column it sits in.
 */
export type PriceDifferenceDirection = 'cheaper' | 'pricier';

/** Anything smaller than this counts as no difference, mirroring `roundToZero`. */
const ROUNDING_EPSILON = 1e-10;

function buildDescription(
  direction: PriceDifferenceDirection,
  amount: string,
  language: Language,
): string {
  const compared =
    language === Language.ENGLISH ? 'than buying through Skroutz' : 'από την αγορά μέσω Skroutz';

  if (direction === 'cheaper') {
    return language === Language.ENGLISH
      ? `${amount} cheaper ${compared}`
      : `${amount} φθηνότερα ${compared}`;
  }

  return language === Language.ENGLISH
    ? `${amount} more expensive ${compared}`
    : `${amount} ακριβότερα ${compared}`;
}

/**
 * The signed difference between an option's total and the Buy-through-Skroutz
 * total, as a small pill that lives inside that option's price block.
 *
 * Returns `null` when the two totals match: an option that costs exactly what
 * Skroutz charges has no difference worth showing, so it renders nothing.
 */
export function createPriceDifferenceBadge(
  priceDifference: number,
  language: Language,
): HTMLElement | null {
  const normalized = Math.abs(priceDifference) < ROUNDING_EPSILON ? 0 : priceDifference;

  if (normalized === 0) {
    return null;
  }

  const direction: PriceDifferenceDirection = normalized < 0 ? 'cheaper' : 'pricier';
  const amount = `${Math.abs(normalized).toFixed(2).replace('.', ',')}€`;
  const description = buildDescription(direction, amount, language);

  const badge = DomClient.createElement('span', {
    className: ['price-difference-badge', `price-difference-badge--${direction}`],
  });
  badge.textContent = `${direction === 'cheaper' ? '-' : '+'}${amount}`;
  badge.title = description;
  badge.setAttribute('aria-label', description);

  return badge;
}

/**
 * The pill's empty twin, for an option that costs exactly what Skroutz charges.
 * It holds the same box as the pill without adding a `price-difference-badge`
 * element, so the option without a pill keeps its price on the same line as the
 * options that have one.
 */
export function createPriceDifferenceBadgeSpacer(): HTMLElement {
  return DomClient.createElement('span', { className: 'price-difference-badge-spacer' });
}
