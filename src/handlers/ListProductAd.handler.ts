import { DomClient } from '../clients/dom/client';
import { State } from '../common/types/State.type';
import { BaseHandler } from './base.handler';

export class ListProductAdHandler extends BaseHandler {
  private readonly productAdClass = ['labeled-item', 'labeled-product'];
  private readonly flaggedProductAdClass = 'flagged-product';

  constructor(state: State) {
    super(state);
  }

  public flag(): void {
    this.state.productAdCount = 0;

    const allFlaggedVideoElements = this.getElements(`.${this.flaggedProductAdClass}`);
    this.state.productAdCount = allFlaggedVideoElements.length;

    this.getElements(`li:not(.${this.flaggedProductAdClass})`).forEach((element) =>
      this.updateCountAndVisibility(element),
    );

    this.productAdClass.forEach((videoAdClass) => {
      this.flagElementsBySelector(`.${videoAdClass}:not(.${this.flaggedProductAdClass})`);
    });
  }

  public visibilityUpdate(): void {
    this.getElements(`.${this.flaggedProductAdClass}`).forEach((element) => {
      DomClient.updateElementVisibility(element, !this.state.hideProductAds ? 'hide' : 'show');
    });
  }

  private updateCountAndVisibility(element: Element): void {
    if (
      this.productAdClass.some((videoAdClass) => element.classList.contains(videoAdClass)) &&
      !element.classList.contains(this.flaggedProductAdClass)
    ) {
      this.state.productAdCount++;
      this.flagElement(element, this.flaggedProductAdClass);
      DomClient.updateElementVisibility(element, !this.state.hideVideoAds ? 'hide' : 'show');
    }
  }

  private flagElementsBySelector(selector: string): void {
    this.getElements(selector).forEach((element) => {
      this.state.productAdCount++;
      this.flagElement(element, this.flaggedProductAdClass);
      DomClient.updateElementVisibility(element, !this.state.hideVideoAds ? 'hide' : 'show');
    });
  }
}
