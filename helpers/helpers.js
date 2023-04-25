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
