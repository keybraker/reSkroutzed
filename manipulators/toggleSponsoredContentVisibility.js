function toggleSponsoredContentVisibility() {
  toggleVisibilityBySelector("li.flagged-product");
  toggleVisibilityBySelector("div.flagged-shelf");
  toggleVisibilityBySelector("div.selected-product-cards");
}

function toggleVisibilityBySelector(selector) {
  const elements = document.querySelectorAll(selector);
  elements?.forEach(toggleVisibility);
}
