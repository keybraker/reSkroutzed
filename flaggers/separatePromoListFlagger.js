function separatePromoListFlagger() {
  const selectedProductCards = document.querySelectorAll(
    "div.selected-product-cards"
  );

  processSelectedProductCards(selectedProductCards);
}

function processSelectedProductCards(selectedProductCards) {
  selectedProductCards.forEach((card) => {
    const promotedBox = card.querySelector("h2:not(.flagged-list-title)");

    if (
      promotedBox?.textContent &&
      (promotedBox.textContent === "Επιλεγμένο κατάστημα" ||
        promotedBox.textContent === "Selected shop" ||
        promotedBox.textContent === "Επιλεγμένα καταστήματα" ||
        promotedBox.textContent === "Selected shops")
    ) {
      flagPromotedBox(promotedBox);
    }
  });
}

function flagPromotedBox(promotedBox) {
  promotedBox.classList.add("flagged-list-title");
  promotedBox.innerHTML =
    language == "EN" ? "Sponsored stores" : "Προωθούμενα καταστήματα";

  visible
    ? promotedBox.classList.remove("display-none")
    : promotedBox.classList.add("display-none");
}
