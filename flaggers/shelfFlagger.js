function updateShelfCountAndVisibility(h4Element) {
  sponsoredShelfCount++;

  h4Element.classList.add("flagged-shelf-label");
  updateSponsoredText(h4Element, true);

  const h4ParentElement = h4Element.parentElement;
  if (h4ParentElement) {
    h4ParentElement.classList.add("flagged-shelf");

    const displayClass = "display-none";
    visible
      ? h4ParentElement.classList.remove(displayClass)
      : h4ParentElement.classList.add(displayClass);

    const sponsoredItems = h4ParentElement?.children[2]?.children[0]?.children;

    if (sponsoredItems) {
      [...sponsoredItems].forEach(flagProductListItem);
    }
  }
}

function flagSponsoredShelves(h4Elements) {
  const sponsoredShelves = [...h4Elements].filter((h4Element) => {
    return h4Element && h4Element.textContent === "Sponsored";
  });

  sponsoredShelves.forEach(updateShelfCountAndVisibility);
}

function shelfFlagger() {
  const h4ElementsFlagged = document.querySelectorAll("h4.flagged-shelf");

  sponsoredShelfCount =
    h4ElementsFlagged && h4ElementsFlagged.length
      ? h4ElementsFlagged.length
      : 0;

  const h4Elements = document.querySelectorAll("h4:not(.flagged-shelf)");

  if (!h4Elements || h4Elements.length === 0) {
    return;
  }

  flagSponsoredShelves(h4Elements);
}
