function productFlagger() {
  const liElementsFlagged = document.querySelectorAll("li.flagged-product");

  if (liElementsFlagged && liElementsFlagged.length === 0) {
    sponsoredCount = 0;
  }

  //

  const liElements = document.querySelectorAll("li:not(.flagged-product)");

  if (!liElements || liElements.length === 0) {
    return;
  }

  Array.from(liElements)
    .filter((liElement) => {
      const labelElement = liElement.querySelector(".label-text");
      return labelElement && labelElement.textContent === "Sponsored";
    })
    .forEach((liElement) => flagProductElement(liElement));
}

function flagProductElement(element) {
  sponsoredCount++;

  const labelElement = element.querySelector(".label-text");
  if (labelElement && labelElement.textContent === "Sponsored") {
    labelElement.classList.add("flagged-product-label");
    labelElement.innerHTML =
      language == "EN" ? "Sponsored store" : "Προωθούμενo κατάστημα";
  }

  // const shopCountElement = element.querySelector(".shop-count");
  // if (shopCountElement) {
  //   shopCountElement.classList.add("flagged-product-store");
  // }

  element.classList.add("flagged-product");

  visible
    ? element.classList.remove("display-none")
    : element.classList.add("display-none");
}
