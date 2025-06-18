import { DomClient } from '../clients/dom/client';
import { ProductPriceData, ProductPriceHistory, SkroutzClient } from '../clients/skroutz/client';
import { Language } from '../common/enums/Language.enum';
import { State } from '../common/types/State.type';
import { FeatureInstance } from './common/FeatureInstance';
import { createBuyMeCoffeeElement } from './functions/createBuyMeCoffeeElement';
import { createReskoutzedReviewElement } from './functions/createReskoutzedReviewElement';

const roundToZero = (value: number, precision = 1e-10): number => {
  return Math.abs(value) < precision ? 0 : value;
};

function createPriceDisplayComponent(
  price: number,
  shippingCost: number,
  language: Language,
): HTMLDivElement {
  const container = DomClient.createElement('div', {
    className: 'price-display-wrapper',
  }) as HTMLDivElement;

  const priceElement = DomClient.createElement('div', { className: 'price-indicator-price' });

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

  DomClient.appendElementToElement(priceElement, container);

  const shippingText = DomClient.createElement('div', { className: 'shipping-cost-text' });
  const formattedShipping = shippingCost.toFixed(2).replace('.', ',');
  shippingText.textContent = `(+${formattedShipping}€ ${
    language === Language.ENGLISH ? 'shipping' : 'μεταφορικά'
  })`;
  DomClient.appendElementToElement(shippingText, container);

  return container;
}

function createPriceComparisonBreakdownComponent(
  productPriceData: ProductPriceData,
  productPriceHistory: ProductPriceHistory | undefined,
  language: Language,
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

  if (productPriceHistory) {
    const priceHistoryBreakdown = createPriceHistoryComparisonComponent(
      productPriceHistory,
      productPriceData.buyThroughSkroutz.totalPrice,
      language,
    );
    const priceHistoryContainer = DomClient.createElement('div', { className: 'inline-flex-col' });

    DomClient.appendElementToElement(priceHistoryBreakdown, priceHistoryContainer);
    DomClient.appendElementToElement(priceHistoryContainer, skroutzContainer);
  }

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

  if (productPriceHistory) {
    const priceHistoryBreakdown = createPriceHistoryComparisonComponent(
      productPriceHistory,
      productPriceData.buyThroughStore.totalPrice,
      language,
    );
    const priceHistoryContainer = DomClient.createElement('div', { className: 'inline-flex-col' });

    DomClient.appendElementToElement(priceHistoryBreakdown, priceHistoryContainer);
    DomClient.appendElementToElement(priceHistoryContainer, storeContainer);
  }

  DomClient.appendElementToElement(skroutzContainer, transportationBreakdown);
  DomClient.appendElementToElement(storeContainer, transportationBreakdown);

  return transportationBreakdown;
}

function createCalculationComponent(
  productPriceData: ProductPriceData,
  minimumPriceDifference: number,
  language: Language,
): HTMLDivElement {
  const calculationContainer = DomClient.createElement('div', {
    className: 'calculation-container',
  }) as HTMLDivElement;
  if (productPriceData.buyThroughSkroutz.shopId === productPriceData.buyThroughStore.shopId) {
    calculationContainer.innerHTML = `${
      language === Language.ENGLISH
        ? 'Both options are from the same shop'
        : 'Και οι δύο επιλογές είναι από το ίδιο κατάστημα'
    }`;
    return calculationContainer;
  }

  const priceDifference = roundToZero(
    productPriceData.buyThroughSkroutz.totalPrice - productPriceData.buyThroughStore.totalPrice,
  );
  if (priceDifference === 0) {
    calculationContainer.innerHTML = `${
      language === Language.ENGLISH
        ? 'There is no difference in price'
        : 'Δεν υπάρχει διαφορά στην τιμή'
    }`;
    return calculationContainer;
  }

  const differenceAbsolute = Math.abs(priceDifference);
  const buyingThroughSkroutz =
    language === Language.ENGLISH
      ? 'Buying through Skroutz is'
      : 'Με "Aγορά μέσω Skroutz" είναι κατά';

  if (priceDifference <= 0) {
    const cheaper = language === Language.ENGLISH ? 'cheaper' : 'φθηνότερο';
    calculationContainer.innerHTML = `${buyingThroughSkroutz}<br><strong>${differenceAbsolute.toFixed(
      2,
    )}€ <u>${cheaper}</u></strong> (${productPriceData.buyThroughStore.totalPrice.toFixed(
      2,
    )}€ - ${productPriceData.buyThroughSkroutz.totalPrice.toFixed(2)}€)`;
  } else {
    calculationContainer.classList.add('calculation-negative');
    const moreExpensive = language === Language.ENGLISH ? 'more expensive' : 'ακριβότερο';
    calculationContainer.innerHTML = `${buyingThroughSkroutz}<br><strong>${differenceAbsolute.toFixed(
      2,
    )}€ <u>${moreExpensive}</u></strong> (${productPriceData.buyThroughSkroutz.totalPrice.toFixed(
      2,
    )}€ - ${productPriceData.buyThroughStore.totalPrice.toFixed(2)}€)`;
  }

  if (minimumPriceDifference > 0) {
    const isBelow = differenceAbsolute <= minimumPriceDifference;
    const message =
      language === Language.ENGLISH
        ? `${
            isBelow ? 'Below' : 'Exceeds'
          } the minimum price difference threshold of ${minimumPriceDifference.toFixed(2)}€`
        : `${
            isBelow ? 'Κάτω από' : 'Υπερβαίνει'
          } την ελάχιστη διαφορά τιμής των ${minimumPriceDifference.toFixed(2)}€`;

    const span = document.createElement('span');
    span.className = 'minimum-price-difference-text';
    span.textContent = message;
    DomClient.appendElementToElement(span, calculationContainer);
  }

  return calculationContainer;
}

