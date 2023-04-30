function frequentlyBoughtTogetherFlagger() {
  const divElements = document.querySelectorAll(
    "div.fbt-content:not(.flagged-bought-together)"
  );

  [...divElements].forEach((div) => {
    const sponsoredSpan = div.querySelector("span.sp-tag");

    if (sponsoredSpan && sponsoredSpan.textContent === "Sponsored") {
      sponsoredCount++;
      flagSponsoredSpan(sponsoredSpan);
      div.classList.add("flagged-bought-together");
    }
  });
}

function flagSponsoredSpan(spanElement) {
  spanElement.classList.add("warning-label");
  updateSponsoredText(spanElement, false);
}
