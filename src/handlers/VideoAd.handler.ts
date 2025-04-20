import { DomClient } from '../clients/dom/client';
import { State } from '../common/types/State.type';
import { BaseHandler } from './base.handler';

export class VideoAdHandler extends BaseHandler {
  private readonly videoAdClasses = ['listing-reels-shelf', 'video-promo', 'tl-reels'];
  private readonly flaggedVideoAdClass = 'flagged-video';

  constructor(state: State) {
    super(state);
  }

  public flag(): void {
    this.state.videoAdCount = 0;

    const allFlaggedVideoElements = this.getElements(`.${this.flaggedVideoAdClass}`);
    this.state.videoAdCount = allFlaggedVideoElements.length;

    this.getElements(`li:not(.${this.flaggedVideoAdClass})`).forEach((element) =>
      this.updateCountAndVisibility(element),
    );

    this.videoAdClasses.forEach((videoAdClass) => {
      this.flagElementsBySelector(`.${videoAdClass}:not(.${this.flaggedVideoAdClass})`);
    });
  }

  public visibilityUpdate(): void {
    this.getElements(`.${this.flaggedVideoAdClass}`).forEach((element) => {
      DomClient.updateElementVisibility(element, !this.state.hideVideoAds ? 'hide' : 'show');
    });
  }

  private updateCountAndVisibility(element: Element): void {
    if (
      this.videoAdClasses.some((videoAdClass) => element.classList.contains(videoAdClass)) &&
      !element.classList.contains(this.flaggedVideoAdClass)
    ) {
      this.state.videoAdCount++;
      this.flagElement(element, this.flaggedVideoAdClass);
      DomClient.updateElementVisibility(element, !this.state.hideVideoAds ? 'hide' : 'show');
    }
  }

  private flagElementsBySelector(selector: string): void {
    this.getElements(selector).forEach((element) => {
      this.state.videoAdCount++;
      this.flagElement(element, this.flaggedVideoAdClass);
      DomClient.updateElementVisibility(element, !this.state.hideVideoAds ? 'hide' : 'show');
    });
  }
}
