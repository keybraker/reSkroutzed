function toggleSponsoredContentVisibility(visible) {
  toggleSponsoredProductsVisibility(visible);
  toggleSponsoredShelfVisibility(visible);
  toggleSponsoredListVisibility(visible);
}

function toggleSponsoredProductsVisibility(visible) {
  const flaggedProductListItems =
    document.querySelectorAll("li.flagged-product");

  if (!flaggedProductListItems || flaggedProductListItems.length === 0) {
    return;
  }

  updateVisibilityForElements(flaggedProductListItems, visible);
}

function toggleSponsoredShelfVisibility(visible) {
  const flaggedShelfDivElements =
    document.querySelectorAll("div.flagged-shelf");

  if (!flaggedShelfDivElements || flaggedShelfDivElements.length === 0) {
    return;
  }

  updateVisibilityForElements(flaggedShelfDivElements, visible);
}

function toggleSponsoredListVisibility(visible) {
  const selectedProductCards = document.querySelectorAll(
    "div.selected-product-cards"
  );

  if (!selectedProductCards || selectedProductCards.length === 0) {
    return;
  }

  updateVisibilityForElements(selectedProductCards, visible);
}

function updateVisibilityForElements(elements, visible) {
  elements.forEach((element) => toggleVisibility(element));
}
