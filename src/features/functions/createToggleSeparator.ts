import { DomClient } from '../../clients/dom/client';

/**
 * Hairline divider for the universal toggle bar, used to split related groups of
 * toggles apart. Purely decorative, so it is hidden from assistive technology.
 */
export function createToggleSeparator(): HTMLDivElement {
  const separator = DomClient.createElement('div', {
    className: 'toggle-separator',
  }) as HTMLDivElement;

  separator.setAttribute('aria-hidden', 'true');

  return separator;
}
