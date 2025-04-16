import { Language } from "../enums/Language.enum";
import { buyThroughSkroutzShippingCostRetriever } from "../retrievers/buyThroughSkroutzShippingCost.retriever";
import { buyThroughSkroutzRetriever } from "../retrievers/buyThroughSkroutz.retriever";
import {
  LowestPriceData,
  marketDataReceiver,
} from "../retrievers/marketData.retriever";
import { State } from "../types/State.type";

// Utility functions
const roundToZero = (value: number, precision = 1e-10): number => {
  return Math.abs(value) < precision ? 0 : value;
};

// UI Factory for creating consistent UI elements
class UIFactory {
  static createElementWithClass<T extends HTMLElement>(
    tag: string,
    className: string | string[]
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
    const span = document.createElement("span");
    span.innerHTML = `<strong>${label}</strong>: ${value}`;
    return span;
  }

  static appendWithSeparator(
    container: HTMLElement,
    elements: HTMLElement[],
    separators: string[]
  ): void {
    elements.forEach((element, index) => {
      container.appendChild(element);
      if (index < separators.length) {
        container.appendChild(document.createTextNode(separators[index]));
      }
    });
  }
}

class PriceData {
  readonly btsPrice: number;
  readonly btsShippingCost: number;
  readonly lowestProductPrice: number;
  readonly lowestShippingCost: number;
  readonly lowestTotalPrice: number;
  readonly btsTotalPrice: number;
  readonly priceDifference: number;
  readonly isLowestPrice: boolean;

  constructor(
    btsPrice: number,
    btsShippingCost: number,
    lowestPriceData: LowestPriceData
  ) {
    this.btsPrice = btsPrice;
    this.btsShippingCost = btsShippingCost;
    this.lowestProductPrice = lowestPriceData.lowestProductPrice;
    this.lowestShippingCost = lowestPriceData.lowestShippingCost;
    this.lowestTotalPrice = lowestPriceData.lowestTotalPrice;
    this.btsTotalPrice = btsPrice + btsShippingCost;
    this.priceDifference = roundToZero(
      this.lowestTotalPrice - this.btsTotalPrice
    );
    this.isLowestPrice = this.btsTotalPrice <= this.lowestTotalPrice;
  }
}

class PriceDisplayComponent {
  static create(
    price: number,
    shippingCost: number,
    language: Language
  ): HTMLDivElement {
    const container = UIFactory.createElementWithClass<HTMLDivElement>(
      "div",
      "price-display-wrapper"
    );

    const priceElement = UIFactory.createElementWithClass<HTMLDivElement>(
      "div",
      "price-indicator-price"
    );

    const [integerPart, decimalPart] = price.toFixed(2).split(".");

    priceElement.textContent = integerPart;

    const priceComma = UIFactory.createElementWithClass<HTMLSpanElement>(
      "span",
      "price-indicator-comma"
    );
    priceComma.textContent = ",";
    priceElement.appendChild(priceComma);

    const priceDecimal = UIFactory.createElementWithClass<HTMLSpanElement>(
      "span",
      "price-indicator-decimal"
    );
    priceDecimal.textContent = decimalPart;
    priceElement.appendChild(priceDecimal);

    const currencySymbol = UIFactory.createElementWithClass<HTMLSpanElement>(
      "span",
      "price-indicator-currency"
    );
    currencySymbol.textContent = "€";
    priceElement.appendChild(currencySymbol);

    container.appendChild(priceElement);

    const shippingText = UIFactory.createElementWithClass<HTMLDivElement>(
      "div",
      "shipping-cost-text"
    );
    const formattedShipping = shippingCost.toFixed(2).replace(".", ",");
    shippingText.textContent = `(+${formattedShipping}€ ${
      language === Language.ENGLISH ? "shipping" : "μεταφορικά"
    })`;
    container.appendChild(shippingText);

    return container;
  }
}

