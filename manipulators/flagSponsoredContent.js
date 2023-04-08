function flagSponsoredContent() {
  const liElements = document.querySelectorAll(
    "li:not(.flagged-sponsored-product)"
  );

  if (!liElements || liElements.length === 0) {
    return;
  }

  liElements.forEach((liElement) => {
    const labelElement = liElement.querySelector(".label-text");
    if (labelElement && labelElement.textContent === "Sponsored") {
      sponsoredCount++;

      liElement.classList.add("flagged-sponsored-product");
      labelElement.classList.add("flagged-sponsored-product-label");
      labelElement.innerHTML = language == "EN" ? "Sponsored store" : "Προωθούμενo κατάστημα";

      visible
        ? liElement.classList.remove("display-none-sponsored-product")
        : liElement.classList.add("display-none-sponsored-product");
    }
  });
}
