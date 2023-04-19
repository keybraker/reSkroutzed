function buyThroughSkroutzIndicator(visible) {
  const divElements = document.querySelectorAll("div.offering-heading");

  if (!divElements || divElements.length === 0) {
    return;
  }

  divElements.forEach((divElement) => {
    const priceIndication = document.createElement("div");
    priceIndication.innerHTML =
      language == "EN"
        ? "( might not be the lowest price )"
        : "( μπορεί να μην είναι η χαμηλότερη τιμή )";

    divElement.insertBefore(
      priceIndication,
      divElement.children[0].previousSibling
    );
  });
}