function createShopButtonComponent(
  productPriceData: ProductPriceData,
  minimumPriceDifference: number,
  language: Language,
): HTMLButtonElement {
  const showPositiveStyling = isPositiveStyling(productPriceData, minimumPriceDifference);

  const buttonStyle = showPositiveStyling
    ? 'go-to-shop-button-positive'
    : 'go-to-shop-button-negative';

  const goToStoreButton = DomClient.createElement('button', {
    className: [buttonStyle, 'bold-text'],
  }) as HTMLButtonElement;

  goToStoreButton.textContent =
    language === Language.ENGLISH ? 'Go to Shop' : 'Μετάβαση στο κατάστημα';

  goToStoreButton.addEventListener('click', (): void => {
    const targetId = `shop-${productPriceData.buyThroughStore.shopId}`;
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
  });

  return goToStoreButton;
}

function isPositiveStyling(
  productPriceData: ProductPriceData,
  minimumPriceDifference: number,
): boolean {
  const isPositive =
    productPriceData.buyThroughSkroutz.totalPrice <= productPriceData.buyThroughStore.totalPrice;

  if (!isPositive) {
    const priceDifference =
      productPriceData.buyThroughSkroutz.totalPrice - productPriceData.buyThroughStore.totalPrice;

    return Math.abs(priceDifference) <= minimumPriceDifference;
  }

  return true;
}

