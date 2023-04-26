function frequentlyBoughtTogetherFlagger() {
  const divElements = document.querySelectorAll(
    "div.fbt-content:not(.flagged-bought-together)"
  );

  [...divElements].forEach((div) => {
    const sponsoredSpan = div.querySelector("span.sp-tag");

    if (sponsoredSpan && sponsoredSpan.textContent === "Sponsored") {
      flagSponsoredSpanMulti(sponsoredSpan);
      div.classList.add("flagged-bought-together");
    }
  });
}

function flagSponsoredSpanMulti(spanElement) {
  spanElement.classList.add("flagged-bought-together-label");
  updateSponsoredText(spanElement, true);
}
