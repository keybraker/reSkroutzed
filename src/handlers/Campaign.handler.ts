import { BaseAdHandler } from './common/BaseAdHandler';

export class CampaignAdHandler extends BaseAdHandler {
  protected readonly flaggedClass = 'flagged-shelf';
  protected readonly counterKey = 'shelfAdCount' as const;
  protected readonly visibilityKey = 'hideShelfProductAds' as const;

  private readonly shelfAdClass = [
    'sponsored-badge',
    'shop-promoter',
    'brands-slider-container',
    'brand-list',
    'brand-item',
  ];

  public flag(): void {
    this.resetCount();

    this.scanListItems(
      (element) => this.shelfAdClass.some((adClass) => element.classList.contains(adClass)),
      true,
    );

    this.shelfAdClass.forEach((adClass) => {
      this.flagParentBySelector(`.timeline-card .${adClass}:not(.${this.flaggedClass})`);
    });
  }
}
