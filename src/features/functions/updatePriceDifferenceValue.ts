import { BrowserClient, StorageKey } from '../../clients/browser/client';
import { Language } from '../../common/enums/Language.enum';
import { State } from '../../common/types/State.type';

/**
 * Persists a new minimum price difference and refreshes the button UI.
 */
export function updatePriceDifferenceValue(
  state: State,
  newValue: number,
  button?: HTMLButtonElement,
): void {
  state.minimumPriceDifference = newValue;

  if (button) {
    button.setAttribute('data-value', newValue.toString());

    const updatedTitle =
      state.language === Language.GREEK
        ? `Ελάχιστη ποσοστιαία διαφορά: ${newValue}%`
        : `Minimum Percentage Difference: ${newValue}%`;
    button.title = updatedTitle;

    const valueText = button.querySelector('.price-value-mobile');
    if (valueText) {
      valueText.textContent = newValue.toString();
    } else {
      const valueDisplay = button.querySelector('span');
      if (valueDisplay) {
        valueDisplay.textContent = newValue.toString();
      }
    }

    // Ensure symbols are % after update
    const mobileSymbol = button.querySelector(
      '.price-currency-symbol-mobile',
    ) as HTMLElement | null;
    if (mobileSymbol) mobileSymbol.textContent = '%';
    const desktopSymbol = button.querySelector('.price-currency-symbol') as HTMLElement | null;
    if (desktopSymbol) desktopSymbol.textContent = '%';
  }

  BrowserClient.setValue(StorageKey.MINIMUM_PRICE_DIFFERENCE, newValue);

  const productPage = document.querySelector('article.offering-card');
  if (productPage) {
    const event = new Event('priceThresholdChange');
    document.dispatchEvent(event);
  }
}
