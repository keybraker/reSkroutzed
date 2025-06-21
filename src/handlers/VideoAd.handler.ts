import { DomClient } from '../clients/dom/client';
import { State } from '../common/types/State.type';
import { AdHandlerInterface } from './common/interfaces/adHandler.interface';

export class VideoAdHandler implements AdHandlerInterface {
  private readonly videoAdClasses = ['listing-reels-shelf', 'video-promo', 'tl-reels'];
  private readonly flaggedVideoAdClass = 'flagged-video';

  constructor(private state: State) {}

  public flag(): void {
    this.state.videoAdCount = 0;

    const allFlaggedVideoElements = DomClient.getElementsByClass(`.${this.flaggedVideoAdClass}`);
    this.state.videoAdCount = allFlaggedVideoElements.length;

    DomClient.getElementsByClass(`li:not(.${this.flaggedVideoAdClass})`).forEach((element) =>
      this.updateCountAndVisibility(element),
    );

    this.videoAdClasses.forEach((adClass) => {
      this.flagElementsBySelector(`.${adClass}:not(.${this.flaggedVideoAdClass})`);
    });
  }

  public visibilityUpdate(): void {
    DomClient.getElementsByClass(`.${this.flaggedVideoAdClass}`).forEach((element) => {
      DomClient.updateElementVisibility(element, !this.state.hideVideoAds ? 'hide' : 'show');
    });
  }

  private updateCountAndVisibility(element: Element): void {
    if (
      this.videoAdClasses.some((adClass) => element.classList.contains(adClass)) &&
      !element.classList.contains(this.flaggedVideoAdClass)
    ) {
      this.state.videoAdCount++;
      DomClient.addClassesToElement(element, this.flaggedVideoAdClass);
      DomClient.updateElementVisibility(element, !this.state.hideVideoAds ? 'hide' : 'show');
    }
  }

  private flagElementsBySelector(selector: string): void {
    DomClient.getElementsByClass(selector).forEach((element) => {
      this.state.videoAdCount++;
      DomClient.addClassesToElement(element, this.flaggedVideoAdClass);
      DomClient.updateElementVisibility(element, !this.state.hideVideoAds ? 'hide' : 'show');
    });
  }
}
