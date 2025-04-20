import { DomClient } from '../clients/dom/client';
import { State } from '../common/types/State.type';
import { BaseHandler } from './base.handler';

export class SponsorshipAdHandler extends BaseHandler {
  private readonly sponsorshipAdSelectors = ['#sponsorship'];
  private readonly flaggedSponsorshipAdClass = 'flagged-sponsorship';

  constructor(state: State) {
    super(state);
  }

  public flag(): void {
    this.state.videoAdCount = 0;

    const allFlaggedVideoElements = this.getElements(`.${this.flaggedSponsorshipAdClass}`);
    this.state.videoAdCount = allFlaggedVideoElements.length;

    this.getElements(`li:not(.${this.flaggedSponsorshipAdClass})`).forEach((element) =>
      this.updateCountAndVisibility(element),
    );

    this.sponsorshipAdSelectors.forEach((selector) => {
      this.flagElementsBySelector(`${selector}:not(.${this.flaggedSponsorshipAdClass})`);
    });
  }

  public visibilityUpdate(): void {
    this.getElements(`.${this.flaggedSponsorshipAdClass}`).forEach((element) => {
      DomClient.updateElementVisibility(element, !this.state.hideVideoAds ? 'hide' : 'show');
    });
  }

  private updateCountAndVisibility(element: Element): void {
    if (
      this.sponsorshipAdSelectors.some((selector) => element.matches(selector)) &&
      !element.classList.contains(this.flaggedSponsorshipAdClass)
    ) {
      this.state.videoAdCount++;
      this.flagElement(element, this.flaggedSponsorshipAdClass);
      DomClient.updateElementVisibility(element, !this.state.hideVideoAds ? 'hide' : 'show');
    }
  }

  private flagElementsBySelector(selector: string): void {
    this.getElements(selector).forEach((element) => {
      this.state.videoAdCount++;
      this.flagElement(element, this.flaggedSponsorshipAdClass);
      DomClient.updateElementVisibility(element, !this.state.hideVideoAds ? 'hide' : 'show');
    });
  }
}
