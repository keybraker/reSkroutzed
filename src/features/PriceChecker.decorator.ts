import { DomClient } from '../clients/dom/client';
import { ProductPriceData, ProductPriceHistory, SkroutzClient } from '../clients/skroutz/client';
import { PriceHistoryComponent } from '../common/components/PriceHistory.component';
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

  const priceHistoryBreakdown = PriceHistoryComponent(
    getPriceHistoryComparisonOutcome(
      productPriceHistory,
      productPriceData.buyThroughStore.totalPrice,
    ),
    productPriceHistory,
    language,
  );
  DomClient.appendElementToElement(priceHistoryBreakdown, contentContainer);

  DomClient.appendElementToElement(actionContainer, contentContainer);

  priceIndication.title =
    language === Language.ENGLISH ? 'Delivered to you by reSkroutzed' : 'Από το reSkroutzed';
  DomClient.appendElementToElement(contentContainer, priceIndication);

  return priceIndication;
}

function getPriceHistoryComparisonOutcome(
  productPriceHistory: ProductPriceHistory,
  currentPrice: number,
): 'expensive' | 'cheap' | 'normal' {
  const priceRange = productPriceHistory.maximumPrice - productPriceHistory.minimumPrice;
  const pricePosition = (currentPrice - productPriceHistory.minimumPrice) / priceRange;

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
