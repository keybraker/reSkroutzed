function flagPromotedContent(visible) {
  const divElements = document.querySelectorAll("div.selected-product-cards");

  if (!divElements || divElements.length === 0) {
    return;
  }

  if (!visible) {
    divElements.forEach((divElement) => {
      visible
        ? divElement.classList.remove("display-none-sponsored-product")
        : divElement.classList.add("display-none-sponsored-product");
    });
    return;
  }

  divElements.forEach((divElement) => {
    divElement.classList.add("flagged-sponsored-product");

    const promotedBox = divElement.querySelector(".prices-shops-title");

    if (promotedBox) {
      promotedBox.innerHTML =
        language == "EN" ? "Sponsored stores" : "Προωθούμενα καταστήματα";
      promotedBox.classList.add("flagged-promoted-product-label");
    }
  });
}
