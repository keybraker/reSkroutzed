import { BestPriceClient, BestPriceProductData } from '../clients/best_price/client';
import { DomClient } from '../clients/dom/client';
import { ProductPriceData, ProductPriceHistory, SkroutzClient } from '../clients/skroutz/client';
import { PriceHistoryComponent } from '../common/components/PriceHistory.component';
import { Language } from '../common/enums/Language.enum';
import { State } from '../common/types/State.type';
import { FeatureInstance } from './common/FeatureInstance';
import { createBuyMeCoffeeElement } from './functions/createBuyMeCoffeeElement';
import { createReSkoutzedReviewElement } from './functions/createReskoutzedReviewElement';

const roundToZero = (value: number, precision = 1e-10): number => {
  return Math.abs(value) < precision ? 0 : value;
};

type PriceCheckerRenderOptions = {
  isBestPriceLoading?: boolean;
  isPriceHistoryLoading?: boolean;
};

type PriceDisplayActionOptions = {
  classNames?: string[];
  price: number;
  shippingCost?: number;
  priceClassNames?: string[];
  language: Language;
  subtitleText: string;
  title?: string;
  ariaLabel: string;
  href?: string;
  onClick?: () => void;
  notificationLogo?: HTMLElement | SVGSVGElement;
};

function createPriceCheckerFallbackElement(language: Language): HTMLDivElement {
  const fallback = document.createElement('div');
  fallback.className = 'price-checker-outline';
  fallback.textContent =
    language === Language.ENGLISH ? 'Price info unavailable' : 'Μη διαθέσιμη πληροφορία τιμής';

  return fallback as HTMLDivElement;
}

function createSkeletonBlock(extraClasses: string[] = []): HTMLDivElement {
  return DomClient.createElement('div', {
    className: ['price-checker-skeleton-block', ...extraClasses],
  }) as HTMLDivElement;
}

function createPriceDisplayLoadingAction(
  classNames: string[] = [
    'price-display-action',
    'price-display-bestprice-action',
    'bestprice-badge',
    'bestprice-badge-loading',
  ],
  options: { includeNotificationLogo?: boolean } = {},
): HTMLDivElement {
  const action = DomClient.createElement('div', {
    className: ['price-display-action', ...classNames],
  }) as HTMLDivElement;
  action.setAttribute('aria-hidden', 'true');

  const content = DomClient.createElement('div', {
    className: 'price-display-action-content',
  }) as HTMLDivElement;

  DomClient.appendElementToElement(createSkeletonBlock(['price-checker-skeleton-price']), content);
  DomClient.appendElementToElement(
    createSkeletonBlock(['price-checker-skeleton-shipping']),
    content,
  );
  DomClient.appendElementToElement(
    createSkeletonBlock(['price-checker-skeleton-badge-label']),
    content,
  );
  DomClient.appendElementToElement(content, action);

  if (options.includeNotificationLogo) {
    const notification = DomClient.createElement('div', {
      className: 'price-display-action-notification',
    }) as HTMLDivElement;
    DomClient.appendElementToElement(
      createSkeletonBlock(['price-checker-skeleton-logo']),
      notification,
    );
    DomClient.appendElementToElement(notification, action);
  }

  const arrow = DomClient.createElement('span', {
    className: ['price-display-action-arrow', 'price-display-action-arrow-loading'],
  }) as HTMLSpanElement;
  arrow.setAttribute('aria-hidden', 'true');
  DomClient.appendElementToElement(createSkeletonBlock(['price-checker-skeleton-arrow']), arrow);
  DomClient.appendElementToElement(arrow, action);

  return action;
}

function createStorePriceLoadingAction(): HTMLDivElement {
  return createPriceDisplayLoadingAction(['price-display-store-action']);
}

function createBestPriceLoadingBadge(): HTMLDivElement {
  return createPriceDisplayLoadingAction(
    ['price-display-bestprice-action', 'bestprice-badge', 'bestprice-badge-loading'],
    { includeNotificationLogo: true },
  );
}

function createPriceHistoryLoadingComponent(): HTMLDivElement {
  const wrapper = DomClient.createElement('div', {
    className: ['price-history-wrapper', 'price-history-loading-wrapper'],
  }) as HTMLDivElement;

  const row = DomClient.createElement('div', {
    className: ['price-history-row', 'info-with-analysis-row', 'price-history-loading-row'],
  }) as HTMLDivElement;
  const topRow = DomClient.createElement('div', {
    className: ['info-with-analysis-row', 'price-history-loading-top-row'],
  }) as HTMLDivElement;
  const assessments = DomClient.createElement('div', {
    className: ['price-history-assessments', 'price-history-loading-assessments'],
  }) as HTMLDivElement;
  const controls = DomClient.createElement('div', {
    className: 'price-history-controls',
  }) as HTMLDivElement;

  DomClient.appendElementToElement(
    createSkeletonBlock(['price-checker-skeleton-history-copy']),
    assessments,
  );
  DomClient.appendElementToElement(
    createSkeletonBlock([
      'price-checker-skeleton-history-copy',
      'price-checker-skeleton-history-copy-secondary',
    ]),
    assessments,
  );

  DomClient.appendElementToElement(assessments, topRow);
  DomClient.appendElementToElement(createSkeletonBlock(['price-checker-skeleton-chip']), controls);
  DomClient.appendElementToElement(controls, topRow);
  DomClient.appendElementToElement(topRow, row);
  DomClient.appendElementToElement(row, wrapper);

  return wrapper;
}

function createStoreAvailabilitySkeletonElement(): HTMLDivElement {
  const container = DomClient.createElement('div', {
    className: ['store-availability-outline', 'store-availability-loading'],
  }) as HTMLDivElement;

  DomClient.appendElementToElement(
    createSkeletonBlock(['price-checker-skeleton-status']),
    container,
  );
  DomClient.appendElementToElement(
    createSkeletonBlock(['price-checker-skeleton-summary']),
    container,
  );
  DomClient.appendElementToElement(
    createSkeletonBlock(['price-checker-skeleton-summary-short']),
    container,
  );

  return container;
}

function createPromotionSkeletonElement(): HTMLDivElement {
  const promotion = DomClient.createElement('div', {
    className: ['own-promotion', 'own-promotion-loading'],
  }) as HTMLDivElement;
  const row = DomClient.createElement('div', {
    className: 'store-availability-row',
  }) as HTMLDivElement;
  const left = DomClient.createElement('div', {
    className: 'store-availability-left',
  }) as HTMLDivElement;
  const right = DomClient.createElement('div', {
    className: 'store-availability-right',
  }) as HTMLDivElement;

  DomClient.appendElementToElement(createSkeletonBlock(['price-checker-skeleton-circle']), left);
  DomClient.appendElementToElement(
    createSkeletonBlock(['price-checker-skeleton-review-copy']),
    right,
  );

  DomClient.appendElementToElement(left, row);
  DomClient.appendElementToElement(right, row);
  DomClient.appendElementToElement(row, promotion);

  return promotion;
}

