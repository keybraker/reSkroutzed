import { DomClient } from '../clients/dom/client';
import { Language } from '../common/enums/Language.enum';
import { State } from '../common/types/State.type';
import { AdHandlerInterface } from './common/interfaces/adHandler.interface';

export class ListProductAdHandler implements AdHandlerInterface {
  private readonly productAdClass = ['labeled-item', 'labeled-product'];
  private readonly trackedProductAdSelector = '.card.tracking-img-container';
  private readonly flaggedProductAdClass = 'flagged-product';

  constructor(private state: State) {}

  public flag(): void {
    this.state.productAdCount = 0;

    const allFlaggedProductElements = DomClient.getElementsByClass(
      `.${this.flaggedProductAdClass}`,
    );
    this.state.productAdCount = allFlaggedProductElements.length;

    DomClient.getElementsByClass(`li:not(.${this.flaggedProductAdClass})`).forEach((element) =>
      this.updateCountAndVisibility(element),
    );

    this.productAdClass.forEach((adClass) => {
      this.flagElementsBySelector(`.${adClass}:not(.${this.flaggedProductAdClass})`);
    });

    this.flagElementsBySelector(
      `${this.trackedProductAdSelector}:not(.${this.flaggedProductAdClass})`,
    );
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
      if (element.matches(this.trackedProductAdSelector)) {
        const trackedAdvertisementLabel =
          this.state.language === Language.GREEK ? 'διαφήμιση' : 'advertisement';
        element.setAttribute('data-reskroutzed-label', trackedAdvertisementLabel);
      }

      DomClient.addClassesToElement(element, this.flaggedProductAdClass);
      DomClient.updateElementVisibility(element, !this.state.hideProductAds ? 'hide' : 'show');
    });
  }
}
