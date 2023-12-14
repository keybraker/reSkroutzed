import { Language } from "../enums/Language";
import { State } from "../types/State";

export class CorrectFinalPrice {
    private state: State;

    constructor(state: State) {
        this.state = state;
    }

    public async start() {
        const finalPriceLabel = document.querySelector("label.toggle-switch-label");

        if (finalPriceLabel) {
            finalPriceLabel.textContent += this.state.language === Language.ENGLISH ? " (with cash on delivery)" : " (με αντικαταβολή)";
        }
    }
}
