function removeSponsoredContent(visible) {
  removeSponsoredProduct(visible);
  removeSponsoredShelf(visible);
}

function removeSponsoredProduct(visible) {
  const liElementsFlagged = document.querySelectorAll(
    "li.sponsored-flagged-product"
  );

  if (!liElementsFlagged || liElementsFlagged.length === 0) {
    return;
  }

  liElementsFlagged.forEach((liElementFlagged) => {
    visible
      ? liElementFlagged.classList.remove("display-none")
      : liElementFlagged.classList.add("display-none");
  });
}

function removeSponsoredShelf(visible) {
  const divElementsFlagged = document.querySelectorAll(
    "div.sponsored-flagged-shelf"
  );

  if (!divElementsFlagged || divElementsFlagged.length === 0) {
    return;
  }

  divElementsFlagged.forEach((divElementFlagged) => {
    visible
      ? divElementFlagged.classList.remove("display-none")
      : divElementFlagged.classList.add("display-none");
  });
}
