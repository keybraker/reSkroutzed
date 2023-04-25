function productFlagger() {
  const flaggedProductListItems =
    document.querySelectorAll("li.flagged-product");

  updateSponsoredCount(flaggedProductListItems);

  const nonFlaggedProductListItems = document.querySelectorAll(
    "li:not(.flagged-product)"
  );

  if (nonFlaggedProductListItems.length === 0) return;

  flagSponsoredListItems(nonFlaggedProductListItems);
}

function updateSponsoredCount(flaggedProductListItems) {
  if (flaggedProductListItems && flaggedProductListItems.length === 0) {
    sponsoredCount = 0;
  }
}

function flagSponsoredListItems(listItems) {
  Array.from(listItems)
    .filter(hasSponsoredLabelText)
    .forEach(flagProductListItem);
}

function hasSponsoredLabelText(listItem) {
  const labelTextElement = listItem.querySelector(".label-text");
  return labelTextElement && labelTextElement.textContent === "Sponsored";
}

function flagProductListItem(listItem) {
  sponsoredCount++;

  flagLabelElement(listItem);
  flagImageElement(listItem);

  listItem.classList.add("flagged-product");

  toggleVisibility(listItem);
}

function flagLabelElement(listItem) {
  const labelTextElement = listItem.querySelector(".label-text");

  if (labelTextElement && labelTextElement.textContent === "Sponsored") {
    labelTextElement.classList.add("flagged-product-label");
    updateSponsoredText(labelTextElement, false);
  }
}

function flagImageElement(listItem) {
  const imageLinkElement = listItem.querySelector("a.image");

  if (imageLinkElement) {
    imageLinkElement.classList.add("flagged-product-image");
  }
}
