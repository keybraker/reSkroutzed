function removeSponsoredContent(visible) {
  const liElements = document.querySelectorAll("li.flagged-sponsored-product");

  if (!liElements || liElements.length === 0) {
    return;
  }

  liElements.forEach((liElement) => {
    const labelElement = liElement.querySelector(".label-text");
    if (labelElement && labelElement.textContent === "Sponsored") {
      visible
        ? liElement.classList.remove("display-none-sponsored-product")
        : liElement.classList.add("display-none-sponsored-product");
    }
  });
}
