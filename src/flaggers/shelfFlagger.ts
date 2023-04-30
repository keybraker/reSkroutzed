import { Language } from "../enums/Language";
import { isSponsored, updateSponsoredText } from "../helpers/helpers";
import { flagProductListItem } from "./productFlagger";

export function shelfFlagger(sponsoredShelfCount: number, visible: boolean, language: Language, sponsoredCount: number): void {
  const h4ElementsFlagged = document.querySelectorAll("h4.flagged-shelf");
  sponsoredShelfCount = h4ElementsFlagged?.length ?? 0;

  const h4Elements = document.querySelectorAll("h4:not(.flagged-shelf)");

  [...h4Elements].filter(isSponsored).forEach(element => updateShelfCountAndVisibility(element, visible, language, sponsoredShelfCount, sponsoredCount));
}

function updateShelfCountAndVisibility(h4Element: Element, visible: boolean, language: Language, sponsoredShelfCount: number, sponsoredCount: number): void {
  sponsoredShelfCount++;

  h4Element.classList.add("warning-label");
  updateSponsoredText(h4Element, true, language);

  const h4ParentElement = h4Element.parentElement;
  if (h4ParentElement) {
    h4ParentElement.classList.add("flagged-shelf");

    const displayClass = "display-none";
    visible
      ? h4ParentElement.classList.remove(displayClass)
      : h4ParentElement.classList.add(displayClass);

    const sponsoredItems = h4ParentElement?.children[2]?.children[0]?.children;

    if (sponsoredItems) {
      [...sponsoredItems].forEach(element => flagProductListItem(element, visible, language, sponsoredCount));
    }
  }
}
