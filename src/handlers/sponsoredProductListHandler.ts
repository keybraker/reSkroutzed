import {
  isSponsored,
  updateSponsoredTextPlural,
  toggleVisibility,
} from "../utilities/sponsoredUtil";
import { State } from "../types/State";

export class SponsoredSeparatePromoListHandler {
  private state: State;

  constructor(state: State) {
    this.state = state;
  }

  public flag(): void {
    const promotedBoxes = document.querySelectorAll(
      "h2:not(.flagged-list-title)"
    );

    [...promotedBoxes]
      ?.filter(isSponsored)
      ?.forEach((element) => this.flagPromotedBox(element));
  }

  private flagPromotedBox(promotedBox: Element): void {
    promotedBox.classList.add("flagged-list-title");
    updateSponsoredTextPlural(promotedBox, this.state.language);
    toggleVisibility(promotedBox, this.state);
  }
}
