import { DomClient } from '../../clients/dom/client';
import { ProductPriceHistory } from '../../clients/skroutz/client';
import { Language } from '../enums/Language.enum';
import { translate, TranslationKey } from '../utils/translations';

type PriceLevel = 'cheap' | 'normal' | 'expensive';

const VERDICT_LABEL_KEY: Record<PriceLevel, TranslationKey> = {
  cheap: 'verdict.goodPrice',
  normal: 'verdict.okPrice',
  expensive: 'verdict.expensivePrice',
};

const VERDICT_MODIFIER: Record<PriceLevel, string> = {
  cheap: 'price-history-verdict--buy',
  normal: 'price-history-verdict--shortlist',
  expensive: 'price-history-verdict--dontbuy',
};

const VERDICT_ICON: Record<PriceLevel, string> = {
  cheap:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>',
  normal:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/></svg>',
  expensive:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>',
};

function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function getLifetimePriceLevel(
  productPriceHistory: ProductPriceHistory,
  currentPrice: number,
): PriceLevel | null {
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

  if (pricePosition <= 0.3) return 'cheap';
  if (pricePosition <= 0.7) return 'normal';
  return 'expensive';
}

/**
 * Builds the assessment sentence describing the current price, previously shown
 * as plain labels and now displayed as the verdict box subtitle.
 */
function buildAssessmentText(
  currentPriceState: PriceLevel,
  lifetimeLevel: PriceLevel | null,
  language: Language,
): string {
  if (lifetimeLevel && lifetimeLevel === currentPriceState) {
    return translate(
      `priceHistory.combined${capitalize(currentPriceState)}` as TranslationKey,
      language,
    );
  }

  const parts = [translate(`priceHistory.${currentPriceState}` as TranslationKey, language)];

  if (lifetimeLevel) {
    parts.push(
      translate(`priceHistory.lifetime${capitalize(lifetimeLevel)}` as TranslationKey, language),
    );
  }

  return parts.join(' • ');
}

/**
 * Creates the GOOD PRICE / OK PRICE / EXPENSIVE PRICE verdict box as an
 * image-style row: a coloured rounded icon square on the left, the bold
 * localized verdict label and the visible grey assessment sentence as
 * supporting text. The design and size are identical for every verdict — only
 * the colour modifier differs.
 */
function createVerdictBox(
  level: PriceLevel,
  assessmentText: string,
  language: Language,
): HTMLElement {
  const box = DomClient.createElement('div', {
    className: ['price-history-verdict', VERDICT_MODIFIER[level]],
  });

  const icon = DomClient.createElement('span', {
    className: 'price-history-verdict-icon',
  });
  icon.innerHTML = VERDICT_ICON[level];

  const textContainer = DomClient.createElement('span', {
    className: 'price-history-verdict-text',
  });

  const title = document.createElement('span');
  title.className = 'price-history-verdict-title';
  title.textContent = translate(VERDICT_LABEL_KEY[level], language);

  const subtitle = document.createElement('span');
  subtitle.className = 'price-history-verdict-subtitle';
  subtitle.textContent = assessmentText;

  DomClient.appendElementToElement(title, textContainer);
  DomClient.appendElementToElement(subtitle, textContainer);
  DomClient.appendElementToElement(icon, box);
  DomClient.appendElementToElement(textContainer, box);

  return box;
}

export function PriceHistoryComponent(
  currentPriceState: PriceLevel,
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
  assessmentsContainer.style.flex = '1 1 auto';
  assessmentsContainer.style.minWidth = '0';

  const lifetimeLevel = getLifetimePriceLevel(productPriceHistory, currentPrice);

  const verdictBox = createVerdictBox(
    currentPriceState,
    buildAssessmentText(currentPriceState, lifetimeLevel, language),
    language,
  );
  DomClient.appendElementToElement(verdictBox, assessmentsContainer);

  const topRow = DomClient.createElement('div', {
    className: ['info-with-analysis-row', 'price-history-content-row'],
  });
  topRow.style.display = 'flex';
  topRow.style.flexDirection = 'row';
  topRow.style.alignItems = 'center';
  topRow.style.justifyContent = 'space-between';
  topRow.style.gap = '16px';

  DomClient.appendElementToElement(assessmentsContainer, topRow);

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
    '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="4 14 8 10 12 14 20 6"/><polyline points="4 6 4 14 12 14"/></svg>';
  toggleButton.appendChild(btnText);
  toggleButton.appendChild(iconSpan);

  toggleButton.addEventListener('click', () => {
    const nativeBtn = document.querySelector<HTMLButtonElement>('.btn-reset.icon.price-history');
    nativeBtn?.click();
  });

  DomClient.appendElementToElement(toggleButton, controlsContainer);
  DomClient.appendElementToElement(controlsContainer, topRow);
  DomClient.appendElementToElement(topRow, row);

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
