function frequentlyBoughtTogetherFlagger() {
  const divElementsFlagged = document.querySelectorAll(
    "div.flagged-bought-together"
  );

  if (divElementsFlagged && divElementsFlagged.length === 0) {
    // sponsoredCount = 0;
  }

  //

  const divElements = document.querySelectorAll(
    "div:not(.flagged-bought-together)"
  );

  if (!divElements || divElements.length === 0) {
    return;
  }

  divLooper(divElements);
}

function divLooper(divElements) {
  Array.from(divElements).forEach((divElement) => {
    const spanElements = document.querySelectorAll(
      "span:not(.flagged-bought-together)"
    );

    if (spanElements) {
      spanLooper(spanElements, divElement);
    }
  });
}

function spanLooper(spanElements, divElement) {
  Array.from(spanElements).forEach((spanElement) => {
    if (spanElement && spanElement.textContent === "Sponsored") {
      // sponsoredCount++;

      spanElement.classList.add("flagged-bought-together-label");

      spanElement.innerHTML =
        language == "EN" ? "Sponsored store" : "Προωθούμενo κατάστημα";

      const divParentElement = divElement;
      divParentElement.classList.add("flagged-bought-together");

      visible
        ? divParentElement.parentElement.classList.remove("display-none")
        : divParentElement.parentElement.classList.add("display-none");

      const sponsoredItems =
        divParentElement?.children[2]?.children[0]?.children;

      if (sponsoredItems) {
        Array.from(sponsoredItems).forEach((sponsoredItem) =>
          flagProductElement(sponsoredItem)
        );
      }
    }
  });
}
