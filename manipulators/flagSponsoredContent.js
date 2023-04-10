function flagSponsoredContent() {
  const liElementsFlagged = document.querySelectorAll(
    "li.flagged-product"
  );

  if (liElementsFlagged && liElementsFlagged.length === 0) {
    sponsoredCount = 0;
  }

  //

  const liElements = document.querySelectorAll(
    "li:not(.flagged-product)"
  );

  if (!liElements || liElements.length === 0) {
    return;
  }

  liElements.forEach((liElement) => {
    const labelElement = liElement.querySelector(".label-text");
    if (labelElement && labelElement.textContent === "Sponsored") {
      sponsoredCount++;

      const shopCountElement = liElement.querySelector(".shop-count");
      if (shopCountElement) {
        shopCountElement.classList.add("flagged-product-store");
      }

      liElement.classList.add("flagged-product");
      labelElement.classList.add("flagged-product-label");

      labelElement.innerHTML =
        language == "EN" ? "Sponsored store" : "Προωθούμενo κατάστημα";

      visible
        ? liElement.classList.remove("display-none")
        : liElement.classList.add("display-none");
    }
  });
}
