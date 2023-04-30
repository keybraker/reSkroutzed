import { State } from "../enums/State";
import { updateSponsoredText } from "../helpers/helpers";

export function frequentlyBoughtTogetherFlagger(state: State): void {
  const divElements = document.querySelectorAll(
    "div.fbt-content:not(.flagged-bought-together)"
  );

  [...divElements].forEach((div: Element) => {
    const sponsoredSpan = div.querySelector("span.sp-tag");

    if (sponsoredSpan && sponsoredSpan.textContent === "Sponsored") {
      state.sponsoredCount++;
      flagSponsoredSpan(sponsoredSpan, state);
      div.classList.add("flagged-bought-together");
    }
  });
}

function flagSponsoredSpan(spanElement: Element, state: State): void {
  spanElement.classList.add("warning-label");
  updateSponsoredText(spanElement, false, state);
}