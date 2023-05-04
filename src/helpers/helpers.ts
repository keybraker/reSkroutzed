import { Language } from "../enums/Language";
import { State } from "../types/State";

export function toggleVisibility(element: Element, state: State) {
  state.visible
    ? element.classList.remove("display-none")
    : element.classList.add("display-none");
}

export function sponsoredText(isPlural = false, language: Language) {
  return isPlural
    ? language === "EN"
      ? "Sponsored stores"
      : "Προωθούμενα καταστήματα"
    : language == "EN"
    ? "Sponsored store"
    : "Προωθούμενo κατάστημα";
}

export function updateSponsoredTextPlural(
  element: Element,
  language: Language
) {
  element.textContent = sponsoredText(true, language);
}

export function updateSponsoredTextSingle(
  element: Element,
  language: Language
) {
  element.textContent = sponsoredText(false, language);
}

export function isSponsored(element: Element | null) {
  if (!element || !element?.textContent) {
    return false;
  }

  const sponsoredTexts = [
    "Επιλεγμένο κατάστημα",
    "Eπιλεγμένο κατάστημα",
    "Selected shop",
    "Επιλεγμένα καταστήματα",
    "Eπιλεγμένα καταστήματα",
    "Selected shops",
    "Sponsored",
  ];

  return sponsoredTexts.includes(element.textContent);
}

export function isFlagged(element: Element | null) {
  if (!element || !element?.textContent) {
    return false;
  }

  const sponsoredTexts = [
    "Sponsored stores",
    "Προωθούμενα καταστήματα",
    "Sponsored store",
    "Προωθούμενo κατάστημα",
  ];

  return sponsoredTexts.includes(element.textContent);
}
export function flagProductListItem(
  listItem: Element,
  language: Language
): void {
  flagLabelElement(listItem, language);
  flagImageElement(listItem);

  listItem.classList.add("flagged-product");
}

function flagLabelElement(listItem: Element, language: Language): void {
  const labelTextElement = listItem.querySelector(".label-text");

  if (labelTextElement && isSponsored(labelTextElement)) {
    labelTextElement.classList.add("flagged-product-label");
    updateSponsoredTextSingle(labelTextElement, language);
  }
}

function flagImageElement(listItem: Element): void {
  const imageLinkElement = listItem.querySelector("a.image");

  if (imageLinkElement) {
    imageLinkElement.classList.add("flagged-product-image");
  }
}