function createPriceCheckerSkeleton(): HTMLDivElement {
  const stack = DomClient.createElement('div', {
    className: ['price-checker-stack', 'price-checker-loading-stack'],
  }) as HTMLDivElement;
  stack.setAttribute('aria-busy', 'true');
  stack.setAttribute('aria-live', 'polite');

  const priceIndication = DomClient.createElement('div', {
    className: ['display-padding', 'price-checker-outline', 'price-checker-loading'],
  }) as HTMLDivElement;
  priceIndication.style.marginTop = '14px';

  const contentContainer = DomClient.createElement('div', {
    className: 'inline-flex-col',
  }) as HTMLDivElement;
  const priceCalculationContainer = DomClient.createElement('div', {
    className: 'price-calculation-container',
  }) as HTMLDivElement;
  const priceDisplay = DomClient.createElement('div', {
    className: 'price-display-wrapper',
  }) as HTMLDivElement;
  const priceDisplayRow = DomClient.createElement('div', {
    className: 'price-display-row',
  }) as HTMLDivElement;

  DomClient.appendElementToElement(createStorePriceLoadingAction(), priceDisplayRow);
  DomClient.appendElementToElement(createPriceDisplayDivider(), priceDisplayRow);
  DomClient.appendElementToElement(createBestPriceLoadingBadge(), priceDisplayRow);
  DomClient.appendElementToElement(priceDisplayRow, priceDisplay);

  DomClient.appendElementToElement(priceDisplay, priceCalculationContainer);
  DomClient.appendElementToElement(priceCalculationContainer, contentContainer);
  DomClient.appendElementToElement(createPriceHistoryLoadingComponent(), contentContainer);
  DomClient.appendElementToElement(createStoreAvailabilitySkeletonElement(), contentContainer);
  DomClient.appendElementToElement(contentContainer, priceIndication);

  DomClient.appendElementToElement(priceIndication, stack);
  DomClient.appendElementToElement(createPromotionSkeletonElement(), stack);

  return stack;
}

function createPriceDisplayComponent(
  productPriceData: ProductPriceData,
  price: number,
  shippingCost: number,
  language: Language,
  bestPriceProductData?: BestPriceProductData,
  isBestPriceLoading = false,
): HTMLDivElement {
  const storePriceClassNames = getPriceComparisonClassNames(
    productPriceData.buyThroughSkroutz.totalPrice,
    productPriceData.buyThroughStore.totalPrice,
  );

  if (bestPriceProductData || isBestPriceLoading) {
    const row = DomClient.createElement('div', {
      className: 'price-display-row',
    }) as HTMLDivElement;
    DomClient.appendElementToElement(
      createStorePriceAction(productPriceData, price, shippingCost, language),
      row,
    );
    DomClient.appendElementToElement(createPriceDisplayDivider(), row);
    if (bestPriceProductData) {
      DomClient.appendElementToElement(
        createBestPriceBadge(
          bestPriceProductData,
          productPriceData.buyThroughSkroutz.totalPrice,
          language,
        ),
        row,
      );
    } else {
      DomClient.appendElementToElement(createBestPriceLoadingBadge(), row);
    }

    const container = DomClient.createElement('div', {
      className: 'price-display-wrapper',
    }) as HTMLDivElement;
    DomClient.appendElementToElement(row, container);

    return container;
  }

  const container = DomClient.createElement('div', {
    className: 'price-display-wrapper',
  }) as HTMLDivElement;

  const priceElement = createFormattedPriceElement(price, storePriceClassNames);
  DomClient.appendElementToElement(priceElement, container);

  const shippingText = DomClient.createElement('div', { className: 'shipping-cost-text' });
  shippingText.classList.add(...storePriceClassNames);
  const formattedShipping = shippingCost.toFixed(2).replace('.', ',');
  shippingText.textContent = `(+${formattedShipping}€ ${
    language === Language.ENGLISH ? 'shipping' : 'μεταφορικά'
  })`;
  DomClient.appendElementToElement(shippingText, container);

  const notAvailable = DomClient.createElement('div', { className: 'bestprice-unavailable' });
  notAvailable.textContent =
    language === Language.ENGLISH ? 'BestPrice not available' : 'BestPrice: δεν βρέθηκε';
  DomClient.appendElementToElement(notAvailable, container);

  return container;
}

function getPriceComparisonClassNames(
  skroutzTotalPrice: number,
  comparedOfferTotalPrice: number,
): string[] {
  const priceDifference = roundToZero(comparedOfferTotalPrice - skroutzTotalPrice);

  if (priceDifference < 0) {
    return ['price-display-action-positive'];
  }

  if (priceDifference > 0) {
    return ['price-display-action-negative'];
  }

  return [];
}

function createFormattedPriceElement(price: number, extraClasses: string[] = []): HTMLDivElement {
  const priceElement = DomClient.createElement('div', {
    className: ['price-indicator-price', ...extraClasses],
  }) as HTMLDivElement;

  const [integerPart, decimalPart] = price.toFixed(2).split('.');

  priceElement.textContent = integerPart;

  const priceComma = DomClient.createElement('span', { className: 'price-indicator-comma' });
  priceComma.textContent = ',';
  DomClient.appendElementToElement(priceComma, priceElement);

  const priceDecimal = DomClient.createElement('span', { className: 'price-indicator-decimal' });
  priceDecimal.textContent = decimalPart;
  DomClient.appendElementToElement(priceDecimal, priceElement);

  const currencySymbol = DomClient.createElement('span', { className: 'price-indicator-currency' });
  currencySymbol.textContent = '€';
  DomClient.appendElementToElement(currencySymbol, priceElement);

  return priceElement;
}

function createShippingCostElement(
  shippingCost: number,
  language: Language,
  extraClasses: string[] = [],
): HTMLDivElement {
  const shippingText = DomClient.createElement('div', {
    className: ['shipping-cost-text', ...extraClasses],
  }) as HTMLDivElement;
  const formattedShipping = shippingCost.toFixed(2).replace('.', ',');
  shippingText.textContent = `(+${formattedShipping}€ ${
    language === Language.ENGLISH ? 'shipping' : 'μεταφορικά'
  })`;

  return shippingText;
}

function createPriceDisplaySubtitle(
  language: Language,
  extraClasses: string[] = [],
  preferredText?: string,
): HTMLDivElement {
  const subtitle = DomClient.createElement('div', {
    className: ['price-display-subtitle', ...extraClasses],
  }) as HTMLDivElement;
  subtitle.textContent =
    preferredText ??
    (language === Language.ENGLISH ? 'Buy through store' : 'Αγορά μέσω καταστήματος');

  return subtitle;
}

function createPriceDisplayActionArrow(): HTMLSpanElement {
  const arrow = DomClient.createElement('span', {
    className: 'price-display-action-arrow',
  }) as HTMLSpanElement;
  arrow.setAttribute('aria-hidden', 'true');
  arrow.innerHTML =
    '<svg viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4 2L8 6L4 10" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg>';

  return arrow;
}

