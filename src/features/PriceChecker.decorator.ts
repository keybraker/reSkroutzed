import { DomClient } from '../clients/dom/client';
import { ProductPriceData, SkroutzClient } from '../clients/skroutz/client';
import { Language } from '../common/enums/Language.enum';
import { State } from '../common/types/State.type';
import { FeatureInstance } from './common/FeatureInstance';
import { createLogoElement } from './functions/createLogoElement';

const roundToZero = (value: number, precision = 1e-10): number => {
  return Math.abs(value) < precision ? 0 : value;
};

class UIFactory {
  static createElementWithClass<T extends HTMLElement>(
    tag: string,
    className: string | string[],
  ): T {
    const element = document.createElement(tag) as T;
    if (Array.isArray(className)) {
      element.classList.add(...className);
    } else {
      element.classList.add(className);
    }
    return element;
  }

  static createLabeledText(label: string, value: string): HTMLSpanElement {
    const span = document.createElement('span');
    span.innerHTML = `<strong>${label}</strong>: ${value}`;
    return span;
  }

  static appendWithSeparator(
    container: HTMLElement,
    elements: HTMLElement[],
    separators: string[],
  ): void {
    elements.forEach((element, index) => {
      container.appendChild(element);
      if (index < separators.length) {
        container.appendChild(document.createTextNode(separators[index]));
      }
    });
  }
}

function createPriceDisplayComponent(
  price: number,
  shippingCost: number,
  language: Language,
): HTMLDivElement {
  const container = UIFactory.createElementWithClass<HTMLDivElement>(
    'div',
    'price-display-wrapper',
  );

  const priceElement = UIFactory.createElementWithClass<HTMLDivElement>(
    'div',
    'price-indicator-price',
  );

  const [integerPart, decimalPart] = price.toFixed(2).split('.');

  priceElement.textContent = integerPart;

  const priceComma = UIFactory.createElementWithClass<HTMLSpanElement>(
    'span',
    'price-indicator-comma',
  );
  priceComma.textContent = ',';
  priceElement.appendChild(priceComma);

  const priceDecimal = UIFactory.createElementWithClass<HTMLSpanElement>(
    'span',
    'price-indicator-decimal',
  );
  priceDecimal.textContent = decimalPart;
  priceElement.appendChild(priceDecimal);

  const currencySymbol = UIFactory.createElementWithClass<HTMLSpanElement>(
    'span',
    'price-indicator-currency',
  );
  currencySymbol.textContent = '€';
  priceElement.appendChild(currencySymbol);

  container.appendChild(priceElement);

  const shippingText = UIFactory.createElementWithClass<HTMLDivElement>(
    'div',
    'shipping-cost-text',
  );
  const formattedShipping = shippingCost.toFixed(2).replace('.', ',');
  shippingText.textContent = `(+${formattedShipping}€ ${
    language === Language.ENGLISH ? 'shipping' : 'μεταφορικά'
  })`;
  container.appendChild(shippingText);

  return container;
}

function createPriceComparisonBreakdownComponent(
  productPriceData: ProductPriceData,
  language: Language,
): HTMLElement {
  const transportationBreakdown = UIFactory.createElementWithClass<HTMLDivElement>(
    'div',
    'transportation-breakdown',
  );
  if (productPriceData.buyThroughSkroutz.shopId === productPriceData.buyThroughStore.shopId) {
    return transportationBreakdown;
  }

  const getLabel = (english: string, greek: string): string =>
    language === Language.ENGLISH ? english : greek;
  transportationBreakdown.style.display = 'flex';
  transportationBreakdown.style.flexDirection = 'row';
  transportationBreakdown.style.gap = '10px';

  const skroutzContainer = UIFactory.createElementWithClass<HTMLDivElement>(
    'div',
    'price-breakdown-item',
  );
  const skroutzLabel = UIFactory.createElementWithClass<HTMLDivElement>('div', 'breakdown-label');
  skroutzLabel.textContent = getLabel('Buy Through Skroutz', 'Αγορά μέσω Skroutz');

  const skroutzValue = UIFactory.createElementWithClass<HTMLDivElement>('div', 'breakdown-value');
  skroutzValue.innerHTML = `${productPriceData.buyThroughSkroutz.price.toFixed(
    2,
  )}€ + ${productPriceData.buyThroughSkroutz.shippingCost.toFixed(
    2,
  )}€ = ${productPriceData.buyThroughSkroutz.totalPrice.toFixed(2)}€`;

  skroutzContainer.appendChild(skroutzLabel);
  skroutzContainer.appendChild(skroutzValue);

  // Store price breakdown
  const storeContainer = UIFactory.createElementWithClass<HTMLDivElement>(
    'div',
    'price-breakdown-item',
  );
  const storeLabel = UIFactory.createElementWithClass<HTMLDivElement>('div', 'breakdown-label');
  storeLabel.textContent = getLabel('Buy through Store', 'Αγορά μέσω καταστήματος');

  const storeValue = UIFactory.createElementWithClass<HTMLDivElement>('div', 'breakdown-value');
  storeValue.textContent = `${productPriceData.buyThroughStore.price.toFixed(
    2,
  )}€ + ${productPriceData.buyThroughStore.shippingCost.toFixed(
    2,
  )}€ = ${productPriceData.buyThroughStore.totalPrice.toFixed(2)}€`;

  storeContainer.appendChild(storeLabel);
  storeContainer.appendChild(storeValue);

  transportationBreakdown.appendChild(skroutzContainer);
  transportationBreakdown.appendChild(storeContainer);

  return transportationBreakdown;
}