function createPriceIndicationElement(
  productPriceData: ProductPriceData,
  productPriceHistory: ProductPriceHistory,
  language: Language,
  minimumPriceDifference: number,
): HTMLDivElement {
  const showPositiveStyling = isPositiveStyling(productPriceData, minimumPriceDifference);

  const priceIndication = DomClient.createElement('div', {
    className: [
      'display-padding',
      'price-checker-outline',
      showPositiveStyling ? 'info-label-positive' : 'info-label-negative',
    ],
  }) as HTMLDivElement;

  const tagsContainer = DomClient.createElement('div', { className: 'tags-container' });

  const reSkroutzedReview = createReskoutzedReviewElement();
  DomClient.appendElementToElement(reSkroutzedReview, tagsContainer);

  const buyMeCoffeeElement = createBuyMeCoffeeElement();
  DomClient.appendElementToElement(buyMeCoffeeElement, tagsContainer);

  DomClient.appendElementToElement(tagsContainer, priceIndication);

  const contentContainer = DomClient.createElement('div', { className: 'inline-flex-col' });
  const priceCalculationContainer = DomClient.createElement('div', {
    className: 'price-calculation-container',
  });
  const infoContainer = DomClient.createElement('div', { className: 'inline-flex-col' });
  const actionContainer = DomClient.createElement('div', { className: 'inline-flex-row' });

  const priceDisplay = createPriceDisplayComponent(
    productPriceData.buyThroughStore.price,
    productPriceData.buyThroughStore.shippingCost,
    language,
  );
  DomClient.appendElementToElement(priceDisplay, priceCalculationContainer);

  const infoText = document.createElement('span');
  infoText.textContent =
    language === Language.ENGLISH
      ? 'This is the lowest price with shipping apart from "Buy through Skroutz"'
      : 'Αυτή είναι η χαμηλότερη τιμή με μεταφορικά εκτός "Αγορά μέσω Skroutz"';
  DomClient.appendElementToElement(infoText, priceCalculationContainer);

  DomClient.appendElementToElement(priceCalculationContainer, contentContainer);

  const calculationContainer = createCalculationComponent(
    productPriceData,
    minimumPriceDifference,
    language,
  );
  if (calculationContainer) {
    DomClient.appendElementToElement(calculationContainer, contentContainer);
  }

  const transportationBreakdown = createPriceComparisonBreakdownComponent(
    productPriceData,
    productPriceHistory,
    language,
  );
  DomClient.appendElementToElement(transportationBreakdown, infoContainer);

  DomClient.appendElementToElement(infoContainer, contentContainer);

  const goToStoreButton = createShopButtonComponent(
    productPriceData,
    minimumPriceDifference,
    language,
  );
  DomClient.appendElementToElement(goToStoreButton, actionContainer);

  const priceHistoryBreakdown = createPriceHistoryComponent(productPriceHistory, language);
  DomClient.appendElementToElement(priceHistoryBreakdown, contentContainer);

  DomClient.appendElementToElement(actionContainer, contentContainer);

  priceIndication.title =
    language === Language.ENGLISH ? 'Delivered to you by reSkroutzed' : 'Από το reSkroutzed';
  DomClient.appendElementToElement(contentContainer, priceIndication);

  return priceIndication;
}

function createPriceHistoryComparisonComponent(
  productPriceHistory: ProductPriceHistory,
  currentPrice: number,
  language: Language,
): HTMLElement {
  const priceHistoryBreakdown = DomClient.createElement('div', {
    className: 'price-history-breakdown',
  });

  const getLabel = (english: string, greek: string): string =>
    language === Language.ENGLISH ? english : greek;

  priceHistoryBreakdown.style.fontSize = '0.85em';
  priceHistoryBreakdown.style.opacity = '0.7';
  priceHistoryBreakdown.style.marginBottom = '5px';
  priceHistoryBreakdown.style.display = 'flex';
  priceHistoryBreakdown.style.alignItems = 'center';
  priceHistoryBreakdown.style.justifyContent = 'center';
  priceHistoryBreakdown.style.gap = '8px';
  priceHistoryBreakdown.style.fontWeight = 'bold';

  const priceRange = productPriceHistory.maximumPrice - productPriceHistory.minimumPrice;
  const pricePosition = (currentPrice - productPriceHistory.minimumPrice) / priceRange;

  let priceAssessment: string;
  if (pricePosition <= 0.3) {
    priceAssessment = getLabel(
      `Good price compared to historical price`,
      `Καλή τιμή σε σχέση με τα ιστορικά δεδομένα`,
    );
  } else if (pricePosition <= 0.7) {
    priceAssessment = getLabel(
      `Average price compared to historical price`,
      `Κανονική τιμή σε σχέση με τα ιστορικά δεδομένα`,
    );
  } else {
    priceAssessment = getLabel(
      `High price compared to historical price`,
      `Υψηλή τιμή σε σχέση με τα ιστορικά δεδομένα`,
    );
  }

  const textContent = DomClient.createElement('span', {});
  textContent.textContent = priceAssessment;

  DomClient.appendElementToElement(textContent, priceHistoryBreakdown);

  return priceHistoryBreakdown;
}

