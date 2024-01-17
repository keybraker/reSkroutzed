import { Language } from "../enums/Language";
import { State } from "../types/State";

export class CorrectFinalPrice {
    private state: State;

    constructor(state: State) {
        this.state = state;
    }

    public async start() {
        this.finalPriceFixer();
        this.shippingCostFixer();
    }

    private finalPriceFixer() {
        const finalPriceLabel = document.querySelector("label.toggle-switch-label");

        if (finalPriceLabel) {
            finalPriceLabel.textContent += this.state.language === Language.ENGLISH ? " (with cash on delivery)" : " (με αντικαταβολή)";
        }
    }

    private shippingCostFixer() {
        const priceElement = document.querySelector(".price");
        if(!priceElement) {
            return;
        }

        const articleEm = document.querySelector("article.offering-card");
        const shippingCostEm = articleEm?.querySelector("em");
        if(!shippingCostEm) {
            return;
        }

        if (!shippingCostEm.parentElement) {
            return;
        }

        const parent = shippingCostEm.parentElement.cloneNode(true);
        if (!(parent instanceof Element)) {
            return;
        }
        // parent.textContent = this.state.language === Language.ENGLISH ? `(shipping cost: ${parent.textContent})` : `(μεταφορικά: ${parent.textContent})`;
        parent.classList.add("shipping-cost");
        priceElement.appendChild(parent);
    }
}
