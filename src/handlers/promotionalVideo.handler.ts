import { State } from '../common/types/State.type';

export class PromotionalVideoHandler {
  private state: State;

  constructor(state: State) {
    this.state = state;
  }

  public flag(): void {
    this.state.videoAdCount = 0;

    const allFlaggedVideoElements = document.querySelectorAll(
      'li.flagged-video, .listing-reels-shelf.flagged-video, .video-promo.flagged-video, .tl-reels.flagged-video',
    );
    this.state.videoAdCount = allFlaggedVideoElements?.length ?? 0;

    const liElements = document.querySelectorAll('li:not(.flagged-video)');
    liElements?.forEach((element) => this.updateVideoCountAndVisibility(element));

    const reelsShelfElements = document.querySelectorAll(
      '.listing-reels-shelf:not(.flagged-video)',
    );
    reelsShelfElements?.forEach((element) => {
      this.state.videoAdCount++;
      element.classList.add('flagged-video', 'promo-video-card');

      if (this.state) {
        this.state.hideVideoAds
          ? element.classList.remove('display-none-promo-product')
          : element.classList.add('display-none-promo-product');
      }
    });

    const videoPromoElements = document.querySelectorAll('.video-promo:not(.flagged-video)');
    videoPromoElements?.forEach((element) => {
      this.state.videoAdCount++;
      element.classList.add('flagged-video', 'promo-video-card');

      if (this.state) {
        this.state.hideVideoAds
          ? element.classList.remove('display-none-promo-product')
          : element.classList.add('display-none-promo-product');
      }
    });

    const tlReelsElements = document.querySelectorAll('.tl-reels:not(.flagged-video)');
    tlReelsElements?.forEach((element) => {
      this.state.videoAdCount++;
      element.classList.add('flagged-video', 'promo-video-card');

      if (this.state) {
        this.state.hideVideoAds
          ? element.classList.remove('display-none-promo-product')
          : element.classList.add('display-none-promo-product');
      }
    });
  }

  public toggleVideoVisibility(): void {
    const videoElements = document.querySelectorAll(
      'li.flagged-video, .listing-reels-shelf.flagged-video, .video-promo.flagged-video, .tl-reels.flagged-video',
    );

    videoElements?.forEach((element) => {
      this.state.hideVideoAds
        ? element.classList.remove('display-none-promo-product')
        : element.classList.add('display-none-promo-product');
    });
  }

  private updateVideoCountAndVisibility(element: Element): void {
    if (
      element?.classList.contains('promo-video-card') ||
      element?.classList.contains('video-promo') ||
      element?.classList.contains('tl-reels')
    ) {
      this.state.videoAdCount++;

      element.classList.add('flagged-video');

      if (this.state) {
        this.state.hideVideoAds
          ? element.classList.remove('display-none-promo-product')
          : element.classList.add('display-none-promo-product');
      }
    }
  }
}
