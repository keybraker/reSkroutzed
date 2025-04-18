import { BrowserClient, StorageKey } from '../clients/browser/client';
import { State } from '../common/types/State.type';
import { toggleVisibility, updateSponsoredTextSingle } from '../utilities/sponsored.util';

export class SponsorshipHandler {
  private state: State;

  constructor(state: State) {
    this.state = state;
  }

  public flag(): void {
    const sponsorshipDivs = document.querySelectorAll('div#sponsorship:not(.flagged-sponsorship)');

    sponsorshipDivs?.forEach((element) => {
      element.classList.add('flagged-sponsorship', 'flagged-product');

      this.state.productAdCount++;

      const shopPromoterSpan = element.querySelector('.shop-promoter:not(.flagged-product)');
      if (shopPromoterSpan) {
        shopPromoterSpan.classList.add('flagged-product');

        const labelText = shopPromoterSpan.querySelector('.label-text');
        if (labelText) {
          labelText.classList.add('flagged-product-label');
          updateSponsoredTextSingle(labelText, this.state.language);
        }
      }

      this.toggleSponsorshipVisibility(element);
    });
  }

  public toggleSponsorship(): void {
    this.state.hideSponsorships = !this.state.hideSponsorships;

    BrowserClient.setValue(StorageKey.SPONSORSHIP_VISIBILITY, this.state.hideSponsorships);

    document.querySelectorAll('div#sponsorship.flagged-sponsorship').forEach((element) => {
      toggleVisibility(element, this.state);
    });
  }

  private toggleSponsorshipVisibility(element: Element): void {
    toggleVisibility(element, this.state);
  }
}
