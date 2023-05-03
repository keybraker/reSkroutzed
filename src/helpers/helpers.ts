import { State } from "../types/State";

export function toggleVisibility(element: Element, state: State) {
  state.visible
    ? element.classList.remove("display-none")
    : element.classList.add("display-none");
}

export function sponsoredText(isPlural = false, state: State) {
  return isPlural
    ? state.language === "EN"
      ? "Sponsored stores"
      : "Προωθούμενα καταστήματα"
    : state.language == "EN"
      ? "Sponsored store"
      : "Προωθούμενo κατάστημα";
}

export function updateSponsoredTextPlural(element: Element, state: State) {
  element.textContent = sponsoredText(true, state);
}

export function updateSponsoredTextSingle(element: Element, state: State) {
  element.textContent = sponsoredText(false, state);
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

  const sponsoredTexts =
    ["Sponsored stores",
      "Προωθούμενα καταστήματα",
      "Sponsored store",
      "Προωθούμενo κατάστημα",
    ];

  return sponsoredTexts.includes(element.textContent);
}
