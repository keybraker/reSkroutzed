import { Language } from "../enums/Language.enum";
import { buyThroughSkroutzShippingCostRetriever } from "../retrievers/buyThroughSkroutzShippingCost.retriever";
import { buyThroughSkroutzRetriever } from "../retrievers/buyThroughSkroutz.retriever";
import {
  LowestPriceData,
  marketDataReceiver,
} from "../retrievers/marketData.retriever";
import { State } from "../types/State.type";
import { appendCreditChild } from "../functions/appendCreditChild";

function roundToZero(value: number, precision = 1e-10) {
  return Math.abs(value) < precision ? 0 : value;
}

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

    this.lowestPriceData = await marketDataReceiver();
    if (!this.lowestPriceData) {
      return;
    }

    this.btsPrice = buyThroughSkroutzRetriever();
    this.btsShippingCost = buyThroughSkroutzShippingCostRetriever();

    this.insertPriceIndication(offeringCard);
  }

  private insertPriceIndication(element: Element): void {
    const priceIndication = this.createPriceIndicationElement();
    element.insertBefore(priceIndication, element.children[1]);
  }

  private createPriceIndicationElement(): HTMLDivElement {
    const priceIndication = document.createElement("div");
    const colFlex1 = document.createElement("div");
    const colFlex2 = document.createElement("div");
    const rowFlex1 = document.createElement("div");
    const rowFlex2 = document.createElement("div");
    const rowFlex3 = document.createElement("div");
    const otherLowestPrice = document.createElement("div");

    const shippingCost = this.btsShippingCost ?? 0;
    let isLowestPrice = false;
    if (!!this.btsPrice && !!this.lowestPriceData) {
      isLowestPrice =
        this.btsPrice + shippingCost <= this.lowestPriceData.lowestTotalPrice;
    }

    const checkerStyle = isLowestPrice
      ? "info-label-positive"
      : "info-label-negative";

    priceIndication.classList.add(
      "display-padding",
      "inline-flex-row",
      "price-checker-outline",
      checkerStyle
    );
    colFlex1.classList.add("inline-flex-col");
    colFlex2.classList.add("inline-flex-col");
    rowFlex1.classList.add("inline-flex-row");
    rowFlex2.classList.add("inline-flex-row");
    rowFlex3.classList.add("inline-flex-row");
    otherLowestPrice.classList.add("price");

    const priceComma = document.createElement("span");
    const priceDecimal = document.createElement("span");
    const currencySymbol = document.createElement("span");
    const loyaltyPoints = document.createElement("span");
    const shippingInfo = document.createElement("span");

    const lowestPrice = this.lowestPriceData
      ? this.lowestPriceData.lowestTotalPrice
      : undefined;
    const [integerPart, decimalPart] = (
      this.lowestPriceData?.lowestProductPrice?.toFixed(2) ?? "?"
    ).split(".");

    priceComma.textContent = ",";
    priceDecimal.textContent = decimalPart;
    currencySymbol.textContent = "€";

    priceComma.classList.add("comma");

    otherLowestPrice.textContent = integerPart;
    otherLowestPrice.appendChild(priceComma);
    otherLowestPrice.appendChild(priceDecimal);
    otherLowestPrice.appendChild(currencySymbol);
    otherLowestPrice.appendChild(loyaltyPoints);
    otherLowestPrice.appendChild(shippingInfo);

    const priceDifference = document.createElement("span");
    const priceDifferenceExplanation = document.createElement("span");

    const shippingCostSpan = document.createElement("span");
    const shippingCostExplanationSpan = document.createElement("span");

    const diff = roundToZero(
      (lowestPrice ?? 0) - (this.btsPrice ?? 0) - shippingCost
    );

    const isLowestPriceFreeShipping =
      this.lowestPriceData?.lowestShippingCost === 0;

    if (diff > 0) {
      if (isLowestPriceFreeShipping) {
        shippingCostSpan.textContent =
          this.state.language === Language.ENGLISH
            ? "Free shipping"
            : "Δωρεάν μεταφορικά";
      } else {
        shippingCostSpan.textContent = `  + ${this.lowestPriceData?.lowestShippingCost}€`;
        shippingCostExplanationSpan.textContent =
          this.state.language === Language.ENGLISH
            ? "  shipping cost"
            : "  μεταφορικά";
      }

      priceDifference.textContent = `  ${diff.toFixed(2)}€`;
      priceDifferenceExplanation.textContent =
        this.state.language === Language.ENGLISH
          ? "  more expensive"
          : "  ακριβότερο";
    } else if (diff < 0) {
      if (isLowestPriceFreeShipping) {
        shippingCostSpan.textContent =
          this.state.language === Language.ENGLISH
            ? "Free shipping"
            : "Δωρεάν μεταφορικά";
      } else {
        shippingCostSpan.textContent = `  + ${this.lowestPriceData?.lowestShippingCost}€`;
        shippingCostExplanationSpan.textContent =
          this.state.language === Language.ENGLISH
            ? "  shipping cost"
            : "  μεταφορικά";
      }

      priceDifference.textContent = `  ${diff.toFixed(2)}€`;
      priceDifferenceExplanation.textContent =
        this.state.language === Language.ENGLISH ? "  cheaper" : "  φτηνότερο";
    }

    rowFlex2.appendChild(shippingCostSpan);
    rowFlex2.appendChild(shippingCostExplanationSpan);

    rowFlex3.appendChild(priceDifference);
    rowFlex3.appendChild(priceDifferenceExplanation);

    colFlex2.appendChild(rowFlex2);
    colFlex2.appendChild(rowFlex3);

    rowFlex1.appendChild(otherLowestPrice);
    rowFlex1.appendChild(colFlex2);

    colFlex1.appendChild(rowFlex1);
    const information = document.createElement("div");
    information.classList.add("align-center", "font-bold");

    information.textContent =
      this.state.language === Language.ENGLISH
        ? 'is the lowest price with shipping apart from "Buy through Skroutz"'
        : 'είναι η χαμηλότερη τιμή με μεταφορικά εκτός "Αγορά μέσω Skroutz"';
    information.classList.add("align-center", "font-bold");

    colFlex1.appendChild(information);
    appendCreditChild(colFlex1);

    const goToStoreButton = this.goToStoreButtonCreator(isLowestPrice);
    colFlex1.appendChild(goToStoreButton);

    priceIndication.title =
      this.state.language === Language.ENGLISH
        ? `(note that "Buy through Skroutz" is ${this.btsPrice}€ + ${shippingCost}€ shipping)`
        : `(σημειώστε ότι "Αγορά μέσω Skroutz" είναι ${this.btsPrice}€ + ${shippingCost}€ μεταφορικά)`;
    priceIndication.appendChild(colFlex1);

    return priceIndication;
  }

  private goToStoreButtonCreator(isLowestPrice: boolean): HTMLButtonElement {
    const goToStoreButton = document.createElement("button");
    const buttonStyle = isLowestPrice
      ? "go-to-shop-button-positive"
      : "go-to-shop-button-negative";

    goToStoreButton.classList.add(buttonStyle);
    goToStoreButton.textContent =
      this.state.language === Language.ENGLISH
        ? "Go to Shop"
        : "Μετάβαση στο κατάστημα";

    goToStoreButton.addEventListener("click", () => {
      const targetId = `shop-${this.lowestPriceData?.shopId}`;
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
      }
    });

    return goToStoreButton;
  }
}