function createBestPriceLogo(): SVGSVGElement {
  const logo = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  logo.setAttribute('viewBox', '0 0 44 28');
  logo.setAttribute('aria-hidden', 'true');
  logo.classList.add('bestprice-badge-logo');

  const logoPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  logoPath.setAttribute('fill-rule', 'evenodd');
  logoPath.setAttribute(
    'd',
    'M25.016 8.96052C25.3883 8.98468 25.9053 8.91067 25.9914 9.40857C26.0751 9.8923 25.5021 10.1517 25.1015 10.2202C24.1869 10.377 23.2839 10.0922 22.4875 9.65742L22.2603 9.53529L21.5837 12.7709C22.9048 13.1744 24.5267 13.2773 25.8989 13.0421C28.2431 12.6404 30.3538 10.9752 29.9109 8.4146C29.5958 6.59385 28.2426 5.91754 26.5204 5.8318L25.5998 5.7846C25.2872 5.76493 24.7914 5.79123 24.7224 5.39303C24.6462 4.95211 25.1243 4.73833 25.4674 4.67941C26.3249 4.53251 27.1299 4.76076 27.8804 5.10075L28.4475 2.25371L28.9046 4.89594L31.0457 4.42658L32.3156 11.7668L36.2322 11.0956L34.9621 3.75537L37.1378 3.48522L36.5348 0L28.3015 1.41083L28.4316 2.16237C27.2896 1.72523 26.1166 1.60942 24.8846 1.82065C22.5403 2.22231 20.4565 4.04419 20.897 6.59038C21.1853 8.25475 22.6149 8.94727 24.2052 8.95297L25.016 8.96052ZM21.0173 10.6856L17.6011 11.271L17.419 10.2184L20.435 9.70156L19.9526 6.91345L16.9366 7.43021L16.7593 6.40596L20.0612 5.84027L19.5542 2.90984L12.3072 4.15174L14.1579 14.8482L10.4896 15.4768C12.1488 15.0332 13.6351 13.9518 13.2939 11.9798C13.0699 10.6852 12.1957 9.9709 10.9379 9.76171L10.9231 9.67638C11.829 9.21345 12.129 8.22467 11.9641 7.27169C11.5359 4.79655 9.33413 4.66126 7.23299 5.02113L2.67325 5.80255L4.52388 16.4989L0 17.2742L1.85586 28L5.62947 27.3532L5.07069 24.1242L7.07183 23.7813C9.25883 23.4065 10.3948 21.8058 10.0158 19.6152C9.59539 17.1848 7.82292 16.1729 5.6015 16.3446L9.55338 15.6672L11.4041 26.3638L15.2349 25.7074L14.6393 22.2649L17.0216 25.4011L25.3117 23.9806L23.4561 13.2549L21.5193 13.5867L21.0173 10.6856ZM6.24871 20.1288C6.3988 20.9965 5.67517 21.2378 4.98913 21.3553L4.60308 21.4213L4.28066 19.5579L4.65236 19.4943C5.29557 19.3841 6.10343 19.2896 6.24871 20.1288ZM7.01763 9.30581L6.75186 7.76949L7.46648 7.64705C7.9096 7.5711 8.35118 7.65653 8.4521 8.23976C8.58017 8.97938 7.94669 9.14657 7.37499 9.24454L7.01763 9.30581ZM8.15969 13.2698L7.71658 13.3457L7.40891 11.5676L7.79485 11.5014C8.42382 11.3937 9.42193 11.2079 9.57705 12.1042C9.7296 12.986 8.78856 13.1619 8.15969 13.2698ZM14.4727 19.6861L14.2012 19.7327L13.8862 17.9121L14.1864 17.8606C14.8725 17.743 15.4591 17.7304 15.6043 18.5697C15.742 19.3663 15.1161 19.5761 14.4727 19.6861ZM18.5913 21.5436C18.3203 21.2532 18.0645 21.1359 17.823 21.0162L17.8083 20.9308C19.1658 20.1856 19.6958 19.421 19.4128 17.7851C18.9902 15.3427 17.1354 14.5573 14.9783 14.7378L19.5447 13.9552L21.3585 24.4386L18.5913 21.5436ZM28.9009 17.8439C28.6989 16.6772 29.4966 15.5885 30.6688 15.3877C31.5692 15.2333 32.4273 15.5989 33.1571 16.0744L32.3363 12.0113C31.4439 11.8715 30.5306 11.8668 29.6301 12.0211C26.4711 12.5625 24.4312 15.4897 24.9728 18.6193C25.502 21.6776 28.3144 23.6419 31.3876 23.1154C32.0881 22.9952 33.5406 22.6292 34.1009 22.2109L33.5213 18.1797C32.9985 18.8991 32.3643 19.4033 31.4495 19.56C30.2775 19.761 29.1049 19.0244 28.9009 17.8439ZM33.527 14.936L33.3689 16.574L34.5123 16.3781L34.5962 16.8616L33.8813 16.9843L33.7234 18.6223L35.167 18.3751C36.3082 20.3766 38.5222 21.5203 40.9665 21.1014C41.667 20.9814 43.1196 20.6155 43.68 20.1971L43.3099 17.463C42.1131 17.9462 40.6457 18.2271 39.598 17.6156L42.4281 17.1308L42.5863 15.4925L38.5553 16.1832C38.5311 16.1288 38.5213 16.0718 38.5116 16.015L38.4796 15.83L38.4573 15.702L42.0738 15.0823L42.2319 13.4441L38.8585 14.022C39.6472 13.052 41.2292 12.7518 42.5282 12.6902L41.9153 9.99771C41.0226 9.85784 40.1094 9.85316 39.2088 10.0075C36.6933 10.4385 34.8702 12.4061 34.5275 14.7643L33.527 14.936ZM33.2002 24.6066C32.7805 24.6066 32.3434 24.8759 32.3434 25.3336C32.3434 25.7857 32.7806 26.0431 33.2002 26.0431C33.6199 26.0431 34.0568 25.7857 34.0568 25.3336C34.0569 24.8758 33.6199 24.6066 33.2002 24.6066ZM36.443 24.4522H37.1559C37.0813 24.7097 36.765 24.83 36.5178 24.83C36.0061 24.83 35.707 24.3836 35.707 23.9086C35.707 23.388 36.0175 22.9074 36.581 22.9074C36.8342 22.9074 37.0584 23.0161 37.179 23.2392L38.6509 22.7014C38.3118 21.9632 37.2768 21.5911 36.5234 21.5911C35.1607 21.5911 34.1201 22.4438 34.1201 23.8458C34.1201 25.2304 35.1896 26.0431 36.5121 26.0431C37.179 26.0431 37.892 25.7798 38.3521 25.2763C38.8637 24.7213 38.8581 24.1433 38.8753 23.4339H36.4431L36.443 24.4522Z',
  );
  logo.appendChild(logoPath);

  return logo;
}

function createPriceDisplayDivider(): HTMLDivElement {
  const divider = DomClient.createElement('div', {
    className: 'price-display-divider',
  }) as HTMLDivElement;
  divider.setAttribute('aria-hidden', 'true');

  return divider;
}

