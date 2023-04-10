function removeSponsoredContent(visible) {
  const liElements = document.querySelectorAll("li.sponsored-flagged-product");

  if (!liElements || liElements.length === 0) {
    return;
  }

  liElements.forEach((liElement) => {
    visible
      ? liElement.classList.remove("display-none")
      : liElement.classList.add("display-none");
  });
}