class PriceComparisonBreakdownComponent {
  static create(priceData: PriceData, language: Language): HTMLElement {
    const getLabel = (english: string, greek: string): string =>
      language === Language.ENGLISH ? english : greek;

    const transportationBreakdown =
      UIFactory.createElementWithClass<HTMLDivElement>(
        "div",
        "transportation-breakdown"
      );
    transportationBreakdown.style.display = "flex";
    transportationBreakdown.style.flexDirection = "row";
    transportationBreakdown.style.gap = "10px";

    const skroutzContainer = UIFactory.createElementWithClass<HTMLDivElement>(
      "div",
      "price-breakdown-item"
    );
    const skroutzLabel = UIFactory.createElementWithClass<HTMLDivElement>(
      "div",
      "breakdown-label"
    );
    skroutzLabel.textContent = getLabel(
      "Buy Through Skroutz",
      "Αγορά μέσω Skroutz"
    );

    const skroutzValue = UIFactory.createElementWithClass<HTMLDivElement>(
      "div",
      "breakdown-value"
    );
    skroutzValue.innerHTML = `${priceData.btsPrice.toFixed(
      2
    )}€ + ${priceData.btsShippingCost.toFixed(
      2
    )}€ = ${priceData.btsTotalPrice.toFixed(2)}€`;

    skroutzContainer.appendChild(skroutzLabel);
    skroutzContainer.appendChild(skroutzValue);

    // Store price breakdown
    const storeContainer = UIFactory.createElementWithClass<HTMLDivElement>(
      "div",
      "price-breakdown-item"
    );
    const storeLabel = UIFactory.createElementWithClass<HTMLDivElement>(
      "div",
      "breakdown-label"
    );
    storeLabel.textContent = getLabel(
      "Buy through Store",
      "Αγορά από το κατάστημα"
    );

    const storeValue = UIFactory.createElementWithClass<HTMLDivElement>(
      "div",
      "breakdown-value"
    );
    storeValue.textContent = `${priceData.lowestProductPrice.toFixed(
      2
    )}€ + ${priceData.lowestShippingCost.toFixed(
      2
    )}€ = ${priceData.lowestTotalPrice.toFixed(2)}€`;

    storeContainer.appendChild(storeLabel);
    storeContainer.appendChild(storeValue);

    transportationBreakdown.appendChild(skroutzContainer);
    transportationBreakdown.appendChild(storeContainer);

    return transportationBreakdown;
  }
}

class CalculationComponent {
  static create(priceData: PriceData, language: Language): HTMLDivElement {
    const calculationContainer =
      UIFactory.createElementWithClass<HTMLDivElement>(
        "div",
        "calculation-container"
      );

    if (priceData.priceDifference === 0) {
      calculationContainer.innerHTML = `${
        language === Language.ENGLISH
          ? "There is no difference in price"
          : "Δεν υπάρχει διαφορά στην τιμή"
      }`;
      return calculationContainer;
    }

    const diffAbs = Math.abs(priceData.priceDifference);
    const buyingThroughSkroutz =
      language === Language.ENGLISH
        ? "Buying through Skroutz is"
        : 'Με "Aγορά μέσω Skroutz" είναι κατά';

    if (priceData.priceDifference > 0) {
      // Store price is higher than BTS
      const cheaper = language === Language.ENGLISH ? "cheaper" : "φθηνότερο";
      calculationContainer.innerHTML = `${buyingThroughSkroutz}<br><strong>${diffAbs.toFixed(
        2
      )}€ <u>${cheaper}</u></strong> (${priceData.lowestTotalPrice.toFixed(
        2
      )}€ - ${priceData.btsTotalPrice.toFixed(2)}€)`;
    } else {
      // BTS is higher than store price
      calculationContainer.classList.add("calculation-negative");
      const moreExpensive =
        language === Language.ENGLISH ? "more expensive" : "ακριβότερο";
      calculationContainer.innerHTML = `${buyingThroughSkroutz}<br><strong>${diffAbs.toFixed(
        2
      )}€ <u>${moreExpensive}</u></strong> (${priceData.btsTotalPrice.toFixed(
        2
      )}€ - ${priceData.lowestTotalPrice.toFixed(2)}€)`;
    }

    return calculationContainer;
  }
}