function createPriceDisplayAction(
  options: PriceDisplayActionOptions,
): HTMLAnchorElement | HTMLButtonElement {
  const element = options.href
    ? (document.createElement('a') as HTMLAnchorElement | HTMLButtonElement)
    : (document.createElement('button') as HTMLAnchorElement | HTMLButtonElement);

  element.className = ['price-display-action', ...(options.classNames ?? [])].join(' ');
  element.title = options.title ?? '';
  element.setAttribute('aria-label', options.ariaLabel);

  if (element instanceof HTMLAnchorElement && options.href) {
    element.href = options.href;
    element.target = '_blank';
    element.rel = 'noopener noreferrer';
  }

  if (element instanceof HTMLButtonElement) {
    element.type = 'button';
  }

  const content = DomClient.createElement('div', {
    className: 'price-display-action-content',
  }) as HTMLDivElement;

  DomClient.appendElementToElement(
    createFormattedPriceElement(options.price, options.priceClassNames ?? []),
    content,
  );

  if (options.shippingCost !== undefined) {
    DomClient.appendElementToElement(
      createShippingCostElement(options.shippingCost, options.language, options.priceClassNames),
      content,
    );
  }

  DomClient.appendElementToElement(
    createPriceDisplaySubtitle(options.language, [], options.subtitleText),
    content,
  );

  DomClient.appendElementToElement(content, element);

  if (options.notificationLogo) {
    const notification = DomClient.createElement('div', {
      className: 'price-display-action-notification',
    }) as HTMLDivElement;
    DomClient.appendElementToElement(options.notificationLogo, notification);
    DomClient.appendElementToElement(notification, element);
  }

  DomClient.appendElementToElement(createPriceDisplayActionArrow(), element);

  if (options.onClick) {
    element.addEventListener('click', options.onClick);
  }

  return element;
}

function createStorePriceAction(
  productPriceData: ProductPriceData,
  price: number,
  shippingCost: number,
  language: Language,
): HTMLButtonElement {
  const priceClassNames = getPriceComparisonClassNames(
    productPriceData.buyThroughSkroutz.totalPrice,
    productPriceData.buyThroughStore.totalPrice,
  );

  return createPriceDisplayAction({
    classNames: ['price-display-store-action', ...priceClassNames],
    price,
    shippingCost,
    priceClassNames,
    language,
    subtitleText: language === Language.ENGLISH ? 'Buy through store' : 'Αγορά μέσω καταστήματος',
    title:
      language === Language.ENGLISH
        ? 'Go to the matching store offer'
        : 'Μετάβαση στην αντίστοιχη προσφορά καταστήματος',
    ariaLabel:
      language === Language.ENGLISH ? 'Go to store offer' : 'Μετάβαση στην προσφορά καταστήματος',
    onClick: (): void => {
      scrollToShop(productPriceData.buyThroughStore.shopId);
    },
  }) as HTMLButtonElement;
}

function createBestPriceBadge(
  bestPriceProductData: BestPriceProductData,
  skroutzTotalPrice: number,
  language: Language,
): HTMLAnchorElement {
  const bestPriceTotal =
    bestPriceProductData.totalPrice ??
    bestPriceProductData.price + (bestPriceProductData.shippingCost ?? 0);
  const priceClassNames = getPriceComparisonClassNames(skroutzTotalPrice, bestPriceTotal);

  const bestPriceLink = createPriceDisplayAction({
    classNames: ['price-display-bestprice-action', 'bestprice-badge', ...priceClassNames],
    price: bestPriceProductData.price,
    shippingCost: bestPriceProductData.shippingCost,
    priceClassNames,
    language,
    subtitleText: language === Language.ENGLISH ? 'Buy through BestPrice' : 'Αγορά μέσω BestPrice',
    title: bestPriceProductData.title,
    ariaLabel:
      language === Language.ENGLISH
        ? 'Open BestPrice product page'
        : 'Άνοιγμα σελίδας προϊόντος στο BestPrice',
    href: bestPriceProductData.url,
    notificationLogo: createBestPriceLogo(),
  }) as HTMLAnchorElement;

  if (bestPriceProductData.shippingCost !== undefined) {
    bestPriceLink.title = `${bestPriceProductData.title} · ${bestPriceProductData.price
      .toFixed(2)
      .replace('.', ',')}€ (+${bestPriceProductData.shippingCost.toFixed(2).replace('.', ',')}€ ${
      language === Language.ENGLISH ? 'shipping' : 'μεταφορικά'
    })`;
  }

  return bestPriceLink;
}

function createAnalysisToggleButton(
  analysisContainer: HTMLDivElement,
  language: Language,
): HTMLButtonElement {
  const analysisButton = DomClient.createElement('button', {
    className: ['analysis-toggle-button'],
  }) as HTMLButtonElement;
  analysisButton.type = 'button';
  analysisButton.setAttribute('aria-expanded', 'false');
  analysisButton.setAttribute('aria-controls', analysisContainer.id);

  const analysisLabel = language === Language.ENGLISH ? 'Analysis' : 'Ανάλυση';
  const labelSpan = document.createElement('span');
  labelSpan.textContent = analysisLabel;

  const iconSpan = document.createElement('span');
  iconSpan.className = 'analysis-icon';
  iconSpan.innerHTML =
    '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>';

  analysisButton.appendChild(labelSpan);
  analysisButton.appendChild(iconSpan);
  analysisButton.addEventListener('click', () => {
    const willShow = analysisContainer.style.display === 'none';
    if (willShow) {
      analysisContainer.style.display = 'flex';
      analysisContainer.classList.add('visible');
    } else {
      analysisContainer.style.display = 'none';
      analysisContainer.classList.remove('visible');
    }
    analysisButton.setAttribute('aria-expanded', String(willShow));
    analysisButton.classList.toggle('expanded', willShow);
  });

  return analysisButton;
}

