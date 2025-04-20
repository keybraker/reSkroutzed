import { BrowserClient, StorageKey } from '../clients/browser/client';
import { State } from '../common/types/State.type';
import { BaseHandler } from './base.handler';

export class SponsorshipHandler extends BaseHandler {
  constructor(state: State) {
    super(state);
  }

  public flag(): void {
    const sponsorshipDivs = this.getElements('div#sponsorship:not(.flagged-sponsorship)');

    sponsorshipDivs.forEach((element) => {
      this.flagElement(element, 'flagged-sponsorship', 'flagged-product');
      this.state.productAdCount++;

      const shopPromoterSpan = element.querySelector('.shop-promoter:not(.flagged-product)');
      if (shopPromoterSpan) {
        this.flagElement(shopPromoterSpan, 'flagged-product');

        const labelText = shopPromoterSpan.querySelector('.label-text');
        if (labelText) {
          this.flagElement(labelText, 'flagged-product-label');
          this.updateSponsoredText(labelText, true);
        }
      }

      this.toggleVisibility(element);
    });
  }

  public visibilityUpdate(): void {
    const flaggedSponsorships = this.getElements('div#sponsorship.flagged-sponsorship');

    flaggedSponsorships.forEach((element) => {
      this.toggleElementVisibility(element, !this.state.hideSponsorships);
    });
  }

  public toggleSponsorship(): void {
    this.state.hideSponsorships = !this.state.hideSponsorships;
    BrowserClient.setValue(StorageKey.SPONSORSHIP_VISIBILITY, this.state.hideSponsorships);

    this.getElements('div#sponsorship.flagged-sponsorship').forEach((element) => {
      this.state.hideSponsorships
        ? element.classList.add('display-none')
        : element.classList.remove('display-none');
    });
  }

  private toggleVisibility(element: Element): void {
    this.toggleElementVisibility(element, !this.state.hideSponsorships);
  }
}
