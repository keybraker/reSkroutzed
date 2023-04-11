function separatePromoListFlagger(visible) {
  const divElements = document.querySelectorAll("div.selected-product-cards");

  if (!divElements || divElements.length === 0) {
    return;
  }

  if (!visible) {
    divElements.forEach((divElement) => {
      visible
        ? divElement.classList.remove("display-none")
        : divElement.classList.add("display-none");
    });
    return;
  }

  divElements.forEach((divElement) => {
    // divElement.classList.add("flagged-product");

    const promotedBox = divElement.querySelector(".prices-shops-title");

    if (promotedBox) {
      promotedBox.classList.add("flagged-list-title");
      promotedBox.innerHTML =
        language == "EN" ? "Sponsored stores" : "Προωθούμενα καταστήματα";
    }
  });
}