class ShopButtonComponent {
  static create(
    priceData: PriceData,
    language: Language,
    shopId: number
  ): HTMLButtonElement {
    const buttonStyle = priceData.isLowestPrice
      ? "go-to-shop-button-positive"
      : "go-to-shop-button-negative";

    const goToStoreButton = UIFactory.createElementWithClass<HTMLButtonElement>(
      "button",
      [buttonStyle, "bold-text"]
    );

    goToStoreButton.textContent =
      language === Language.ENGLISH ? "Go to Shop" : "Μετάβαση στο κατάστημα";

    goToStoreButton.addEventListener("click", () => {
      const targetId = `shop-${shopId}`;
      const targetElements = document.querySelectorAll(`#${targetId}`);

      if (targetElements.length > 0) {
        const targetElement =
          targetElements.length > 1 ? targetElements[1] : targetElements[0];

        targetElement.scrollIntoView({
          behavior: "smooth",
          block: "center",
          inline: "center",
        });
        targetElement.classList.add("lowest-price-store-highlight");

        setTimeout(() => {
          targetElement.classList.remove("lowest-price-store-highlight");
        }, 3000);
      }
    });

    return goToStoreButton;
  }
}

export class PriceCheckerIndicator {
  private state: State;
  private btsPrice: number | undefined = undefined;
  private btsShippingCost: number | undefined = undefined;
  private lowestPriceData: LowestPriceData | undefined = undefined;
  private observer: MutationObserver | null = null;
  private isInitializing: boolean = false;
  private lastProductId: string | null = null;

  constructor(state: State) {
    this.state = state;
  }

  public async start() {
    await this.initializeProductView();
    this.setupNavigationHandlers();
  }

  private setupNavigationHandlers() {
    window.addEventListener("popstate", this.handleNavigation.bind(this));

    this.setupProductViewObserver();
  }

  private async handleNavigation() {
    await this.initializeProductView();
  }

  private setupProductViewObserver() {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }

    this.observer = new MutationObserver((mutations) => {
      if (this.isInitializing) return;

      for (const mutation of mutations) {
        if (mutation.type === "childList") {
          this.checkForProductViewChange();
        }
      }
    });

