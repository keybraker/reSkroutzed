import { Language } from '../common/enums/Language.enum';
import { State } from '../common/types/State.type';
import { FeatureInstance } from './common/FeatureInstance';

export class FinalPriceFixerDecorator implements FeatureInstance {
  constructor(private readonly state: State) {}

  execute(): void {
    const { language } = this.state;

    const finalPriceLabel = document.querySelector('label.toggle-switch-label');

    if (!finalPriceLabel) {
      return;
    }

    finalPriceLabel.textContent +=
      language === Language.ENGLISH ? ' (with cash on delivery)' : ' (με αντικαταβολή)';
  }
}
