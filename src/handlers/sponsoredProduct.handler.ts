import { flagProductListItem, isFlagged } from "../utilities/flag.util";
import {
  isSponsored,
  toggleVisibility,
  updateSponsoredTextSingle,
} from "../utilities/sponsored.util";
import { State } from "../types/State.type";

export class SponsoredProductHandler {
  private state: State;

  constructor(state: State) {
    this.state = state;
  }

  public flag(): void {
    this.updateSponsoredCount();

    const nonFlaggedProductListItems = document.querySelectorAll(
      "li:not(.flagged-product)"
    );

    [...nonFlaggedProductListItems]
      ?.filter(this.isSponsored)
      ?.forEach((listItem) => {
        flagProductListItem(listItem);
        updateSponsoredTextSingle(listItem, this.state.language);
        this.state.sponsoredCount++;
        toggleVisibility(listItem, this.state);
      });

    [...nonFlaggedProductListItems]
      ?.filter(this.hasFlaggedLabelText)
      ?.forEach((listItem) => {
        flagProductListItem(listItem);
        updateSponsoredTextSingle(listItem, this.state.language);
        toggleVisibility(listItem, this.state);
      });
  }

  private updateSponsoredCount(): void {
    const flaggedProductLists = document.querySelectorAll("li.flagged-product");
    const flaggedProductDivs = document.querySelectorAll(
      "div.flagged-bought-together"
    );

    if (flaggedProductLists?.length === 0 && flaggedProductDivs?.length === 0) {
      this.state.sponsoredCount = 0;
    }
  }

  private isSponsored(listItem: Element): boolean {
    const labelTextElement = listItem.querySelector(".label-text");
    if (isSponsored(labelTextElement)) {
      return true;
    }

    return false;
  }

  private hasFlaggedLabelText(listItem: Element): boolean {
    const labelTextElement = listItem.querySelector(".label-text");
    return isFlagged(labelTextElement);
  }
}
