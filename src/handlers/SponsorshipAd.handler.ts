import { BaseAdHandler } from './common/BaseAdHandler';

export class SponsorshipAdHandler extends BaseAdHandler {
  protected readonly flaggedClass = 'flagged-sponsorship';
  protected readonly counterKey = 'sponsorshipAdCount' as const;
  protected readonly visibilityKey = 'hideSponsorships' as const;

  private readonly sponsorshipAdSelectors = ['#sponsorship', '.js-sponsorship-handler'];

  public flag(): void {
    this.resetCount();

    this.scanListItems((element) =>
      this.sponsorshipAdSelectors.some((selector) => element.matches(selector)),
    );

    this.sponsorshipAdSelectors.forEach((selector) => {
      this.flagBySelector(`${selector}:not(.${this.flaggedClass})`);
    });
  }
}
