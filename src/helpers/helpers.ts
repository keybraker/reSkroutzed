import { Language } from "../enums/Language";

export function toggleVisibility(element: Element, visible: boolean) {
  visible
    ? element.classList.remove("display-none")
    : element.classList.add("display-none");
}

export function updateSponsoredText(element: Element, isPlural = false, language: Language) {
  element.innerHTML = isPlural
    ? language === "EN"
      ? "Sponsored stores"
      : "Προωθούμενα καταστήματα"
    : language == "EN"
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
