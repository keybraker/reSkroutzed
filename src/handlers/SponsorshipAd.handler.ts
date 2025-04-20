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
    // Initialize a counter for sponsorships
    let sponsorshipCount = 0;

    const allFlaggedSponsorshipElements = this.getElements(`.${this.flaggedSponsorshipAdClass}`);
    sponsorshipCount = allFlaggedSponsorshipElements.length;

    this.getElements(`li:not(.${this.flaggedSponsorshipAdClass})`).forEach((element) =>
      this.updateCountAndVisibility(element, sponsorshipCount),
    );

    this.sponsorshipAdSelectors.forEach((selector) => {
      this.flagElementsBySelector(
        `${selector}:not(.${this.flaggedSponsorshipAdClass})`,
        sponsorshipCount,
      );
    });
  }

  public visibilityUpdate(): void {
    this.getElements(`.${this.flaggedSponsorshipAdClass}`).forEach((element) => {
      DomClient.updateElementVisibility(element, !this.state.hideSponsorships ? 'hide' : 'show');
    });
  }

  private updateCountAndVisibility(element: Element, count: number): void {
    if (
      this.sponsorshipAdSelectors.some((selector) => element.matches(selector)) &&
      !element.classList.contains(this.flaggedSponsorshipAdClass)
    ) {
      count++;
      this.flagElement(element, this.flaggedSponsorshipAdClass);
      DomClient.updateElementVisibility(element, !this.state.hideSponsorships ? 'hide' : 'show');
    }
  }

  private flagElementsBySelector(selector: string, count: number): void {
    this.getElements(selector).forEach((element) => {
      count++;
      this.flagElement(element, this.flaggedSponsorshipAdClass);
      DomClient.updateElementVisibility(element, !this.state.hideSponsorships ? 'hide' : 'show');
    });
  }
}
