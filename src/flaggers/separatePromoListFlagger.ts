import { Language } from "../enums/Language";
import { isSponsored, toggleVisibility, updateSponsoredText } from "../helpers/helpers";

export function separatePromoListFlagger(visible: boolean, language: Language): void {
  const promotedBoxes = document.querySelectorAll(
    "h2:not(.flagged-list-title)"
  );

  [...promotedBoxes].filter(isSponsored).forEach(element => flagPromotedBox(element, visible, language));
}

function flagPromotedBox(promotedBox: Element, visible: boolean, language: Language): void {
  promotedBox.classList.add("flagged-list-title");
  updateSponsoredText(promotedBox, true, language);
  toggleVisibility(promotedBox, visible);
}