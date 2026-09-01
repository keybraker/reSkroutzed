import { Language } from '../common/enums/Language.enum';
import { DomClient } from '../clients/dom/client';
import { BaseAdHandler } from './common/BaseAdHandler';

export class ListProductAdHandler extends BaseAdHandler {
  protected readonly flaggedClass = 'flagged-product';
  protected readonly counterKey = 'productAdCount' as const;
  protected readonly visibilityKey = 'hideProductAds' as const;

  private readonly productAdClass = ['item-mark', 'product-mark'];
  private readonly trackedProductAdClass = 'tracking-img';

  public flag(): void {
    this.resetCount();

    this.scanListItems((element) => {
      const isAd =
        this.productAdClass.some((adClass) => element.classList.contains(adClass)) ||
        DomClient.getElementByClass(`.${this.trackedProductAdClass}`, element) !== null ||
        DomClient.getElementByClass('.shop-promoter', element) !== null;

      if (isAd) {
        this.setAdvertisementLabel(element);
      }

      return isAd;
    });

    this.productAdClass.forEach((adClass) => {
      DomClient.getElementsByClass(`.${adClass}:not(.${this.flaggedClass})`).forEach((element) => {
        this.setAdvertisementLabel(element);
        this.mark(element);
      });
    });

    this.flagTrackingImgParents();
  }

  private setAdvertisementLabel(element: Element): void {
    const label = this.state.language === Language.GREEK ? 'διαφήμιση' : 'advertisement';
    element.setAttribute('data-reskroutzed-label', label);
  }

  private flagTrackingImgParents(): void {
    DomClient.getElementsByClass(`.${this.trackedProductAdClass}`).forEach((img) => {
      const li = img.closest('li');
      if (li && !li.classList.contains(this.flaggedClass)) {
        this.setAdvertisementLabel(li);
        this.mark(li);
      }
    });
  }
}
