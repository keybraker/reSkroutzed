import { DomClient } from '../../clients/dom/client';
import { Language } from '../enums/Language.enum';

/**
 * The price history row. With averages it renders the native-style inset panel:
 * the averages block, a hairline, then the toggles as links. Without averages
 * (or while they load) the toggles render bare in the row, so they always have a
 * home. The price checker appends the analysis toggle into
 * `.price-history-controls`.
 */
export function PriceHistoryComponent(
  language: Language,
  averagesBlock?: HTMLElement | null,
): HTMLElement {
  const wrapper = DomClient.createElement('div', {
    className: 'price-history-wrapper',
  });

  const row = DomClient.createElement('div', {
    className: ['price-history-row', 'info-with-analysis-row'],
  });
  row.style.display = 'flex';
  row.style.flexDirection = 'row';

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

  if (averagesBlock) {
    // The panel supplies the surface, so the hairline above the row is only
    // needed in the no-panel fallback.
    const panel = DomClient.createElement('div', {
      className: 'price-history-panel',
    });

    DomClient.appendElementToElement(averagesBlock, panel);
    DomClient.appendElementToElement(controlsContainer, panel);
    DomClient.appendElementToElement(panel, row);
  } else {
    DomClient.appendElementToElement(controlsContainer, row);

    const separator = document.createElement('hr');
    separator.className = 'price-history-separator';
    separator.style.border = 'none';
    separator.style.borderTop = '1px solid currentColor';
    separator.style.opacity = '0.2';
    separator.style.margin = '2px 0 24px';
    DomClient.appendElementToElement(separator, wrapper);
  }

  DomClient.appendElementToElement(row, wrapper);

  return wrapper;
}