function createPriceComparisonBreakdownComponent(
  productPriceData: ProductPriceData,
  language: Language,
  bestPriceProductData?: BestPriceProductData,
): HTMLElement {
  const transportationBreakdown = DomClient.createElement('div', {
    className: 'transportation-breakdown',
  });
  if (productPriceData.buyThroughSkroutz.shopId === productPriceData.buyThroughStore.shopId) {
    return transportationBreakdown;
  }

  const getLabel = (english: string, greek: string): string =>
    language === Language.ENGLISH ? english : greek;
  transportationBreakdown.style.display = 'flex';
  transportationBreakdown.style.flexDirection = 'row';
  transportationBreakdown.style.gap = '10px';

  const skroutzContainer = DomClient.createElement('div', { className: 'price-breakdown-item' });
  const skroutzLabel = DomClient.createElement('div', { className: 'breakdown-label' });
  skroutzLabel.textContent = getLabel('Buy Through Skroutz', 'Αγορά μέσω Skroutz');

  const skroutzValue = DomClient.createElement('div', { className: 'breakdown-value' });
  skroutzValue.innerHTML = `${productPriceData.buyThroughSkroutz.price.toFixed(
    2,
  )}€ + ${productPriceData.buyThroughSkroutz.shippingCost.toFixed(
    2,
  )}€ = ${productPriceData.buyThroughSkroutz.totalPrice.toFixed(2)}€`;

  DomClient.appendElementToElement(skroutzLabel, skroutzContainer);
  DomClient.appendElementToElement(skroutzValue, skroutzContainer);

  const storeContainer = DomClient.createElement('div', { className: 'price-breakdown-item' });
  const storeLabel = DomClient.createElement('div', { className: 'breakdown-label' });
  storeLabel.textContent = getLabel('Buy through Store', 'Αγορά μέσω καταστήματος');

  const storeValue = DomClient.createElement('div', { className: 'breakdown-value' });
  storeValue.textContent = `${productPriceData.buyThroughStore.price.toFixed(
    2,
  )}€ + ${productPriceData.buyThroughStore.shippingCost.toFixed(
    2,
  )}€ = ${productPriceData.buyThroughStore.totalPrice.toFixed(2)}€`;

  DomClient.appendElementToElement(storeLabel, storeContainer);
  DomClient.appendElementToElement(storeValue, storeContainer);

  DomClient.appendElementToElement(skroutzContainer, transportationBreakdown);
  DomClient.appendElementToElement(storeContainer, transportationBreakdown);

  if (bestPriceProductData) {
    const bestPriceContainer = DomClient.createElement('div', {
      className: 'price-breakdown-item',
    });
    const bestLabel = DomClient.createElement('div', { className: 'breakdown-label' });
    bestLabel.textContent = language === Language.ENGLISH ? 'BestPrice' : 'BestPrice';

    const bestValue = DomClient.createElement('div', { className: 'breakdown-value' });
    const bpPrice = bestPriceProductData.price.toFixed(2);
    const bpShipping =
      bestPriceProductData.shippingCost !== undefined
        ? bestPriceProductData.shippingCost.toFixed(2)
        : null;
    const bpTotalNum =
      bestPriceProductData.totalPrice ??
      bestPriceProductData.price + (bestPriceProductData.shippingCost ?? 0);
    const bpTotal = bpTotalNum.toFixed(2);

    if (bpShipping !== null) {
      bestValue.textContent = `${bpPrice}€ + ${bpShipping}€ = ${bpTotal}€`;
    } else {
      bestValue.textContent = `${bpPrice}€ = ${bpTotal}€`;
    }

    DomClient.appendElementToElement(bestLabel, bestPriceContainer);
    DomClient.appendElementToElement(bestValue, bestPriceContainer);
    DomClient.appendElementToElement(bestPriceContainer, transportationBreakdown);
  }

  return transportationBreakdown;
}

function createCalculationComponent(
  productPriceData: ProductPriceData,
  minimumPriceDifference: number,
  language: Language,
  bestPriceProductData?: BestPriceProductData,
): HTMLDivElement {
  const calculationContainer = DomClient.createElement('div', {
    className: 'calculation-container',
  }) as HTMLDivElement;
  const priceDifference = roundToZero(
    productPriceData.buyThroughSkroutz.totalPrice - productPriceData.buyThroughStore.totalPrice,
  );
  const differenceAbsolute = Math.abs(priceDifference);
  const base = productPriceData.buyThroughStore.totalPrice;
  const percentDiff = base > 0 ? (differenceAbsolute / base) * 100 : 0;
  const buyingThroughSkroutz =
    language === Language.ENGLISH
      ? 'Buying through Skroutz is'
      : 'Με "Aγορά μέσω Skroutz" είναι κατά';
  const priceComparisonLead = document.createElement('div');
  priceComparisonLead.className = 'calculation-lead';
  priceComparisonLead.textContent = buyingThroughSkroutz;

  if (productPriceData.buyThroughSkroutz.shopId === productPriceData.buyThroughStore.shopId) {
    calculationContainer.innerHTML = `${
      language === Language.ENGLISH
        ? 'Both options are from the same shop'
        : 'Και οι δύο επιλογές είναι από το ίδιο κατάστημα'
    }`;
  } else if (priceDifference === 0) {
    calculationContainer.innerHTML = `${
      language === Language.ENGLISH
        ? 'There is no difference in price'
        : 'Δεν υπάρχει διαφορά στην τιμή'
    }`;
  } else if (priceDifference <= 0) {
    const cheaper = language === Language.ENGLISH ? 'cheaper' : 'φθηνότερο';
    calculationContainer.appendChild(priceComparisonLead);
    const priceDifferenceLine = document.createElement('div');
    priceDifferenceLine.innerHTML = `<strong>${differenceAbsolute.toFixed(
      2,
    )}€ <u>${cheaper}</u></strong> (${productPriceData.buyThroughStore.totalPrice.toFixed(
      2,
    )}€ - ${productPriceData.buyThroughSkroutz.totalPrice.toFixed(2)}€)`;
    calculationContainer.appendChild(priceDifferenceLine);
  } else {
    calculationContainer.classList.add('calculation-negative');
    const moreExpensive = language === Language.ENGLISH ? 'more expensive' : 'ακριβότερο';
    calculationContainer.appendChild(priceComparisonLead);
    const priceDifferenceLine = document.createElement('div');
    priceDifferenceLine.innerHTML = `<strong>${differenceAbsolute.toFixed(
      2,
    )}€ <u>${moreExpensive}</u></strong> (${productPriceData.buyThroughSkroutz.totalPrice.toFixed(
      2,
    )}€ - ${productPriceData.buyThroughStore.totalPrice.toFixed(2)}€)`;
    calculationContainer.appendChild(priceDifferenceLine);
  }

  if (minimumPriceDifference > 0) {
    const isBelow = percentDiff <= minimumPriceDifference;
    const message =
      language === Language.ENGLISH
        ? `${
            isBelow ? 'Below' : 'Exceeds'
          } the minimum percentage difference threshold of ${minimumPriceDifference.toFixed(1)}% (Δ=${percentDiff.toFixed(
            1,
          )}%)`
        : `${
            isBelow ? 'Κάτω από' : 'Υπερβαίνει'
          } την ελάχιστη ποσοστιαία διαφορά ${minimumPriceDifference.toFixed(1)}% (Δ=${percentDiff.toFixed(
            1,
          )}%)`;

    const span = document.createElement('span');
    span.className = 'minimum-price-difference-text';
    span.textContent = message;
    DomClient.appendElementToElement(span, calculationContainer);
  }

  if (bestPriceProductData) {
    const bestPriceTotal = bestPriceProductData.totalPrice ?? bestPriceProductData.price;
    const bestPriceDifference = roundToZero(
      productPriceData.buyThroughSkroutz.totalPrice - bestPriceTotal,
    );
    const bestPriceTotalsText = `(${productPriceData.buyThroughSkroutz.totalPrice.toFixed(
      2,
    )}€ - ${bestPriceTotal.toFixed(2)}€)`;

    const bestPriceComparison = document.createElement('span');
    bestPriceComparison.className = 'bestprice-comparison-text';

    if (bestPriceDifference === 0) {
      bestPriceComparison.textContent =
        language === Language.ENGLISH
          ? `BestPrice has the same total price as this option ${bestPriceTotalsText}`
          : `Το BestPrice έχει την ίδια συνολική τιμή ${bestPriceTotalsText}`;
    } else if (bestPriceDifference > 0) {
      bestPriceComparison.innerHTML =
        language === Language.ENGLISH
          ? `<strong>BestPrice</strong> is <strong>${bestPriceDifference.toFixed(
              2,
            )}€ cheaper</strong> than this option ${bestPriceTotalsText}`
          : `Το <strong>BestPrice</strong> είναι <strong>${bestPriceDifference.toFixed(
              2,
            )}€ <u>φθηνότερο</u></strong> ${bestPriceTotalsText}`;
    } else {
      bestPriceComparison.innerHTML =
        language === Language.ENGLISH
          ? `<strong>BestPrice</strong> is <strong>${Math.abs(bestPriceDifference).toFixed(
              2,
            )}€ more expensive</strong> than this option ${bestPriceTotalsText}`
          : `Το <strong>BestPrice</strong> είναι <strong>${Math.abs(bestPriceDifference).toFixed(
              2,
            )}€ <u>ακριβότερο</u></strong> ${bestPriceTotalsText}`;
    }

    DomClient.appendElementToElement(bestPriceComparison, calculationContainer);
  }

  return calculationContainer;
}

