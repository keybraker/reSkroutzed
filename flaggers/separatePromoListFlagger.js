function separatePromoListFlagger(visible) {
  const selectedProductCards = document.querySelectorAll("div.selected-product-cards");

  if (!selectedProductCards || selectedProductCards.length === 0) {
    return;
  }

  if (!visible) {
    toggleDisplayForSelectedProductCards(selectedProductCards, visible);
    return;
  }

  processSelectedProductCards(selectedProductCards);
}

function toggleDisplayForSelectedProductCards(selectedProductCards, visible) {
  selectedProductCards.forEach((card) => {
    visible
      ? card.classList.remove("display-none")
      : card.classList.add("display-none");
  });
}

function processSelectedProductCards(selectedProductCards) {
  selectedProductCards.forEach((card) => {
    const promotedBox = card.querySelector(".prices-shops-title");

    if (promotedBox) {
      flagPromotedBox(promotedBox);
    }
  });
}

function flagPromotedBox(promotedBox) {
  promotedBox.classList.add("flagged-list-title");
  promotedBox.innerHTML =
    language == "EN" ? "Sponsored stores" : "Προωθούμενα καταστήματα";
}