function createPriceHistoryComponent(
  productPriceHistory: ProductPriceHistory,
  language: Language,
): HTMLElement {
  const priceHistoryContainer = DomClient.createElement('div', {
    className: 'price-history-container',
  });

  const getLabel = (english: string, greek: string): string =>
    language === Language.ENGLISH ? english : greek;

  priceHistoryContainer.style.marginTop = '0px';
  priceHistoryContainer.style.marginBottom = '16px';
  priceHistoryContainer.style.padding = '6px 8px';
  priceHistoryContainer.style.backgroundColor = 'rgba(0, 0, 0, 0.03)';
  priceHistoryContainer.style.borderRadius = '4px';
  priceHistoryContainer.style.border = '1px solid rgba(0, 0, 0, 0.08)';

  const titleElement = DomClient.createElement('div', {
    className: 'price-history-title',
  });

  titleElement.style.fontSize = '0.75em';
  titleElement.style.fontWeight = '600';
  titleElement.style.marginBottom = '4px';
  titleElement.style.color = '#666';
  titleElement.style.opacity = '0.8';

  const priceRangeContainer = DomClient.createElement('div', {
    className: 'price-range-container',
  });
  priceRangeContainer.style.display = 'flex';
  priceRangeContainer.style.justifyContent = 'space-between';
  priceRangeContainer.style.alignItems = 'center';
  priceRangeContainer.style.fontSize = '0.7em';

  const minPriceElement = DomClient.createElement('span', {
    className: 'min-price',
  });
  minPriceElement.innerHTML = `<strong>${getLabel('Min', 'Ελάχ')}:</strong> ${productPriceHistory.minimumPrice.toFixed(2)}€`;
  minPriceElement.style.color = '#4caf50';
  minPriceElement.style.opacity = '0.9';

  const maxPriceElement = DomClient.createElement('span', {
    className: 'max-price',
  });
  maxPriceElement.innerHTML = `<strong>${getLabel('Max', 'Μέγ')}:</strong> ${productPriceHistory.maximumPrice.toFixed(2)}€`;
  maxPriceElement.style.color = '#f44336';
  maxPriceElement.style.opacity = '0.9';

  const priceBarContainer = DomClient.createElement('div', {
    className: 'price-bar-container',
  });
  priceBarContainer.style.width = '100%';
  priceBarContainer.style.height = '8px';
  priceBarContainer.style.backgroundColor = '#f0f0f0';
  priceBarContainer.style.borderRadius = '4px';
  priceBarContainer.style.marginTop = '4px';
  priceBarContainer.style.position = 'relative';
  priceBarContainer.style.cursor = 'pointer';

  const priceRange = productPriceHistory.maximumPrice - productPriceHistory.minimumPrice;

  productPriceHistory.allPricesOrdered.forEach((price, index) => {
    const segment = DomClient.createElement('div', {
      className: 'price-segment',
    });

    const segmentWidth = 100 / productPriceHistory.allPricesOrdered.length;
    const position = (price - productPriceHistory.minimumPrice) / priceRange;

    let color: string;
    if (position <= 0.3) {
      color = '#4caf50';
    } else if (position <= 0.7) {
      color = '#ff9800';
    } else {
      color = '#f44336';
    }

    segment.style.position = 'absolute';
    segment.style.left = `${index * segmentWidth}%`;
    segment.style.width = `${segmentWidth}%`;
    segment.style.height = '100%';
    segment.style.backgroundColor = color;
    segment.style.opacity = '0.7';
    segment.style.transition = 'opacity 0.2s ease';
    segment.style.borderRadius =
      index === 0
        ? '4px 0 0 4px'
        : index === productPriceHistory.allPricesOrdered.length - 1
          ? '0 4px 4px 0'
          : '0';

    const tooltip = DomClient.createElement('div', {
      className: 'price-tooltip',
    });
    tooltip.textContent = `${price.toFixed(2)}€`;
    tooltip.style.position = 'absolute';
    tooltip.style.bottom = '120%';
    tooltip.style.left = '50%';
    tooltip.style.transform = 'translateX(-50%)';
    tooltip.style.backgroundColor = '#333';
    tooltip.style.color = 'white';
    tooltip.style.padding = '4px 8px';
    tooltip.style.borderRadius = '4px';
    tooltip.style.fontSize = '0.65em';
    tooltip.style.whiteSpace = 'nowrap';
    tooltip.style.opacity = '0';
    tooltip.style.visibility = 'hidden';
    tooltip.style.transition = 'opacity 0.2s ease, visibility 0.2s ease';
    tooltip.style.zIndex = '1000';

    const arrow = DomClient.createElement('div', {
      className: 'tooltip-arrow',
    });
    arrow.style.position = 'absolute';
    arrow.style.top = '100%';
    arrow.style.left = '50%';
    arrow.style.transform = 'translateX(-50%)';
    arrow.style.width = '0';
    arrow.style.height = '0';
    arrow.style.borderLeft = '4px solid transparent';
    arrow.style.borderRight = '4px solid transparent';
    arrow.style.borderTop = '4px solid #333';

    DomClient.appendElementToElement(arrow, tooltip);
    DomClient.appendElementToElement(tooltip, segment);

    segment.addEventListener('mouseenter', () => {
      segment.style.opacity = '1';
      tooltip.style.opacity = '1';
      tooltip.style.visibility = 'visible';
    });

    segment.addEventListener('mouseleave', () => {
      segment.style.opacity = '0.7';
      tooltip.style.opacity = '0';
      tooltip.style.visibility = 'hidden';
    });

    DomClient.appendElementToElement(segment, priceBarContainer);
  });

  DomClient.appendElementToElement(minPriceElement, priceRangeContainer);
  DomClient.appendElementToElement(maxPriceElement, priceRangeContainer);
  DomClient.appendElementToElement(titleElement, priceHistoryContainer);
  DomClient.appendElementToElement(priceRangeContainer, priceHistoryContainer);
  DomClient.appendElementToElement(priceBarContainer, priceHistoryContainer);

  return priceHistoryContainer;
}