function scrollToShop(shopId: number): void {
  const sliderToggleButton = document.querySelector(
    '.alternative-option-wrapper.btn-reset',
  ) as HTMLButtonElement | null;

  if (sliderToggleButton) {
    sliderToggleButton.click();
  }

  setTimeout(() => {
    const targetId = `shop-${shopId}`;
    const targetElements = document.querySelectorAll(`#${targetId}`);

    if (targetElements.length > 0) {
      const targetElement = targetElements.length > 1 ? targetElements[1] : targetElements[0];

      targetElement.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
        inline: 'center',
      });
      targetElement.classList.add('lowest-price-store-highlight');

      setTimeout(() => {
        targetElement.classList.remove('lowest-price-store-highlight');
      }, 3000);
    }
  }, 300);
}

function createCityElement(city: string, shopIds: number[]): HTMLSpanElement {
  if (shopIds.length === 0) {
    const span = document.createElement('span');
    span.textContent = city;
    return span;
  }

  if (shopIds.length === 1) {
    const link = document.createElement('span');
    link.className = 'city-shop-link';
    link.textContent = city;
    link.addEventListener('click', () => scrollToShop(shopIds[0]));
    return link;
  }

  // Multiple shops: "CityName (1, 2)"
  const wrapper = document.createElement('span');

  const cityText = document.createElement('span');
  cityText.textContent = city;
  wrapper.appendChild(cityText);

  wrapper.appendChild(document.createTextNode(' ('));

  shopIds.forEach((shopId, i) => {
    if (i > 0) {
      wrapper.appendChild(document.createTextNode(', '));
    }
    const link = document.createElement('span');
    link.className = 'city-shop-link';
    link.textContent = String(i + 1);
    link.addEventListener('click', () => scrollToShop(shopId));
    wrapper.appendChild(link);
  });

  wrapper.appendChild(document.createTextNode(')'));

  return wrapper;
}

function createStoreAvailabilityElement(
  productPriceData: ProductPriceData,
  language: Language,
): HTMLDivElement {
  const availability = productPriceData.storeAvailability;
  const availabilityContainer = DomClient.createElement('div', {
    className: 'store-availability-outline',
  }) as HTMLDivElement;

  const availabilityStatus = document.createElement('p');
  availabilityStatus.className = 'store-availability-status';

  if (availability.userCity && availability.matchingCities.length > 0) {
    availabilityStatus.textContent =
      language === Language.ENGLISH
        ? `This product is available in your city, ${availability.userCity}.`
        : `Το προϊόν είναι διαθέσιμο στην πόλη σου, ${availability.userCity}.`;
    availabilityStatus.classList.add('matched');
  } else if (availability.userCity) {
    availabilityStatus.textContent =
      language === Language.ENGLISH
        ? `This product is not available in your city, ${availability.userCity}.`
        : `Το προϊόν δεν είναι διαθέσιμο στην πόλη σου, ${availability.userCity}.`;
  } else if (availability.cities.length > 0) {
    availabilityStatus.textContent =
      language === Language.ENGLISH
        ? 'This product is available for store pickup in selected cities.'
        : 'Το προϊόν είναι διαθέσιμο για παραλαβή από κατάστημα σε επιλεγμένες πόλεις.';
  } else {
    availabilityStatus.textContent =
      language === Language.ENGLISH
        ? 'Store availability information is not available right now.'
        : 'Οι πληροφορίες διαθεσιμότητας καταστημάτων δεν είναι διαθέσιμες αυτή τη στιγμή.';
  }

  DomClient.appendElementToElement(availabilityStatus, availabilityContainer);

  const citiesSummary = document.createElement('p');
  citiesSummary.className = 'store-availability-summary';

  if (availability.cities.length > 0) {
    const prefix =
      language === Language.ENGLISH
        ? 'This product is in stores in '
        : 'Το προϊόν βρίσκεται σε καταστήματα σε ';
    citiesSummary.appendChild(document.createTextNode(prefix));

    availability.cities.forEach((city, index) => {
      if (index > 0) {
        citiesSummary.appendChild(document.createTextNode(', '));
      }
      const shopIds = availability.cityShopMap?.[city] ?? [];
      citiesSummary.appendChild(createCityElement(city, shopIds));
    });

    citiesSummary.appendChild(document.createTextNode('.'));
  } else {
    citiesSummary.textContent =
      language === Language.ENGLISH
        ? 'This product does not currently have any store cities available.'
        : 'Το προϊόν δεν έχει αυτή τη στιγμή διαθέσιμες πόλεις καταστημάτων.';
  }

  DomClient.appendElementToElement(citiesSummary, availabilityContainer);

  return availabilityContainer;
}

