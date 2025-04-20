import { DomClient } from '../clients/dom/client';
import { State } from '../common/types/State.type';
import { AdHandlerInterface } from './common/interfaces/adHandler.interface';

export class SponsorshipAdHandler implements AdHandlerInterface {
  private readonly sponsorshipAdSelectors = ['#sponsorship'];
  private readonly flaggedSponsorshipAdClass = 'flagged-sponsorship';

  constructor(private state: State) {}

  public flag(): void {
    this.state.sponsorshipAdCount = 0;

    const allFlaggedSponsorshipElements = DomClient.getElementsByClass(
      `.${this.flaggedSponsorshipAdClass}`,
    );
    this.state.sponsorshipAdCount = allFlaggedSponsorshipElements.length;

    DomClient.getElementsByClass(`li:not(.${this.flaggedSponsorshipAdClass})`).forEach((element) =>
      this.updateCountAndVisibility(element),
    );

    this.sponsorshipAdSelectors.forEach((selector) => {
      this.flagElementsBySelector(`${selector}:not(.${this.flaggedSponsorshipAdClass})`);
    });
  }

  public visibilityUpdate(): void {
    DomClient.getElementsByClass(`.${this.flaggedSponsorshipAdClass}`).forEach((element) => {
      DomClient.updateElementVisibility(element, !this.state.hideSponsorships ? 'hide' : 'show');
    });
  }

  private updateCountAndVisibility(element: Element): void {
    if (
      this.sponsorshipAdSelectors.some((selector) => element.matches(selector)) &&
      !element.classList.contains(this.flaggedSponsorshipAdClass)
    ) {
      this.state.sponsorshipAdCount++;
      DomClient.addClassesToElement(element, this.flaggedSponsorshipAdClass);
      DomClient.updateElementVisibility(element, !this.state.hideSponsorships ? 'hide' : 'show');
    }
  }

  private flagElementsBySelector(selector: string): void {
    DomClient.getElementsByClass(selector).forEach((element) => {
      this.state.sponsorshipAdCount++;
      DomClient.addClassesToElement(element, this.flaggedSponsorshipAdClass);
      DomClient.updateElementVisibility(element, !this.state.hideSponsorships ? 'hide' : 'show');
    });
  }
}