function createCalculationComponent(
  productPriceData: ProductPriceData,
  minimumPriceDifference: number,
  language: Language,
): HTMLDivElement {
  const calculationContainer = UIFactory.createElementWithClass<HTMLDivElement>(
    'div',
    'calculation-container',
  );
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
    calculationContainer.appendChild(span);
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

  const goToStoreButton = UIFactory.createElementWithClass<HTMLButtonElement>('button', [
    buttonStyle,
    'bold-text',
  ]);

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
  language: Language,
  minimumPriceDifference: number,
): HTMLDivElement {
  const showPositiveStyling = isPositiveStyling(productPriceData, minimumPriceDifference);

  const priceIndication = UIFactory.createElementWithClass<HTMLDivElement>('div', [
    'display-padding',
    'price-checker-outline',
    showPositiveStyling ? 'info-label-positive' : 'info-label-negative',
  ]);

  const reSkroutzedTag = UIFactory.createElementWithClass<HTMLDivElement>('div', 'reskroutzed-tag');

  addReskroutzedTagToElement(reSkroutzedTag, language);

  priceIndication.appendChild(reSkroutzedTag);

  const contentContainer = UIFactory.createElementWithClass<HTMLDivElement>(
    'div',
    'inline-flex-col',
  );
  const priceCalculationContainer = UIFactory.createElementWithClass<HTMLDivElement>(
    'div',
    'price-calculation-container',
  );
  const infoContainer = UIFactory.createElementWithClass<HTMLDivElement>('div', 'inline-flex-col');
  const actionContainer = UIFactory.createElementWithClass<HTMLDivElement>(
    'div',
    'inline-flex-row',
  );

  const priceDisplay = createPriceDisplayComponent(
    productPriceData.buyThroughStore.price,
    productPriceData.buyThroughStore.shippingCost,
    language,
  );
  priceCalculationContainer.appendChild(priceDisplay);

  const infoText = document.createElement('span');
  infoText.textContent =
    language === Language.ENGLISH
      ? 'This is the lowest price with shipping apart from "Buy through Skroutz"'
      : 'Αυτή είναι η χαμηλότερη τιμή με μεταφορικά εκτός "Αγορά μέσω Skroutz"';
  priceCalculationContainer.appendChild(infoText);

  contentContainer.appendChild(priceCalculationContainer);

  const calculationContainer = createCalculationComponent(
    productPriceData,
    minimumPriceDifference,
    language,
  );
  if (calculationContainer) {
    contentContainer.appendChild(calculationContainer);
  }

  const transportationBreakdown = createPriceComparisonBreakdownComponent(
    productPriceData,
    language,
  );
  infoContainer.appendChild(transportationBreakdown);

  contentContainer.appendChild(infoContainer);

  const goToStoreButton = createShopButtonComponent(
    productPriceData,
    minimumPriceDifference,
    language,
  );
  actionContainer.appendChild(goToStoreButton);

  contentContainer.appendChild(actionContainer);

  priceIndication.title =
    language === Language.ENGLISH ? 'Delivered to you by reSkroutzed' : 'Από το reSkroutzed';

  priceIndication.appendChild(contentContainer);

  return priceIndication;
}

function addReskroutzedTagToElement(
  element: HTMLDivElement | HTMLButtonElement,
  language: Language,
): void {
  const brand = document.createElement('div');
  const brandLink = document.createElement('a');

  brand.classList.add('support-developer', 'icon-border', 'font-bold');

  brandLink.href = 'https://paypal.me/tsiakkas';
  brandLink.target = '_blank'; // Open in new tab
  brandLink.rel = 'noopener noreferrer'; // Security best practice for external links
  if (language === Language.GREEK) {
    brandLink.textContent = 'ReSkroutzed';
  } else {
    brandLink.textContent = 'ReSkroutzed';
  }
  brandLink.classList.add('icon-border', 'font-bold');

  brand.appendChild(brandLink);

  const reskroutzedLogo = createLogoElement();
  DomClient.appendElementToElement(reskroutzedLogo, brand);

  element.appendChild(brand);
}

export class PriceCheckerDecorator implements FeatureInstance {
  /* Configuration */
  private observer: MutationObserver | null = null;
  private isInitializing: boolean = false;
  private lastProductId: string | null = null;
  /* Data */
  private productPriceData: ProductPriceData | undefined = undefined;

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

      if (!this.productPriceData) {
        this.isInitializing = false;
        return;
      }

      this.adjustSiteData(offeringCard);
      const priceIndication = createPriceIndicationElement(
        this.productPriceData!,
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

    const shippingText = UIFactory.createElementWithClass<HTMLDivElement>(
      'div',
      'shipping-cost-text',
    );
    const formattedShipping = (this.productPriceData?.buyThroughSkroutz.shippingCost ?? 0)
      .toFixed(2)
      .replace('.', ',');
    shippingText.textContent = `(+${formattedShipping}€ ${
      this.state.language === Language.ENGLISH ? 'shipping' : 'μεταφορικά'
    })`;

    price.insertAdjacentElement('afterend', shippingText);
  }
}
