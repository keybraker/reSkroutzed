import { flagProductListItem } from "../helpers/flagUtil";
import {
  isSponsored,
  toggleVisibility,
  updateSponsoredTextPlural,
  updateSponsoredTextSingle,
} from "../helpers/sponsoredUtil";
import { State } from "../types/State";

export class SponsoredShelfHandler {
  private state: State;

  constructor(state: State) {
    this.state = state;
  }

  public flag(): void {
    this.updateShelfCount();

    const h4Elements = document.querySelectorAll("h4:not(.flagged-shelf)");

    [...h4Elements]
      .filter(isSponsored)
      .forEach((element) => this.updateShelfCountAndVisibility(element));
  }

  private updateShelfCount(): void {
    const flaggedShelf = document.querySelectorAll("h4.flagged-shelf");

    if (flaggedShelf?.length === 0) {
      this.state.sponsoredShelfCount = 0;
    }
  }

  private updateShelfCountAndVisibility(h4Element: Element): void {
    this.state.sponsoredShelfCount++;

    h4Element.classList.add("sponsored-label");
    updateSponsoredTextPlural(h4Element, this.state.language);

    const h4ParentElement = h4Element.parentElement;

    if (h4ParentElement) {
      h4Element.classList.add("flagged-shelf");
      h4ParentElement.classList.add("flagged-shelf");

      toggleVisibility(h4ParentElement, this.state);

      const sponsoredItems =
        h4ParentElement?.children[2]?.children[0]?.children;

      if (sponsoredItems) {
        [...sponsoredItems]?.forEach((element) => {
          flagProductListItem(element);
          updateSponsoredTextSingle(element, this.state.language);
        });
      }
    }
  }
}
