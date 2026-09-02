import { DomClient } from '../clients/dom/client';
import { BaseAdHandler } from './common/BaseAdHandler';

export class SponsorshipAdHandler extends BaseAdHandler {
  protected readonly flaggedClass = 'flagged-sponsorship';
  protected readonly counterKey = 'sponsorshipAdCount' as const;
  protected readonly visibilityKey = 'hideSponsorships' as const;

  private readonly sponsorshipAdSelectors = ['#sponsorship', '.js-sponsorship-handler'];

  /**
   * Skroutz only renders one of these inside a sponsorship-handler slot when a
   * real sponsorship is present. `.js-sponsorship-handler` is also used as a
   * slot class on listing page headers (breadcrumb/title) that never receive an
   * ad, so those empty shells must not be flagged or highlighted.
   */
  private readonly sponsorshipContentSelector = [
    '#top-strip',
    '.impression-img',
    '.shop-promoter',
    '[href*="sponsorship_stats"]',
    '[class*="inhouse"]',
  ].join(',');

  public flag(): void {
    this.resetCount();

    this.scanListItems((element) =>
      this.sponsorshipAdSelectors.some((selector) => element.matches(selector)),
    );

    this.flagBySelector(`#sponsorship:not(.${this.flaggedClass})`);

    DomClient.getElementsByClass(`.js-sponsorship-handler:not(.${this.flaggedClass})`).forEach(
      (element) => {
        if (DomClient.getElementByClass(this.sponsorshipContentSelector, element)) {
          this.mark(element);
        }
      },
    );
  }
}
