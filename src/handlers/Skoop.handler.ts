import { DomClient } from '../clients/dom/client';
import { State } from '../common/types/State.type';
import { AdHandlerInterface } from './common/interfaces/adHandler.interface';

export class SkoopHandler implements AdHandlerInterface {
  private readonly skoopSelectors = ['#sku-recommendation-shelf-similar-from-skoop'];
  private readonly flaggedSkoopClass = 'flagged-skoop';

  constructor(private state: State) {}

  public flag(): void {
    this.state.skoopAdCount = 0;

    const allFlaggedSkoopElements = DomClient.getElementsByClass(`.${this.flaggedSkoopClass}`);
    this.state.skoopAdCount = allFlaggedSkoopElements.length;

    this.skoopSelectors.forEach((selector) => {
      this.flagElementsBySelector(`${selector}:not(.${this.flaggedSkoopClass})`);
    });
  }

  public visibilityUpdate(): void {
    DomClient.getElementsByClass(`.${this.flaggedSkoopClass}`).forEach((element) => {
      DomClient.updateElementVisibility(element, !this.state.hideSkoopAds ? 'hide' : 'show');
    });
  }

  private flagElementsBySelector(selector: string): void {
    DomClient.getElementsByClass(selector).forEach((element) => {
      if (element.classList.contains(this.flaggedSkoopClass)) {
        return;
      }

      this.state.skoopAdCount++;
      DomClient.addClassesToElement(element, this.flaggedSkoopClass);
      DomClient.updateElementVisibility(element, !this.state.hideSkoopAds ? 'hide' : 'show');
    });
  }
}
