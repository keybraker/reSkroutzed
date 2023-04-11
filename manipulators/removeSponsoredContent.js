function removeSponsoredContent(visible) {
  removeSponsoredProduct(visible);
  removeSponsoredShelf(visible);
  removeSponsoredList(visible);
}

function removeSponsoredProduct(visible) {
  const liElementsFlagged = document.querySelectorAll("li.flagged-product");

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
  const divElementsFlagged = document.querySelectorAll("div.flagged-shelf");

  if (!divElementsFlagged || divElementsFlagged.length === 0) {
    return;
  }

  divElementsFlagged.forEach((divElementFlagged) => {
    visible
      ? divElementFlagged.classList.remove("display-none")
      : divElementFlagged.classList.add("display-none");
  });
}

function removeSponsoredList(visible) {
  const divElementsSponsoredList = document.querySelectorAll(
    "div.selected-product-cards"
  );

  if (!divElementsSponsoredList || divElementsSponsoredList.length === 0) {
    return;
  }

  divElementsSponsoredList.forEach((divElementFlagged) => {
    visible
      ? divElementFlagged.classList.remove("display-none")
      : divElementFlagged.classList.add("display-none");
  });
}
