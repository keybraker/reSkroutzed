import { DomClient } from '../clients/dom/client';
import { State } from '../common/types/State.type';
import { AdHandlerInterface } from './common/interfaces/adHandler.interface';

export class ShelfProductAdHandler implements AdHandlerInterface {
  private readonly shelfAdClass = [
    'selected-product-cards',
    'sponsored-shelf',
    'js-recently-viewed-skus-shelf',
  ];
  private readonly flaggedShelfAdClass = 'flagged-shelf';

  constructor(private state: State) {}

  public flag(): void {
    this.state.ShelfAdCount = 0;

    const allFlaggedShelfElements = DomClient.getElementsByClass(`.${this.flaggedShelfAdClass}`);
    this.state.ShelfAdCount = allFlaggedShelfElements.length;

    DomClient.getElementsByClass(`li:not(.${this.flaggedShelfAdClass})`).forEach((element) =>
      this.updateCountAndVisibility(element),
    );

    this.shelfAdClass.forEach((adClass) => {
      this.flagElementsBySelector(`.${adClass}:not(.${this.flaggedShelfAdClass})`);
    });
  }

  public visibilityUpdate(): void {
    DomClient.getElementsByClass(`.${this.flaggedShelfAdClass}`).forEach((element) => {
      DomClient.updateElementVisibility(element, !this.state.hideShelfProductAds ? 'hide' : 'show');
    });
  }

  private updateCountAndVisibility(element: Element): void {
    if (
      this.shelfAdClass.some((adClass) => element.classList.contains(adClass)) &&
      !element.classList.contains(this.flaggedShelfAdClass)
    ) {
      this.state.ShelfAdCount++;
      DomClient.addClassesToElement(element, this.flaggedShelfAdClass);
      DomClient.updateElementVisibility(element, !this.state.hideShelfProductAds ? 'hide' : 'show');
    }
  }

  private flagElementsBySelector(selector: string): void {
    DomClient.getElementsByClass(selector).forEach((element) => {
      this.state.ShelfAdCount++;
      DomClient.addClassesToElement(element, this.flaggedShelfAdClass);
      DomClient.updateElementVisibility(element, !this.state.hideShelfProductAds ? 'hide' : 'show');
    });
  }
}
