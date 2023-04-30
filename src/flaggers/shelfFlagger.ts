import { State } from "../enums/State";
import { isSponsored, toggleVisibility, updateSponsoredText } from "../helpers/helpers";
import { flagProductListItem } from "./productFlagger";

export function shelfFlagger(state: State): void {
  updateShelfCount(state);

  const h4Elements = document.querySelectorAll("h4:not(.flagged-shelf)");

  [...h4Elements].filter(isSponsored).forEach(element => updateShelfCountAndVisibility(element, state));
}

function updateShelfCount(state: State): void {
  const flaggedShelf =
    document.querySelectorAll("h4.flagged-shelf");

  if (flaggedShelf?.length === 0) {
    state.sponsoredShelfCount = 0;
  }
}

function updateShelfCountAndVisibility(h4Element: Element, state: State): void {
  state.sponsoredShelfCount++;

  h4Element.classList.add("warning-label");
  updateSponsoredText(h4Element, true, state);

  const h4ParentElement = h4Element.parentElement;

  if (h4ParentElement) {
    h4Element.classList.add("flagged-shelf");
    h4ParentElement.classList.add("flagged-shelf");

    toggleVisibility(h4ParentElement, state);

    const sponsoredItems = h4ParentElement?.children[2]?.children[0]?.children;

    if (sponsoredItems) {
      [...sponsoredItems].forEach(element => flagProductListItem(element, state));
    }
  }
}
