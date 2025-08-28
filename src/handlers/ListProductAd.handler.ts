import { DomClient } from '../clients/dom/client';
import { State } from '../common/types/State.type';
import { AdHandlerInterface } from './common/interfaces/adHandler.interface';

export class ListProductAdHandler implements AdHandlerInterface {
  private readonly productAdClass = [
    'labeled-item',
    'labeled-product',
    'card.tracking-img-container',
  ];
  private readonly flaggedProductAdClass = 'flagged-product';

  constructor(private state: State) {}

  public flag(): void {
    this.state.productAdCount = 0;

    const allFlaggedVideoElements = DomClient.getElementsByClass(`.${this.flaggedProductAdClass}`);
    this.state.productAdCount = allFlaggedVideoElements.length;

    DomClient.getElementsByClass(`li:not(.${this.flaggedProductAdClass})`).forEach((element) =>
      this.updateCountAndVisibility(element),
    );

    this.productAdClass.forEach((adClass) => {
      this.flagElementsBySelector(`.${adClass}:not(.${this.flaggedProductAdClass})`);
    });
  }

  public visibilityUpdate(): void {
    DomClient.getElementsByClass(`.${this.flaggedProductAdClass}`).forEach((element) => {
      DomClient.updateElementVisibility(element, !this.state.hideProductAds ? 'hide' : 'show');
    });
  }

  private updateCountAndVisibility(element: Element): void {
    if (
      this.productAdClass.some((adClass) => element.classList.contains(adClass)) &&
      !element.classList.contains(this.flaggedProductAdClass)
    ) {
      this.state.productAdCount++;
      DomClient.addClassesToElement(element, this.flaggedProductAdClass);
      DomClient.updateElementVisibility(element, !this.state.hideProductAds ? 'hide' : 'show');
    }
  }

  private flagElementsBySelector(selector: string): void {
    DomClient.getElementsByClass(selector).forEach((element) => {
      this.state.productAdCount++;
      DomClient.addClassesToElement(element, this.flaggedProductAdClass);
      DomClient.updateElementVisibility(element, !this.state.hideProductAds ? 'hide' : 'show');
    });
  }
}
