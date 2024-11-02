import { Language } from "../enums/Language";
import { buyThroughSkroutzShippingCostRetriever } from "../retrievers/buyThroughSkroutzShippingCostRetriever";
import { buyThroughSkroutzRetriever } from "../retrievers/buyThroughSkroutzRetriever";
import { marketDataReceiver } from "../retrievers/marketDataRetriever";
import { State } from "../types/State";

interface LowestPriceData {
  formatted: string;
  unformatted: number;
  shopId: number;
}

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
        const colFlex = document.createElement("div");
        const rowFlex = document.createElement("div");
        const otherLowestPrice = document.createElement("div");

        const shippingCost = this.btsShippingCost ?? 0;
        let isLowestPrice = false;
        if (!!this.btsPrice && !!this.lowestPriceData) {
            isLowestPrice = this.btsPrice + shippingCost <= this.lowestPriceData.unformatted;
        }

        const checkerStyle = isLowestPrice ? "info-label-positive" : "info-label-negative";

        priceIndication.classList.add("display-padding", "inline-flex-row", "price-checker-outline", checkerStyle);
        colFlex.classList.add("inline-flex-col");
        rowFlex.classList.add("inline-flex-row");
        otherLowestPrice.classList.add("price");

        const priceComma = document.createElement("span");
        const priceDecimal = document.createElement("span");
        const currencySymbol = document.createElement("span");
        const loyaltyPoints = document.createElement("span");
        const shippingInfo = document.createElement("span");

        const lowestPrice = this.lowestPriceData ? this.lowestPriceData.unformatted : undefined;
        const [integerPart, decimalPart] = (lowestPrice?.toFixed(2) ?? "?").split(".");

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

        const diff = roundToZero((lowestPrice ?? 0) - (this.btsPrice ?? 0) - shippingCost);

        if (diff > 0) {
            priceDifference.textContent = ` ${diff} / ${diff.toFixed(2)}€`;
            priceDifferenceExplanation.textContent = this.state.language === Language.ENGLISH
                ? "  more expensive"
                : "  ακριβότερο";
        } else if (diff < 0) {
            priceDifference.textContent = `  ${diff.toFixed(2)}€`;
            priceDifferenceExplanation.textContent = this.state.language === Language.ENGLISH
                ? "  cheaper"
                : "  φτηνότερο";
        }

        rowFlex.appendChild(otherLowestPrice);
        rowFlex.appendChild(priceDifference);
        rowFlex.appendChild(priceDifferenceExplanation);

        colFlex.appendChild(rowFlex);

        const information = document.createElement("div");
        information.textContent = this.state.language === Language.ENGLISH
            ? "is the lowest price with shipping apart from \"Buy through Skroutz\""
            : "είναι η χαμηλότερη τιμή με μεταφορικά εκτός \"Αγορά μέσω Skroutz\"";
        information.classList.add("align-center", "font-bold");

        colFlex.appendChild(information);

        const goToStoreButton = this.goToStoreButtonCreator(isLowestPrice);
        colFlex.appendChild(goToStoreButton);

        priceIndication.title = this.state.language === Language.ENGLISH
            ? `(note that "Buy through Skroutz" is ${this.btsPrice}€ + ${shippingCost}€ shipping)`
            : `(σημειώστε ότι "Αγορά μέσω Skroutz" είναι ${this.btsPrice}€ + ${shippingCost}€ μεταφορικά)`;
        priceIndication.appendChild(colFlex);

        return priceIndication;
    }


    private goToStoreButtonCreator(isLowestPrice: boolean): HTMLButtonElement {
        const goToStoreButton = document.createElement("button");
        const buttonStyle = isLowestPrice ? "go-to-shop-button-positive" : "go-to-shop-button-negative";

        goToStoreButton.classList.add(buttonStyle);
        goToStoreButton.textContent = this.state.language === Language.ENGLISH
            ? "Go to Shop"
            : "Μετάβαση στο κατάστημα";

        goToStoreButton.addEventListener("click", () => {
            const targetId = `shop-${this.lowestPriceData?.shopId}`;
            const targetElement = document.getElementById(targetId);

            if (targetElement) {
                targetElement.scrollIntoView({ behavior: "smooth", block: "center", inline: "center" });
                targetElement.classList.add("lowest-price-store-highlight");
            }
        });

        return goToStoreButton;
    }
}
