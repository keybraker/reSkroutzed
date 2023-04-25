function createPriceIndicationElement() {
  const priceIndication = document.createElement("div");
  const text =
    language === "EN"
      ? "( might not be the lowest price )"
      : "( μπορεί να μην είναι η χαμηλότερη τιμή )";
  priceIndication.innerHTML = text;
  return priceIndication;
}

function insertPriceIndication(divElement) {
  const priceIndication = createPriceIndicationElement();
  const referenceElement = divElement.children[0].previousSibling;
  divElement.insertBefore(priceIndication, referenceElement);
}

function buyThroughSkroutzIndicator() {
  const divElements = document.querySelectorAll("div.offering-heading");

  if (!divElements || divElements.length === 0) {
    return;
  }

  divElements.forEach(insertPriceIndication);
}
