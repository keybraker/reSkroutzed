import { State } from "../enums/State";

export function toggleVisibility(element: Element, state: State) {
  state.visible
    ? element.classList.remove("display-none")
    : element.classList.add("display-none");
}

export function updateSponsoredText(element: Element, isPlural = false, state: State) {
  element.innerHTML = isPlural
    ? state.language === "EN"
      ? "Sponsored stores"
      : "Προωθούμενα καταστήματα"
    : state.language == "EN"
      ? "Sponsored store"
      : "Προωθούμενo κατάστημα";
}

export function isSponsored(element: Element) {
  return (
    element?.textContent === "Επιλεγμένο κατάστημα" ||
    element?.textContent === "Eπιλεγμένο κατάστημα" ||
    element?.textContent === "Selected shop" ||
    element?.textContent === "Επιλεγμένα καταστήματα" ||
    element?.textContent === "Eπιλεγμένα καταστήματα" ||
    element?.textContent === "Selected shops" ||
    element?.textContent === "Sponsored"
  );
}
