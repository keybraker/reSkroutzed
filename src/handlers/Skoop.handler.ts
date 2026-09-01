import { BaseAdHandler } from './common/BaseAdHandler';

export class SkoopHandler extends BaseAdHandler {
  protected readonly flaggedClass = 'flagged-skoop';
  protected readonly counterKey = 'skoopAdCount' as const;
  protected readonly visibilityKey = 'hideSkoopAds' as const;

  private readonly skoopSelectors = ['#sku-recommendation-shelf-similar-from-skoop'];

  public flag(): void {
    this.resetCount();

    this.skoopSelectors.forEach((selector) => {
      this.flagBySelector(`${selector}:not(.${this.flaggedClass})`);
    });
  }
}
