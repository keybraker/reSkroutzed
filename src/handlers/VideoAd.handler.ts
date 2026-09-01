import { BaseAdHandler } from './common/BaseAdHandler';

export class VideoAdHandler extends BaseAdHandler {
  protected readonly flaggedClass = 'flagged-video';
  protected readonly counterKey = 'videoAdCount' as const;
  protected readonly visibilityKey = 'hideVideoAds' as const;

  private readonly videoAdSelectors = [
    '.listing-reels-shelf',
    '.video-promo',
    '.tl-reels',
    '.user-help-shelf.default-layout',
  ];

  public flag(): void {
    this.resetCount();

    this.scanListItems((element) =>
      this.videoAdSelectors.some((selector) => element.matches(selector)),
    );

    this.videoAdSelectors.forEach((selector) => {
      this.flagBySelector(`${selector}:not(.${this.flaggedClass})`);
    });
  }
}
