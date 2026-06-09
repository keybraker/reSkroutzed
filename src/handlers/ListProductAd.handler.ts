import { DomClient } from '../clients/dom/client';
import { Language } from '../common/enums/Language.enum';
import { State } from '../common/types/State.type';
import { AdHandlerInterface } from './common/interfaces/adHandler.interface';

export class ListProductAdHandler implements AdHandlerInterface {
  private readonly productAdClass = ['item-mark', 'product-mark'];
  private readonly trackedProductAdClass = 'tracking-img';
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

    this.flagTrackingImgParents();
  }

  public visibilityUpdate(): void {
    DomClient.getElementsByClass(`.${this.flaggedProductAdClass}`).forEach((element) => {
      DomClient.updateElementVisibility(element, !this.state.hideProductAds ? 'hide' : 'show');
    });
  }

  private updateCountAndVisibility(element: Element): void {
    if (!element.classList.contains(this.flaggedProductAdClass)) {
      const isAd =
        this.productAdClass.some((adClass) => element.classList.contains(adClass)) ||
        DomClient.getElementByClass(`.${this.trackedProductAdClass}`, element) !== null ||
        DomClient.getElementByClass('.shop-promoter', element) !== null;

      if (isAd) {
        this.state.productAdCount++;
        DomClient.addClassesToElement(element, this.flaggedProductAdClass);
        DomClient.updateElementVisibility(element, !this.state.hideProductAds ? 'hide' : 'show');
      }
    }
  }

  private flagElementsBySelector(selector: string): void {
    DomClient.getElementsByClass(selector).forEach((element) => {
      this.state.productAdCount++;
      const trackedAdvertisementLabel =
        this.state.language === Language.GREEK ? 'διαφήμιση' : 'advertisement';
      element.setAttribute('data-reskroutzed-label', trackedAdvertisementLabel);

      DomClient.addClassesToElement(element, this.flaggedProductAdClass);
      DomClient.updateElementVisibility(element, !this.state.hideProductAds ? 'hide' : 'show');
    });
  }

  private flagTrackingImgParents(): void {
    DomClient.getElementsByClass(`.${this.trackedProductAdClass}`).forEach((img) => {
      const li = img.closest('li');
      if (li && !li.classList.contains(this.flaggedProductAdClass)) {
        this.state.productAdCount++;
        const trackedAdvertisementLabel =
          this.state.language === Language.GREEK ? 'διαφήμιση' : 'advertisement';
        li.setAttribute('data-reskroutzed-label', trackedAdvertisementLabel);
        DomClient.addClassesToElement(li, this.flaggedProductAdClass);
        DomClient.updateElementVisibility(li, !this.state.hideProductAds ? 'hide' : 'show');
      }
    });
  }
}
