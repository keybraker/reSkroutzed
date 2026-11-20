import { Language } from '../common/enums/Language.enum';
import { DomClient } from '../clients/dom/client';
import { BaseAdHandler } from './common/BaseAdHandler';

export class ListProductAdHandler extends BaseAdHandler {
  protected readonly flaggedClass = 'flagged-product';
  protected readonly counterKey = 'productAdCount' as const;
  protected readonly visibilityKey = 'hideProductAds' as const;

  private readonly productAdClass = ['item-mark', 'product-mark'];
  private readonly trackedProductAdClass = 'tracking-img';

  /**
   * Every timeline card carries an impression pixel, organic ones included
   * (`/c/tpdl/`, `/c/ttcs/`, ...), so only pixels pointing at a paid tracking
   * endpoint — `sbm` for sponsored SKUs, `op` and `sponsorship_stats` for promo
   * posts — mark a real advertisement.
   */
  private readonly sponsoredTrackingPaths = ['/c/sbm/', '/c/op/', '/sponsorship_stats/'];

  public flag(): void {
    this.resetCount();

    this.scanListItems((element) => {
      const isAd = this.isAdvertisement(element);

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

    this.flagSponsoredTrackingImgParents();
  }

  private isAdvertisement(element: Element): boolean {
    return (
      this.productAdClass.some((adClass) => element.classList.contains(adClass)) ||
      DomClient.getElementByClass('.shop-promoter', element) !== null ||
      this.hasSponsoredTrackingImg(element)
    );
  }

  private hasSponsoredTrackingImg(element: Element): boolean {
    return DomClient.getElementsByClass(`.${this.trackedProductAdClass}`, element).some((img) =>
      this.isSponsoredTrackingImg(img),
    );
  }

  private isSponsoredTrackingImg(img: Element): boolean {
    const trackingUrl =
      img.getAttribute('data-tracking-image-options-value') || img.getAttribute('src') || '';

    return this.sponsoredTrackingPaths.some((path) => trackingUrl.includes(path));
  }

  private setAdvertisementLabel(element: Element): void {
    const label = this.state.language === Language.GREEK ? 'διαφήμιση' : 'advertisement';
    element.setAttribute('data-reskroutzed-label', label);
  }

  private flagSponsoredTrackingImgParents(): void {
    DomClient.getElementsByClass(`.${this.trackedProductAdClass}`).forEach((img) => {
      if (!this.isSponsoredTrackingImg(img)) {
        return;
      }

      const li = img.closest('li');
      if (li && !li.classList.contains(this.flaggedClass)) {
        this.setAdvertisementLabel(li);
        this.mark(li);
      }
    });
  }
}
