function toggleVisibility(element) {
  visible
    ? element.classList.remove("display-none")
    : element.classList.add("display-none");
}

function updateSponsoredText(element, isPlural = false) {
  element.innerHTML = isPlural
    ? language === "EN"
      ? "Sponsored stores"
      : "Προωθούμενα καταστήματα"
    : language == "EN"
    ? "Sponsored store"
    : "Προωθούμενo κατάστημα";
}

function isSponsored(element) {
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
