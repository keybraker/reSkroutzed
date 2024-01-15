import { Language } from "../enums/Language";
import { State } from "../types/State";

export class CorrectFinalPrice {
    private state: State;
    private btsPrice: number | undefined = undefined;

    constructor(state: State) {
        this.state = state;
        this.btsPrice = this.fetchBTSPrice();
    }

    private fetchBTSPrice() {
        const priceElement = document.querySelector(".price");
        return priceElement ? this.priceElementToNumber(priceElement) : undefined;
    }

    private priceElementToNumber(element: Element) {
        let priceValue = "";

        const leftPart = element.querySelector("span.comma");
        if (!leftPart?.previousSibling) {
            return undefined;
        }

        const integerPart = leftPart.previousSibling.textContent;
        priceValue = `${priceValue}${integerPart}`;

        const rightPart = element.querySelector("span.comma + span");
        if (!rightPart) {
            return undefined;
        }

        const decimalPart = rightPart.textContent;
        priceValue = `${priceValue}.${decimalPart}`;

        return parseFloat(priceValue);
    }

    public async start() {
        const BTS_FREE_SHIPPING_THRESHOLD = 20;

        if(this.btsPrice && this.btsPrice < BTS_FREE_SHIPPING_THRESHOLD) {
            const priceDiv = document.querySelector("div.price");

            if (priceDiv) {
                const deliverCostDiv = document.createElement("div");

                deliverCostDiv.classList.add("deliver-cost");
                deliverCostDiv.textContent = this.state.language === Language.ENGLISH ? " (+3,00€ delivery cost)" : " (+3,00€ μεταφορικά)";

                priceDiv.appendChild(deliverCostDiv);
            }
        }

        const finalPriceLabel = document.querySelector("label.toggle-switch-label");

        if (finalPriceLabel) {
            finalPriceLabel.textContent += this.state.language === Language.ENGLISH ? " (with cash on delivery)" : " (με αντικαταβολή)";
        }
    }
}
