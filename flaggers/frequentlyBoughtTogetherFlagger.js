function frequentlyBoughtTogetherFlagger() {
  const topSpanTexts = document.querySelectorAll(
    "span:not(.flagged-bought-together)"
  );

  if (topSpanTexts.length === 0) {
    // sponsoredCount = 0;
  }

  [...topSpanTexts].filter(isSponsored).forEach((span) => {
    flagSponsoredSpanMulti(span);
    flagParentList(span);
  });

  const nonFlaggedListElements = document.querySelectorAll(
    "ul:not(.flagged-bought-together)"
  );

  if (!nonFlaggedListElements || nonFlaggedListElements.length === 0) {
    return;
  }

  processListElements(nonFlaggedListElements);
}

function processListElements(listElements) {
  [...listElements].forEach((listElement) => {
    const nonFlaggedSpanElements = listElement.querySelectorAll(
      "span:not(.flagged-bought-together)"
    );

    if (nonFlaggedSpanElements) {
      processSpanElements(nonFlaggedSpanElements, listElement);
    }
  });
}

function processSpanElements(spanElements, listElement) {
  [...spanElements].filter(isSponsored).forEach((spanElement) => {
    flagSponsoredSpan(spanElement);
    flagParentList(listElement);

    const sponsoredItems = listElement?.children[2]?.children[0]?.children;
    if (sponsoredItems) {
      [...sponsoredItems].forEach((sponsoredItem) =>
        flagProductListItem(sponsoredItem)
      );
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
