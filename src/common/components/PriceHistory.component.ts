import { DomClient } from '../../clients/dom/client';
import { Language } from '../enums/Language.enum';

/**
 * The price history row: the average-price caption on the left (when supplied)
 * and the toggles on the right. The price checker appends the analysis toggle
 * into `.price-history-controls`.
 */
export function PriceHistoryComponent(
  language: Language,
  averagePriceLine?: HTMLElement | null,
): HTMLElement {
  const wrapper = DomClient.createElement('div', {
    className: 'price-history-wrapper',
  });

  const row = DomClient.createElement('div', {
    className: ['price-history-row', 'info-with-analysis-row'],
  });
  row.style.display = 'flex';
  row.style.flexDirection = 'row';

  if (averagePriceLine) {
    DomClient.appendElementToElement(averagePriceLine, row);
  }

  const controlsContainer = DomClient.createElement('div', {
    className: 'price-history-controls',
  });
  controlsContainer.style.display = 'flex';
  controlsContainer.style.flexDirection = 'column';
  controlsContainer.style.alignItems = 'stretch';
  controlsContainer.style.justifyContent = 'center';
  controlsContainer.style.gap = '6px';
  controlsContainer.style.marginLeft = 'auto';

  const toggleButton = DomClient.createElement('button', {
    className: ['analysis-toggle-button', 'price-history-toggle-button'],
  }) as HTMLButtonElement;
  toggleButton.type = 'button';

  const btnText = document.createElement('span');
  btnText.textContent = language === Language.GREEK ? 'Εξέλιξη τιμής' : 'Price history';

  const iconSpan = document.createElement('span');
  iconSpan.className = 'analysis-icon';
  iconSpan.innerHTML =
    '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3v18h18"/><polyline points="6.5 16.5 10 13 13 16 20 9"/></svg>';
  toggleButton.appendChild(btnText);
  toggleButton.appendChild(iconSpan);

  toggleButton.addEventListener('click', () => {
    const nativeBtn = document.querySelector<HTMLButtonElement>('.btn-reset.icon.price-history');
    nativeBtn?.click();
  });

  DomClient.appendElementToElement(toggleButton, controlsContainer);
  DomClient.appendElementToElement(controlsContainer, row);

  const line = document.createElement('hr');
  line.className = 'price-history-separator';
  line.style.border = 'none';
  line.style.borderTop = '1px solid currentColor';
  line.style.opacity = '0.2';
  line.style.margin = '2px 0 24px';
  DomClient.appendElementToElement(line, wrapper);

  DomClient.appendElementToElement(row, wrapper);

  return wrapper;
}
