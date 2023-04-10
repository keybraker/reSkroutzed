function flagSponsoredContent() {
  const liElementsFlagged = document.querySelectorAll(
    "li.sponsored-flagged-product"
  );

  if (liElementsFlagged.length === 0) {
    sponsoredCount = 0;
  }

  //

  const liElements = document.querySelectorAll(
    "li:not(.sponsored-flagged-product)"
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
        shopCountElement.classList.add("sponsored-flagged-store");
      }

      liElement.classList.add("sponsored-flagged-product");
      labelElement.classList.add("sponsored-flagged-product-label");

      labelElement.innerHTML =
        language == "EN" ? "Sponsored store" : "Προωθούμενo κατάστημα";

      visible
        ? liElement.classList.remove("display-none")
        : liElement.classList.add("display-none");
    }
  });
}