function createPriceIndicationElement(
  productPriceData: ProductPriceData,
  productPriceHistory: ProductPriceHistory | undefined,
  language: Language,
  minimumPriceDifference: number,
  bestPriceProductData?: BestPriceProductData,
  renderOptions: PriceCheckerRenderOptions = {},
): HTMLDivElement {
  try {
    const priceCheckerStack = DomClient.createElement('div', {
      className: 'price-checker-stack',
    }) as HTMLDivElement;
    const priceIndication = DomClient.createElement('div', {
      className: ['display-padding', 'price-checker-outline'],
    }) as HTMLDivElement;

    (priceIndication as HTMLDivElement).style.marginTop = '14px';

    const tagsContainer = DomClient.createElement('div', { className: 'tags-container' });

    DomClient.appendElementToElement(tagsContainer, priceIndication);

    const contentContainer = DomClient.createElement('div', { className: 'inline-flex-col' });
    const priceCalculationContainer = DomClient.createElement('div', {
      className: 'price-calculation-container',
    });
    const infoContainer = DomClient.createElement('div', { className: 'inline-flex-col' });

    const priceDisplay = createPriceDisplayComponent(
      productPriceData,
      productPriceData.buyThroughStore.price,
      productPriceData.buyThroughStore.shippingCost,
      language,
      bestPriceProductData,
      renderOptions.isBestPriceLoading,
    );
    DomClient.appendElementToElement(priceDisplay, priceCalculationContainer);

    const analysisContainer = DomClient.createElement('div', {
      className: ['analysis-container'],
    }) as HTMLDivElement;
    analysisContainer.style.display = 'none';
    const analysisId = `analysis-${productPriceData.buyThroughStore.shopId}`;
    analysisContainer.id = analysisId;

    DomClient.appendElementToElement(priceCalculationContainer, contentContainer);

    const calcElem = createCalculationComponent(
      productPriceData,
      minimumPriceDifference,
      language,
      bestPriceProductData,
    );
    if (calcElem) DomClient.appendElementToElement(calcElem, analysisContainer);
    const breakdownElem = createPriceComparisonBreakdownComponent(
      productPriceData,
      language,
      bestPriceProductData,
    );
    DomClient.appendElementToElement(breakdownElem, analysisContainer);

    DomClient.appendElementToElement(analysisContainer, contentContainer);

    DomClient.appendElementToElement(infoContainer, contentContainer);

    if (productPriceHistory) {
      const priceHistoryBreakdown = PriceHistoryComponent(
        getPriceHistoryComparisonOutcome(
          productPriceHistory,
          productPriceData.buyThroughStore.totalPrice,
        ),
        productPriceHistory,
        language,
        productPriceData.buyThroughStore.totalPrice,
      );
      const priceHistoryControls = priceHistoryBreakdown.querySelector('.price-history-controls');
      if (priceHistoryControls) {
        DomClient.appendElementToElement(
          createAnalysisToggleButton(analysisContainer, language),
          priceHistoryControls,
        );
      }
      DomClient.appendElementToElement(priceHistoryBreakdown, contentContainer);
    } else if (renderOptions.isPriceHistoryLoading) {
      DomClient.appendElementToElement(createPriceHistoryLoadingComponent(), contentContainer);
    }

    const storeAvailability = createStoreAvailabilityElement(productPriceData, language);
    DomClient.appendElementToElement(storeAvailability, contentContainer);

    priceIndication.title =
      language === Language.ENGLISH
        ? 'By reSkroutzed, Leave a review'
        : 'Από το reSkroutzed, Αφήστε μια κριτική';
    DomClient.appendElementToElement(contentContainer, priceIndication);

    // Compose stack: price card -> availability -> review/coffee promo
    const reSkroutzedReview = createReSkoutzedReviewElement(language);
    // append buy-me-coffee into the left area of the promo
    const buyMeCoffeeElement = createBuyMeCoffeeElement();
    const leftPlaceholder = reSkroutzedReview.querySelector('.store-availability-left');
    if (leftPlaceholder) {
      leftPlaceholder.appendChild(buyMeCoffeeElement);
    }

    // price card first
    DomClient.appendElementToElement(priceIndication, priceCheckerStack);
    // finally the review + coffee promo so it appears below the main card
    DomClient.appendElementToElement(reSkroutzedReview, priceCheckerStack);

    return priceCheckerStack;
  } catch (err) {
    console.error('PriceChecker: failed to build indication element', err);
    return createPriceCheckerFallbackElement(language);
  }
}

function getPriceHistoryComparisonOutcome(
  productPriceHistory: ProductPriceHistory,
  currentPrice: number,
): 'expensive' | 'cheap' | 'normal' {
  const min = Number(productPriceHistory.minimumPrice);
  const max = Number(productPriceHistory.maximumPrice);

  if (!Number.isFinite(min) || !Number.isFinite(max)) {
    return 'normal';
  }

  const priceRange = max - min;
  if (priceRange <= 0) {
    return 'normal';
  }

  const pricePosition = (currentPrice - min) / priceRange; //
  if (pricePosition <= 0.3) {
    return 'cheap';
  } else if (pricePosition <= 0.7) {
    return 'normal';
  } else {
    return 'expensive';
  }
}

export class PriceCheckerDecorator implements FeatureInstance {
  /* Configuration */
  private observer: MutationObserver | null = null;
  private isInitializing: boolean = false;
  private lastProductId: string | null = null;
  private currentInitializationId: number = 0;
  private readonly boundNavigationHandler: () => Promise<void>;
  /* Data */
  private productPriceData: ProductPriceData | undefined = undefined;
  private productPriceHistory: ProductPriceHistory | undefined = undefined;
  private bestPriceProductData: BestPriceProductData | undefined = undefined;

  constructor(private readonly state: State) {
    this.boundNavigationHandler = this.handleNavigation.bind(this);
  }

  public async execute(): Promise<void> {
    await this.initializeProductView();
    this.setupNavigationHandlers();
  }

  public destroy(): void {
    window.removeEventListener('popstate', this.boundNavigationHandler);

    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
  }

  private setupNavigationHandlers(): void {
    window.removeEventListener('popstate', this.boundNavigationHandler);
    window.addEventListener('popstate', this.boundNavigationHandler);

    this.setupProductViewObserver();
  }

  private async handleNavigation(): Promise<void> {
    await this.initializeProductView();
  }

  private setupProductViewObserver(): void {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }

    this.observer = new MutationObserver((mutations) => {
      if (this.isInitializing) return;

      for (const mutation of mutations) {
        if (mutation.type === 'childList') {
          this.checkForProductViewChange();
        }
      }
    });

