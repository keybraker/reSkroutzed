import { DomClient } from '../../clients/dom/client';

/**
 * Small "beta" chip pinned to the right of a feature label whose integration is
 * still experimental, so users know it may change or misbehave.
 */
export function createBetaTag(): HTMLSpanElement {
  const tag = DomClient.createElement('span', {
    className: 'price-checker-beta-tag',
  }) as HTMLSpanElement;
  tag.textContent = 'beta';

  return tag;
}
