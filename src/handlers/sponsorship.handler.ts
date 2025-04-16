import { flagProductListItem } from "../utilities/flag.util";
import {
  isSponsored,
  toggleVisibility,
  updateSponsoredTextSingle,
} from "../utilities/sponsored.util";
import { State } from "../types/State.type";

export class SponsorshipHandler {
  private state: State;

  constructor(state: State) {
    this.state = state;
  }

  public flag(): void {
    // Find sponsorship divs that haven't been flagged yet
    const sponsorshipDivs = document.querySelectorAll(
      "div#sponsorship:not(.flagged-sponsorship)"
    );

    sponsorshipDivs?.forEach((element) => {
      // Mark the div as flagged
      element.classList.add("flagged-sponsorship", "flagged-product");

      // Increment the sponsored count in the state
      this.state.productAdCount++;

      // Find shop-promoter span and flag it if not already flagged
      const shopPromoterSpan = element.querySelector(
        ".shop-promoter:not(.flagged-product)"
      );
      if (shopPromoterSpan) {
        shopPromoterSpan.classList.add("flagged-product");

        // Flag the label text if it exists
        const labelText = shopPromoterSpan.querySelector(".label-text");
        if (labelText) {
          labelText.classList.add("flagged-product-label");
          updateSponsoredTextSingle(labelText, this.state.language);
        }
      }

      // Toggle visibility based on user preference
      this.toggleSponsorshipVisibility(element);
    });
  }

  public toggleSponsorship(): void {
    this.state.hideProductAds = !this.state.hideProductAds;
    localStorage.setItem(
      "reSkroutzed-sponsored-visibility",
      `${this.state.hideProductAds}`
    );

    document
      .querySelectorAll("div#sponsorship.flagged-sponsorship")
      .forEach((element) => {
        toggleVisibility(element, this.state);
      });
  }

  private toggleSponsorshipVisibility(element: Element): void {
    // Apply visibility settings based on state
    toggleVisibility(element, this.state);
  }
}