export class PriceCheckerDecorator implements FeatureInstance {
  /* Configuration */
  private observer: MutationObserver | null = null;
  private isInitializing: boolean = false;
  private lastProductId: string | null = null;
  /* Data */
  private productPriceData: ProductPriceData | undefined = undefined;
  private productPriceHistory: ProductPriceHistory | undefined = undefined;

  constructor(private readonly state: State) {}

  public async execute(): Promise<void> {
    await this.initializeProductView();
    this.setupNavigationHandlers();
  }

  private setupNavigationHandlers(): void {
    window.addEventListener('popstate', this.handleNavigation.bind(this));

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
    const offeringCard = document.querySelector('article.offering-card');
    if (!offeringCard) return;

    const currentProductId = this.getProductId();

    if (currentProductId && currentProductId !== this.lastProductId) {
      this.lastProductId = currentProductId;
      this.initializeProductView();
    }
  }

  private getProductId(): string | null {
    const urlMatch = window.location.pathname.match(/\/p\/(\d+)/);
    if (urlMatch && urlMatch[1]) {
      return urlMatch[1];
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

    try {
      this.isInitializing = true;

      const offeringCard = document.querySelector('article.offering-card');
      if (!offeringCard) {
        this.isInitializing = false;
        return;
      }

      this.cleanup();
      this.productPriceData = await SkroutzClient.getCurrentProductData();
      this.productPriceHistory = await SkroutzClient.getPriceHistory();

      if (!this.productPriceData) {
        this.isInitializing = false;
        return;
      }

      this.adjustSiteData(offeringCard);
      const priceIndication = createPriceIndicationElement(
        this.productPriceData!,
        this.productPriceHistory,
        this.state.language,
        this.state.minimumPriceDifference,
      );

      offeringCard.insertBefore(priceIndication, offeringCard.children[1]);
    } finally {
      this.isInitializing = false;
    }
  }

  private cleanup(): void {
    const existingIndicators = document.querySelectorAll('.price-checker-outline');
    const existingShippingTexts = document.querySelectorAll('.shipping-cost-text');

    existingIndicators.forEach((element) => element.remove());
    existingShippingTexts.forEach((element) => element.remove());
  }

  private adjustSiteData(element: Element): void {
    const offeringHeading = element.querySelector('div.offering-heading');
    const price = offeringHeading?.querySelector('div.price');

    if (!offeringHeading || !price) {
      return;
    }

    const shippingText = DomClient.createElement('div', { className: 'shipping-cost-text' });
    const formattedShipping = (this.productPriceData?.buyThroughSkroutz.shippingCost ?? 0)
      .toFixed(2)
      .replace('.', ',');
    shippingText.textContent = `(+${formattedShipping}€ ${
      this.state.language === Language.ENGLISH ? 'shipping' : 'μεταφορικά'
    })`;

    price.insertAdjacentElement('afterend', shippingText);

    this.addPriceComparisonToOptions();
  }

  private addPriceComparisonToOptions(): void {
    if (!this.productPriceData) {
      return;
    }

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
        this.productPriceHistory,
        this.state.language,
      );

      breakdown.classList.add(className);
      breakdown.style.marginTop = '10px';
      parent.appendChild(breakdown);
    };

    addBreakdown(skroutzBuyOption, 'skroutz-breakdown-inline');
    addBreakdown(storeBuyOption, 'store-breakdown-inline');
  }
}
