function removeSponsoredContent(visible) {
  const liElements = document.querySelectorAll("li.flagged-sponsored-product");

  if (!liElements || liElements.length === 0) {
    return;
  }

  liElements.forEach((liElement) => {
    visible
      ? liElement.classList.remove("display-none-sponsored-product")
      : liElement.classList.add("display-none-sponsored-product");
  });
}
