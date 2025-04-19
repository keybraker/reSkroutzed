import { Language } from '../common/enums/Language.enum';
import { State } from '../common/types/State.type';

export class FinalPriceFixer {
  constructor(private readonly state: State) {}

  execute() {
    const { language } = this.state;

    const finalPriceLabel = document.querySelector('label.toggle-switch-label');

    if (!finalPriceLabel) {
      return;
    }

    finalPriceLabel.textContent +=
      language === Language.ENGLISH ? ' (with cash on delivery)' : ' (με αντικαταβολή)';
  }
}
