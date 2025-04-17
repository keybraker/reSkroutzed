import { Language } from "../enums/Language.enum";
import { State } from "../types/State.type";

export class CorrectFinalPriceDecorator {
  private state: State;

  constructor(state: State) {
    this.state = state;
  }

  public async start() {
    this.finalPriceFixer();
    // this.shippingCostFixer();
  }

  private finalPriceFixer() {
    const finalPriceLabel = document.querySelector("label.toggle-switch-label");

    if (finalPriceLabel) {
      finalPriceLabel.textContent +=
        this.state.language === Language.ENGLISH
          ? " (with cash on delivery)"
          : " (με αντικαταβολή)";
    }
  }
}
