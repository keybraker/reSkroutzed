import { Language } from "../enums/Language";
import { State } from "../types/State";

export function toggleVisibility(element: Element, state: State) {
  state.visible
    ? element.classList.remove("display-none")
    : element.classList.add("display-none");
}

export function getSponsoredText(isPlural = false, language: Language) {
  return isPlural
    ? language === "EN"
      ? "Sponsored stores"
      : "Προωθούμενα καταστήματα"
    : language == "EN"
    ? "Sponsored store"
    : "Προωθούμενo κατάστημα";
}

export function flagSponsoredText(element: Element, language: Language) {
  element.textContent = getSponsoredText(false, language);
}

export function updateSponsoredTextPlural(
  element: Element,
  language: Language
) {
  if (isSponsored(element)) {
    element.classList.add("sponsored-label");
    element.textContent = getSponsoredText(true, language);
    return;
  }

  const labelTextElement = element.querySelector(".label-text");

  if (labelTextElement) {
    labelTextElement.classList.add("sponsored-label");
    labelTextElement.textContent = getSponsoredText(true, language);
  }
}

export function updateSponsoredTextSingle(
  element: Element,
  language: Language
) {
  if (isSponsored(element)) {
    element.classList.add("sponsored-label");
    element.textContent = getSponsoredText(false, language);
    return;
  }

  const labelTextElement = element.querySelector(".label-text");

  if (labelTextElement) {
    labelTextElement.classList.add("sponsored-label");
    labelTextElement.textContent = getSponsoredText(false, language);
  }
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