    this.observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
  }

  private checkForProductViewChange() {
    const offeringCard = document.querySelector("article.offering-card");
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

    const productElement = document.querySelector("[data-product-id]");
    if (productElement) {
      return productElement.getAttribute("data-product-id");
    }

    return window.location.href;
  }

  private async initializeProductView() {
    if (this.isInitializing) {
      return;
    }

    try {
      this.isInitializing = true;

      const offeringCard = document.querySelector("article.offering-card");
      if (!offeringCard) {
        this.isInitializing = false;
        return;
      }

      this.cleanup();

      await this.fetchData();

      const isDataComplete =
        !!this.lowestPriceData &&
        this.btsPrice !== undefined &&
        this.btsShippingCost !== undefined;
      if (!isDataComplete) {
        this.isInitializing = false;
        return;
      }

      this.adjustSiteData(offeringCard);
      this.insertPriceCheckerIndication(offeringCard);
    } finally {
      this.isInitializing = false;
    }
  }

  private cleanup() {
    const existingIndicators = document.querySelectorAll(
      ".price-checker-outline"
    );
    const existingShippingTexts = document.querySelectorAll(
      ".shipping-cost-text"
    );

    existingIndicators.forEach((element) => element.remove());
    existingShippingTexts.forEach((element) => element.remove());
  }

  private async fetchData() {
    this.lowestPriceData = await marketDataReceiver();
    this.btsPrice = buyThroughSkroutzRetriever();
    this.btsShippingCost = buyThroughSkroutzShippingCostRetriever();
  }

  private adjustSiteData(element: Element): void {
    const offeringHeading = element.querySelector("div.offering-heading");
    const price = offeringHeading?.querySelector("div.price");

    if (!offeringHeading || !price) {
      return;
    }

    const shippingText = UIFactory.createElementWithClass<HTMLDivElement>(
      "div",
      "shipping-cost-text"
    );
    const formattedShipping = (this.btsShippingCost ?? 0)
      .toFixed(2)
      .replace(".", ",");
    shippingText.textContent = `(+${formattedShipping}€ ${
      this.state.language === Language.ENGLISH ? "shipping" : "μεταφορικά"
    })`;

    price.insertAdjacentElement("afterend", shippingText);
  }

  private insertPriceCheckerIndication(element: Element): void {
    const priceIndication = this.createPriceIndicationElement();
    element.insertBefore(priceIndication, element.children[1]);
  }

  private createPriceIndicationElement(): HTMLDivElement {
    const priceData = new PriceData(
      this.btsPrice!,
      this.btsShippingCost!,
      this.lowestPriceData!
    );

    const priceIndication = UIFactory.createElementWithClass<HTMLDivElement>(
      "div",
      [
        "display-padding",
        "price-checker-outline",
        priceData.isLowestPrice ? "info-label-positive" : "info-label-negative",
      ]
    );

    const reSkroutzedTag = UIFactory.createElementWithClass<HTMLDivElement>(
      "div",
      "reskroutzed-tag"
    );

    const logoImg = document.createElement("img");
    logoImg.src =
      "https://raw.githubusercontent.com/keybraker/reskroutzed/main/src/assets/icons/128.png";
    logoImg.alt = "reSkroutzed";
    logoImg.width = 14;
    logoImg.height = 14;

    reSkroutzedTag.appendChild(document.createTextNode("By ReSkroutzed"));
    reSkroutzedTag.appendChild(logoImg);

    reSkroutzedTag.style.cursor = "pointer";

    reSkroutzedTag.addEventListener("click", () => {
      const isFirefox =
        navigator.userAgent.toLowerCase().indexOf("firefox") > -1;

      const storeUrl = isFirefox
        ? "https://addons.mozilla.org/en-US/firefox/addon/reskroutzed/reviews/"
        : "https://chromewebstore.google.com/detail/reskroutzed/amglnkndjeoojnjjeepeheobhneeogcl";

      window.open(storeUrl, "_blank");
    });

    priceIndication.appendChild(reSkroutzedTag);

    const contentContainer = UIFactory.createElementWithClass<HTMLDivElement>(
      "div",
      "inline-flex-col"
    );
    const priceCalculationContainer =
      UIFactory.createElementWithClass<HTMLDivElement>(
        "div",
        "price-calculation-container"
      );
    const infoContainer = UIFactory.createElementWithClass<HTMLDivElement>(
      "div",
      "inline-flex-col"
    );
    const actionContainer = UIFactory.createElementWithClass<HTMLDivElement>(
      "div",
      "inline-flex-row"
    );

    const priceDisplay = PriceDisplayComponent.create(
      priceData.lowestProductPrice,
      priceData.lowestShippingCost,
      this.state.language
    );
    priceCalculationContainer.appendChild(priceDisplay);

    const infoText = document.createElement("span");
    infoText.textContent =
      this.state.language === Language.ENGLISH
        ? 'This is the lowest price with shipping apart from "Buy through Skroutz"'
        : 'Αυτή είναι η χαμηλότερη τιμή με μεταφορικά εκτός "Αγορά μέσω Skroutz"';
    priceCalculationContainer.appendChild(infoText);

    contentContainer.appendChild(priceCalculationContainer);

    const calculationContainer = CalculationComponent.create(
      priceData,
      this.state.language
    );
    if (calculationContainer) {
      contentContainer.appendChild(calculationContainer);
    }

    const transportationBreakdown = PriceComparisonBreakdownComponent.create(
      priceData,
      this.state.language
    );
    infoContainer.appendChild(transportationBreakdown);

    contentContainer.appendChild(infoContainer);

    const goToStoreButton = ShopButtonComponent.create(
      priceData,
      this.state.language,
      this.lowestPriceData!.shopId
    );
    actionContainer.appendChild(goToStoreButton);

    contentContainer.appendChild(actionContainer);

    priceIndication.title =
      this.state.language === Language.ENGLISH
        ? "Delivered to you by reSkroutzed"
        : "Από το reSkroutzed";

    priceIndication.appendChild(contentContainer);

    return priceIndication;
  }
}
