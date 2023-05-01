import { State } from "../types/State";
import { isSponsored, toggleVisibility, updateSponsoredTextPlural } from "../helpers/helpers";

export function separatePromoListFlagger(state: State): void {
  const promotedBoxes = document.querySelectorAll(
    "h2:not(.flagged-list-title)"
  );

  [...promotedBoxes].filter(isSponsored).forEach(element => flagPromotedBox(element, state));
}

function flagPromotedBox(promotedBox: Element, state: State): void {
  promotedBox.classList.add("flagged-list-title");
  updateSponsoredTextPlural(promotedBox, state);
  toggleVisibility(promotedBox, state);
}