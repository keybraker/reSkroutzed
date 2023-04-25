function frequentlyBoughtTogetherFlagger() {
  const topSpanTexts = document.querySelectorAll(
    "span:not(.flagged-bought-together)"
  );

  if (topSpanTexts && topSpanTexts.length === 0) {
    // sponsoredCount = 0;
  }

  Array.from(topSpanTexts)
    .filter((span) => {
      return span && span.textContent === "Sponsored";
    })
    .forEach((span) => {
      flagSponsoredSpanMulti(span);
      flagParentList(span);
    });

  //

  const flaggedListElements = document.querySelectorAll(
    "ul.flagged-bought-together"
  );

  if (flaggedListElements && flaggedListElements.length === 0) {
    // sponsoredCount = 0;
  }

  const nonFlaggedListElements = document.querySelectorAll(
    "ul:not(.flagged-bought-together)"
  );

  if (!nonFlaggedListElements || nonFlaggedListElements.length === 0) {
    return;
  }

  processListElements(nonFlaggedListElements);
}

function processListElements(listElements) {
  Array.from(listElements).forEach((listElement) => {
    const nonFlaggedSpanElements = listElement.querySelectorAll(
      "span:not(.flagged-bought-together)"
    );

    if (nonFlaggedSpanElements) {
      processSpanElements(nonFlaggedSpanElements, listElement);
    }
  });
}

function processSpanElements(spanElements, listElement) {
  Array.from(spanElements).forEach((spanElement) => {
    if (spanElement && spanElement.textContent === "Sponsored") {
      // sponsoredCount++;

      flagSponsoredSpan(spanElement);
      flagParentList(listElement);

      const sponsoredItems = listElement?.children[2]?.children[0]?.children;
      if (sponsoredItems) {
        Array.from(sponsoredItems).forEach((sponsoredItem) =>
          flagProductListItem(sponsoredItem)
        );
      }
    }
  });
}

function flagSponsoredSpan(spanElement) {
  spanElement.classList.add("flagged-bought-together-label");
  updateSponsoredText(spanElement, false);
}

function flagSponsoredSpanMulti(spanElement) {
  spanElement.classList.add("flagged-bought-together-label");
  updateSponsoredText(spanElement, false);
}

function flagParentList(element) {
  const parentDiv = element.parentDiv;
  if (parentDiv) {
    parentDiv.classList.add("flagged-bought-together");
    toggleVisibility(parentDiv);
  }
}
