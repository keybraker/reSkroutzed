import { State } from '../common/types/State.type';
import { BaseHandler } from './base.handler';

export class PromotionalVideoHandler extends BaseHandler {
  constructor(state: State) {
    super(state);
  }

  public flag(): void {
    this.state.videoAdCount = 0;

    // First count all existing flagged videos
    const allFlaggedVideoElements = this.getElements(
      'li.flagged-video, .listing-reels-shelf.flagged-video, .video-promo.flagged-video, .tl-reels.flagged-video',
    );
    this.state.videoAdCount = allFlaggedVideoElements.length;

    // Flag new video elements by type
    this.getElements('li:not(.flagged-video)').forEach((element) =>
      this.updateVideoCountAndVisibility(element),
    );

    this.flagElementsBySelector('.listing-reels-shelf:not(.flagged-video)');
    this.flagElementsBySelector('.video-promo:not(.flagged-video)');
    this.flagElementsBySelector('.tl-reels:not(.flagged-video)');
  }

  public toggleVideoVisibility(): void {
    const videoElements = this.getElements(
      'li.flagged-video, .listing-reels-shelf.flagged-video, .video-promo.flagged-video, .tl-reels.flagged-video',
    );

    videoElements.forEach((element) => this.toggleVideoElementVisibility(element));
  }

  private updateVideoCountAndVisibility(element: Element): void {
    if (
      element?.classList.contains('promo-video-card') ||
      element?.classList.contains('video-promo') ||
      element?.classList.contains('tl-reels')
    ) {
      this.state.videoAdCount++;
      this.flagElement(element, 'flagged-video');
      this.toggleVideoElementVisibility(element);
    }
  }

  private flagElementsBySelector(selector: string): void {
    this.getElements(selector).forEach((element) => {
      this.state.videoAdCount++;
      this.flagElement(element, 'flagged-video', 'promo-video-card');
      this.toggleVideoElementVisibility(element);
    });
  }

  private toggleVideoElementVisibility(element: Element): void {
    if (this.state) {
      this.state.hideVideoAds
        ? element.classList.remove('display-none-promo-product')
        : element.classList.add('display-none-promo-product');
    }
  }
}
