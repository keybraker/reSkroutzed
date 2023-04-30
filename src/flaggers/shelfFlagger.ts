import { State } from "../enums/State";
import { isSponsored, updateSponsoredText } from "../helpers/helpers";
import { flagProductListItem } from "./productFlagger";

export function shelfFlagger(state: State): void {
  const h4ElementsFlagged = document.querySelectorAll("h4.flagged-shelf");
  state.sponsoredShelfCount = h4ElementsFlagged?.length ?? 0;

  const h4Elements = document.querySelectorAll("h4:not(.flagged-shelf)");

  [...h4Elements].filter(isSponsored).forEach(element => updateShelfCountAndVisibility(element, state));
}

function updateShelfCountAndVisibility(h4Element: Element, state: State): void {
  state.sponsoredShelfCount++;

  h4Element.classList.add("warning-label");
  updateSponsoredText(h4Element, true, state);

  const h4ParentElement = h4Element.parentElement;
  if (h4ParentElement) {
    h4ParentElement.classList.add("flagged-shelf");

    const displayClass = "display-none";
    state.visible
      ? h4ParentElement.classList.remove(displayClass)
      : h4ParentElement.classList.add(displayClass);

    const sponsoredItems = h4ParentElement?.children[2]?.children[0]?.children;

    if (sponsoredItems) {
      [...sponsoredItems].forEach(element => flagProductListItem(element, state));
    }
  }
}
