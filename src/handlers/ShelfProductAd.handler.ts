import { DomClient } from '../clients/dom/client';
import { State } from '../common/types/State.type';
import { BaseHandler } from './base.handler';

export class ShelfProductAdHandler extends BaseHandler {
  private readonly shelfAdClass = ['sponsored-product-cards', 'sponsored-shelf'];
  private readonly flaggedShelfAdClass = 'flagged-shelf';

  constructor(state: State) {
    super(state);
  }

  public flag(): void {
    // Reset the shelf ad count
    this.state.ShelfAdCount = 0;

    const allFlaggedShelfElements = this.getElements(`.${this.flaggedShelfAdClass}`);
    // Update ShelfAdCount with the number of flagged shelf elements
    this.state.ShelfAdCount = allFlaggedShelfElements.length;

    this.getElements(`li:not(.${this.flaggedShelfAdClass})`).forEach((element) =>
      this.updateCountAndVisibility(element),
    );

    this.shelfAdClass.forEach((videoAdClass) => {
      this.flagElementsBySelector(`.${videoAdClass}:not(.${this.flaggedShelfAdClass})`);
    });
  }

  public visibilityUpdate(): void {
    this.getElements(`.${this.flaggedShelfAdClass}`).forEach((element) => {
      DomClient.updateElementVisibility(element, !this.state.hideShelfProductAds ? 'hide' : 'show');
    });
  }

  private updateCountAndVisibility(element: Element): void {
    if (
      this.shelfAdClass.some((videoAdClass) => element.classList.contains(videoAdClass)) &&
      !element.classList.contains(this.flaggedShelfAdClass)
    ) {
      this.state.productAdCount++;
      // Increment ShelfAdCount when a new shelf ad is found
      this.state.ShelfAdCount++;
      this.flagElement(element, this.flaggedShelfAdClass);
      DomClient.updateElementVisibility(element, !this.state.hideShelfProductAds ? 'hide' : 'show');
    }
  }

  private flagElementsBySelector(selector: string): void {
    this.getElements(selector).forEach((element) => {
      this.state.productAdCount++;
      // Increment ShelfAdCount when a new shelf ad is found
      this.state.ShelfAdCount++;
      this.flagElement(element, this.flaggedShelfAdClass);
      DomClient.updateElementVisibility(element, !this.state.hideShelfProductAds ? 'hide' : 'show');
    });
  }
}
