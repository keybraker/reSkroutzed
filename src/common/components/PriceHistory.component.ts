import { DomClient } from '../../clients/dom/client';
import { ProductPriceHistory } from '../../clients/skroutz/client';
import { Language } from '../enums/Language.enum';
import { translate, TranslationKey } from '../utils/translations';

function getLifetimePriceAssessment(
  productPriceHistory: ProductPriceHistory,
  currentPrice: number,
  language: Language,
): string | null {
  const min = Number(productPriceHistory.minimumPrice);
  const max = Number(productPriceHistory.maximumPrice);

  if (!Number.isFinite(min) || !Number.isFinite(max)) {
    return null;
  }

  const priceRange = max - min;
  if (priceRange <= 0) {
    return null;
  }

  const pricePosition = (currentPrice - min) / priceRange;
  let key: TranslationKey;

  if (pricePosition <= 0.3) {
    key = 'priceHistory.lifetimeCheap';
  } else if (pricePosition <= 0.7) {
    key = 'priceHistory.lifetimeNormal';
  } else {
    key = 'priceHistory.lifetimeExpensive';
  }

  return translate(key, language);
}

export function PriceHistoryComponent(
  currentPriceState: 'expensive' | 'cheap' | 'normal',
  productPriceHistory: ProductPriceHistory,
  language: Language,
  currentPrice: number,
): HTMLElement {
  const wrapper = DomClient.createElement('div', {
    className: 'price-history-wrapper',
  });

  const row = DomClient.createElement('div', {
    className: ['price-history-row', 'info-with-analysis-row'],
  });
  row.style.display = 'flex';
  row.style.flexDirection = 'column';

  const assessmentsContainer = DomClient.createElement('div', {
    className: 'price-history-assessments',
  });
  assessmentsContainer.style.display = 'flex';
  assessmentsContainer.style.flexDirection = 'column';
  assessmentsContainer.style.gap = '4px';

  const labelSpan = document.createElement('span');
  labelSpan.className = 'price-history-label';
  labelSpan.textContent = translate(`priceHistory.${currentPriceState}`, language);
  DomClient.appendElementToElement(labelSpan, assessmentsContainer);

  const lifetimeAssessment = getLifetimePriceAssessment(
    productPriceHistory,
    currentPrice,
    language,
  );
  if (lifetimeAssessment) {
    const lifetimeSpan = document.createElement('span');
    lifetimeSpan.className = 'price-history-label';
    lifetimeSpan.textContent = lifetimeAssessment;
    DomClient.appendElementToElement(lifetimeSpan, assessmentsContainer);
  }

  const topRow = DomClient.createElement('div', {
    className: 'info-with-analysis-row',
  });
  topRow.style.display = 'flex';
  topRow.style.flexDirection = 'row';
  topRow.style.alignItems = 'center';
  topRow.style.gap = '16px';

  DomClient.appendElementToElement(assessmentsContainer, topRow);
  DomClient.appendElementToElement(topRow, row);

  const toggleButton = DomClient.createElement('button', {
    className: ['analysis-toggle-button', 'price-history-toggle-button'],
  }) as HTMLButtonElement;
  toggleButton.type = 'button';

  const btnText = document.createElement('span');
  btnText.textContent = language === Language.GREEK ? 'Εξέλιξη τιμής' : 'Price history';

  const iconSpan = document.createElement('span');
  iconSpan.className = 'analysis-icon';
  iconSpan.innerHTML =
    '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="4 14 8 10 12 14 20 6"/><polyline points="4 6 4 14 12 14"/></svg>';
  toggleButton.appendChild(btnText);
  toggleButton.appendChild(iconSpan);

  toggleButton.addEventListener('click', () => {
    const nativeBtn = document.querySelector<HTMLButtonElement>('.btn-reset.icon.price-history');
    nativeBtn?.click();
  });

  DomClient.appendElementToElement(toggleButton, topRow);

  const line = document.createElement('hr');
  line.className = 'price-history-separator';
  line.style.border = 'none';
  line.style.borderTop = '1px solid currentColor';
  line.style.opacity = '0.2';
  line.style.margin = '8px 0 24px';
  DomClient.appendElementToElement(line, wrapper);

  DomClient.appendElementToElement(row, wrapper);

  return wrapper;
}
