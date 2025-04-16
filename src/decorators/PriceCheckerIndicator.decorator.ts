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
    skroutzValue.textContent = `${priceData.btsPrice.toFixed(
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
    storeLabel.textContent = getLabel("Store", "Κατάστημα");

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
  static create(
    priceData: PriceData,
    language: Language
  ): HTMLDivElement | null {
    if (priceData.priceDifference === 0) {
      return null;
    }

    const calculationContainer =
      UIFactory.createElementWithClass<HTMLDivElement>(
        "div",
        "calculation-container"
      );

    const diffAbs = Math.abs(priceData.priceDifference);

    if (priceData.priceDifference > 0) {
      calculationContainer.classList.add("calculation-negative");
      calculationContainer.innerHTML = `${priceData.lowestTotalPrice.toFixed(
        2
      )}€ - ${priceData.btsTotalPrice.toFixed(2)}€ = <strong>${diffAbs.toFixed(
        2
      )}€</strong> ${
        language === Language.ENGLISH ? "more expensive" : "ακριβότερο"
      }`;
    } else {
      calculationContainer.innerHTML = `${priceData.btsTotalPrice.toFixed(
        2
      )}€ - ${priceData.lowestTotalPrice.toFixed(
        2
      )}€ = <strong>${diffAbs.toFixed(2)}€</strong> ${
        language === Language.ENGLISH ? "cheaper" : "φτηνότερο"
      }`;
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

// Main class
export class PriceCheckerIndicator {
  private state: State;
  private btsPrice: number | undefined = undefined;
  private btsShippingCost: number | undefined = undefined;
  private lowestPriceData: LowestPriceData | undefined = undefined;

  constructor(state: State) {
    this.state = state;
  }

  public async start() {
    const offeringCard = document.querySelector("article.offering-card");
    if (!offeringCard) {
      return;
    }

    await this.fetchData();
    if (!this.isDataComplete()) {
      return;
    }

    this.adjustSiteData(offeringCard);
    this.insertPriceCheckerIndication(offeringCard);
  }

  private async fetchData() {
    this.lowestPriceData = await marketDataReceiver();
    this.btsPrice = buyThroughSkroutzRetriever();
    this.btsShippingCost = buyThroughSkroutzShippingCostRetriever();
  }

  private isDataComplete(): boolean {
    return (
      !!this.lowestPriceData &&
      this.btsPrice !== undefined &&
      this.btsShippingCost !== undefined
    );
  }

  private adjustSiteData(element: Element): void {
    const offeringHeading = element.querySelector("div.offering-heading");
    const price = offeringHeading?.querySelector("div.price");
    const shopLink = offeringHeading?.querySelector("a");

    if (!offeringHeading || !price || !shopLink) {
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

    offeringHeading.insertBefore(shippingText, shopLink);
  }

  private insertPriceCheckerIndication(element: Element): void {
    const priceIndication = this.createPriceIndicationElement();
    element.insertBefore(priceIndication, element.children[1]);
  }

  private createPriceIndicationElement(): HTMLDivElement {
    // Create price data object for calculations
    const priceData = new PriceData(
      this.btsPrice!,
      this.btsShippingCost!,
      this.lowestPriceData!
    );

    // Create main container
    const priceIndication = UIFactory.createElementWithClass<HTMLDivElement>(
      "div",
      [
        "display-padding",
        "price-checker-outline",
        priceData.isLowestPrice ? "info-label-positive" : "info-label-negative",
      ]
    );

    // Create the "by reSkroutzed" tag with logo
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

    reSkroutzedTag.appendChild(logoImg);
    reSkroutzedTag.appendChild(document.createTextNode("by reSkroutzed"));

    priceIndication.appendChild(reSkroutzedTag);

    // Create content container
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

    // Add calculation component if available
    const calculationContainer = CalculationComponent.create(
      priceData,
      this.state.language
    );
    if (calculationContainer) {
      contentContainer.appendChild(calculationContainer);
    }

    // Add transportation breakdown
    const transportationBreakdown = PriceComparisonBreakdownComponent.create(
      priceData,
      this.state.language
    );
    infoContainer.appendChild(transportationBreakdown);

    contentContainer.appendChild(infoContainer);

    // Add action button
    const goToStoreButton = ShopButtonComponent.create(
      priceData,
      this.state.language,
      this.lowestPriceData!.shopId
    );
    actionContainer.appendChild(goToStoreButton);

    contentContainer.appendChild(actionContainer);

    // Set title with BTS price info
    const shippingCostFormatted = priceData.btsShippingCost.toFixed(2);
    priceIndication.title =
      this.state.language === Language.ENGLISH
        ? `(note that "Buy through Skroutz" is ${priceData.btsPrice}€ + ${shippingCostFormatted}€ shipping)`
        : `(σημειώστε ότι "Αγορά μέσω Skroutz" είναι ${priceData.btsPrice}€ + ${shippingCostFormatted}€ μεταφορικά)`;

    priceIndication.appendChild(contentContainer);

    return priceIndication;
  }
}
