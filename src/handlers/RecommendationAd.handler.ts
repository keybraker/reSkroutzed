import { BaseAdHandler } from './common/BaseAdHandler';

export class RecommendationAdHandler extends BaseAdHandler {
  protected readonly flaggedClass = 'flagged-recommendation';
  protected readonly counterKey = 'recommendationAdCount' as const;
  protected readonly visibilityKey = 'hideRecommendationAds' as const;

  private readonly recommendationSelectors = [
    '#js-recommended-skus-shelf',
    '[class*="recommended-skus"]',
    '[class*="cart-recommendations"]',
  ];

  public flag(): void {
    this.resetCount();

    this.recommendationSelectors.forEach((selector) => this.flagBySelector(selector));
  }
}
