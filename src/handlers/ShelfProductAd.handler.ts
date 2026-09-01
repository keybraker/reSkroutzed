import { BaseAdHandler } from './common/BaseAdHandler';

export class ShelfProductAdHandler extends BaseAdHandler {
  protected readonly flaggedClass = 'flagged-shelf';
  protected readonly counterKey = 'shelfAdCount' as const;
  protected readonly visibilityKey = 'hideShelfProductAds' as const;

  private readonly shelfAdClass = [
    'selected-product-cards',
    'sponsored-shelf',
    'js-recently-viewed-skus-shelf',
    'placement-shelf',
    'polymorphic-brand-shelf',
    'polymorphic-brand-shelf-wrapper',
  ];
  private readonly crossSellShelfSelectors = [
    '#cross-sell',
    '.content.top-area.cross-sell-shelf.sponsored-shelf',
  ];

  public flag(): void {
    this.resetCount();

    this.scanListItems((element) =>
      this.shelfAdClass.some((adClass) => element.classList.contains(adClass)),
    );

    this.crossSellShelfSelectors.forEach((selector) => this.flagBySelector(selector));

    this.shelfAdClass.forEach((adClass) => {
      this.flagBySelector(`.${adClass}:not(.${this.flaggedClass})`);
    });
  }
}
