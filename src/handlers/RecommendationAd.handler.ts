import { DomClient } from '../clients/dom/client';
import { State } from '../common/types/State.type';
import { AdHandlerInterface } from './common/interfaces/adHandler.interface';

export class RecommendationAdHandler implements AdHandlerInterface {
  private readonly recommendationSelectors = [
    '#js-recommended-skus-shelf',
    '[class*="recommended-skus"]',
    '[class*="cart-recommendations"]',
  ];
  private readonly flaggedRecommendationClass = 'flagged-recommendation';

  constructor(private state: State) {}

  public flag(): void {
    this.state.recommendationAdCount = 0;

    const allFlaggedRecommendationElements = DomClient.getElementsByClass(
      `.${this.flaggedRecommendationClass}`,
    );
    this.state.recommendationAdCount = allFlaggedRecommendationElements.length;

    this.recommendationSelectors.forEach((selector) => {
      this.flagElementsBySelector(selector);
    });
  }

  public visibilityUpdate(): void {
    DomClient.getElementsByClass(`.${this.flaggedRecommendationClass}`).forEach((element) => {
      DomClient.updateElementVisibility(
        element,
        !this.state.hideRecommendationAds ? 'hide' : 'show',
      );
    });
  }

  private flagElementsBySelector(selector: string): void {
    DomClient.getElementsByClass(selector).forEach((element) => {
      if (element.classList.contains(this.flaggedRecommendationClass)) {
        return;
      }

      this.state.recommendationAdCount = (this.state.recommendationAdCount ?? 0) + 1;
      DomClient.addClassesToElement(element, this.flaggedRecommendationClass);
      DomClient.updateElementVisibility(
        element,
        !this.state.hideRecommendationAds ? 'hide' : 'show',
      );
    });
  }
}