    this.observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
  }

  private checkForProductViewChange(): void {
    const host = this.getPriceHostElement();
    if (!host) return;

    const currentProductId = this.getProductId();

    if (currentProductId && currentProductId !== this.lastProductId) {
      this.lastProductId = currentProductId;
      this.initializeProductView();
      return;
    }

    const hasIndicator = !!host.querySelector('.price-checker-outline');
    if (!hasIndicator) {
      this.initializeProductView();
    }
  }

  private getProductId(): string | null {
    const urlMatch = window.location.pathname.match(/\/p\/(\d+)/);
    if (urlMatch && urlMatch[1]) {
      return urlMatch[1];
    }

    const sMatch = window.location.pathname.match(/\/s\/(\d+)/);
    if (sMatch && sMatch[1]) {
      return sMatch[1];
    }

    const productElement = document.querySelector('[data-product-id]');
    if (productElement) {
      return productElement.getAttribute('data-product-id');
    }

    return window.location.href;
  }

  private async initializeProductView(): Promise<void> {
    if (this.isInitializing) {
      return;
    }

    const initializationId = ++this.currentInitializationId;

    try {
      this.isInitializing = true;

      const host = this.getPriceHostElement();
      if (!host) {
        return;
      }

      this.cleanup();
      this.productPriceData = undefined;
      this.productPriceHistory = undefined;
      this.bestPriceProductData = undefined;
      this.replacePriceIndication(host, createPriceCheckerSkeleton());

      let isPriceHistoryLoading = true;
      let isBestPriceLoading = true;
      const renderLoadedState = (): void => {
        if (!this.isCurrentInitialization(initializationId) || !this.productPriceData) {
          return;
        }

        const currentHost = this.getPriceHostElement();
        if (!currentHost) {
          return;
        }

        const priceIndication = createPriceIndicationElement(
          this.productPriceData,
          this.productPriceHistory,
          this.state.language,
          this.state.minimumPriceDifference,
          this.bestPriceProductData,
          {
            isBestPriceLoading,
            isPriceHistoryLoading,
          },
        );

        this.replacePriceIndication(currentHost, priceIndication);
        this.addPriceComparisonToOptions();
      };

      void SkroutzClient.getPriceHistory()
        .then((productPriceHistory) => {
          if (!this.isCurrentInitialization(initializationId)) {
            return;
          }

          this.productPriceHistory = productPriceHistory;
        })
        .catch((error) => {
          if (!this.isCurrentInitialization(initializationId)) {
            return;
          }

          console.warn('PriceChecker: failed to fetch price history', error);
        })
        .finally(() => {
          if (!this.isCurrentInitialization(initializationId)) {
            return;
          }

          isPriceHistoryLoading = false;
          renderLoadedState();
        });

      void BestPriceClient.getCurrentProductData()
        .then((bestPriceProductData) => {
          if (!this.isCurrentInitialization(initializationId)) {
            return;
          }

          this.bestPriceProductData = bestPriceProductData;
        })
        .catch((error) => {
          if (!this.isCurrentInitialization(initializationId)) {
            return;
          }

          console.warn('PriceChecker: failed to fetch BestPrice data', error);
        })
        .finally(() => {
          if (!this.isCurrentInitialization(initializationId)) {
            return;
          }

          isBestPriceLoading = false;
          renderLoadedState();
        });

      this.productPriceData = await SkroutzClient.getCurrentProductData();

      if (!this.isCurrentInitialization(initializationId) || !this.productPriceData) {
        return;
      }

      const currentHost = this.getPriceHostElement();
      if (!currentHost) {
        return;
      }

      this.adjustSiteData(currentHost);
      renderLoadedState();
    } catch (e) {
      console.error('PriceChecker: initializeProductView failed', e);

      if (this.isCurrentInitialization(initializationId)) {
        const currentHost = this.getPriceHostElement();
        if (currentHost) {
          this.replacePriceIndication(
            currentHost,
            createPriceCheckerFallbackElement(this.state.language),
          );
        }
      }
    } finally {
      if (this.isCurrentInitialization(initializationId)) {
        this.isInitializing = false;
      }
    }
  }

  private cleanup(): void {
    this.removeRenderedPriceChecker();
    const existingShippingTexts = document.querySelectorAll('.shipping-cost-text');
    const existingBreakdowns = document.querySelectorAll(
      '.skroutz-breakdown-inline, .store-breakdown-inline',
    );

    existingShippingTexts.forEach((element) => element.remove());
    existingBreakdowns.forEach((element) => element.remove());
  }

  private isCurrentInitialization(initializationId: number): boolean {
    return initializationId === this.currentInitializationId;
  }

  private removeRenderedPriceChecker(): void {
    const existingIndicators = document.querySelectorAll(
      '.price-checker-stack, .price-checker-outline, .store-availability-outline, .own-promotion',
    );

    existingIndicators.forEach((element) => element.remove());
  }

  private replacePriceIndication(host: Element, priceIndication: HTMLDivElement): void {
    this.removeRenderedPriceChecker();
    this.insertPriceIndicationIntoHost(host, priceIndication);
  }

  private adjustSiteData(element: Element): void {
    const shippingText = DomClient.createElement('div', { className: 'shipping-cost-text' });
    const formattedShipping = (this.productPriceData?.buyThroughSkroutz.shippingCost ?? 0)
      .toFixed(2)
      .replace('.', ',');
    shippingText.textContent = `(+${formattedShipping}€ ${
      this.state.language === Language.ENGLISH ? 'shipping' : 'μεταφορικά'
    })`;

    if (element.matches('article.offering-card')) {
      const offeringHeading = element.querySelector('div.offering-heading');
      const price = offeringHeading?.querySelector('div.price');
      if (offeringHeading && price) {
        price.insertAdjacentElement('afterend', shippingText);
      }
    } else if (element.matches('article.buybox')) {
      const priceBox = element.querySelector('div.price-box');
      const finalPrice = priceBox?.querySelector('div.final-price');
      if (finalPrice) {
        (shippingText as HTMLDivElement).style.marginTop = '6px';
        (shippingText as HTMLDivElement).style.display = 'block';
        (shippingText as HTMLDivElement).style.width = '100%';
        (shippingText as HTMLDivElement).style.flexBasis = '100%';
        (shippingText as HTMLDivElement).style.whiteSpace = 'nowrap';

        (finalPrice as HTMLElement).style.flexWrap = 'wrap';
        (finalPrice as HTMLElement).style.alignItems = 'flex-start';
        (finalPrice as Element).appendChild(shippingText);
      } else if (priceBox) {
        (priceBox as Element).insertAdjacentElement('beforeend', shippingText);
      }
    }
  }

  private getPriceHostElement(): Element | null {
    return (
      document.querySelector('article.buybox') || document.querySelector('article.offering-card')
    );
  }

  private insertPriceIndicationIntoHost(host: Element, priceIndication: HTMLDivElement): void {
    if (host.matches('article.offering-card')) {
      host.insertBefore(priceIndication, host.children[1] ?? host.firstChild);
      return;
    }

    if (host.matches('article.buybox')) {
      const priceAndInstallments = host.querySelector('.price-box .price-and-installments');
      if (priceAndInstallments) {
        (priceAndInstallments as Element).insertAdjacentElement('afterend', priceIndication);
        return;
      }

      const finalPrice = host.querySelector('.price-box .final-price');
      if (finalPrice) {
        (finalPrice as Element).insertAdjacentElement('afterend', priceIndication);
        return;
      }

      const priceBox = host.querySelector('.price-box');
      if (priceBox) {
        (priceBox as Element).insertAdjacentElement('afterend', priceIndication);
        return;
      }

      host.insertBefore(priceIndication, host.firstChild);
    }
  }

  private addPriceComparisonToOptions(): void {
    if (!this.productPriceData) {
      return;
    }

    document
      .querySelectorAll('.skroutz-breakdown-inline, .store-breakdown-inline')
      .forEach((element) => element.remove());

    const findBuyOption = (searchText: string): Element | undefined => {
      const elements = Array.from(
        document.querySelectorAll('.buy-section h3, .buy-section .heading'),
      );
      return elements.find((el) => el.textContent?.includes(searchText));
    };
    const skroutzText = 'Skroutz';
    const storeText =
      this.state.language === Language.ENGLISH ? 'Buy through Store' : 'Αγορά μέσω καταστήματος';

    const skroutzBuyOption = findBuyOption(skroutzText);
    const storeBuyOption = findBuyOption(storeText);

    const addBreakdown = (element: Element | undefined, className: string): void => {
      if (!element || !this.productPriceData) return;

      const parent = element.closest('.buy-section') || element.parentElement;
      if (!parent) return;

      const breakdown = createPriceComparisonBreakdownComponent(
        this.productPriceData,
        this.state.language,
        this.bestPriceProductData,
      );

      breakdown.classList.add(className);
      breakdown.style.marginTop = '10px';
      parent.appendChild(breakdown);
    };

    addBreakdown(skroutzBuyOption, 'skroutz-breakdown-inline');
    addBreakdown(storeBuyOption, 'store-breakdown-inline');
  }
}
