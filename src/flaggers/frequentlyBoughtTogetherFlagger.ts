import { State } from "../types/State";
import { isSponsored, updateSponsoredTextSingle } from "../helpers/helpers";

export function frequentlyBoughtTogetherFlagger(state: State): void {
  const divElements = getDivElements();

  divElements.forEach((div: Element) => {
    const sponsoredSpan = getSponsoredSpan(div);

    if (sponsoredSpan) {
      state.sponsoredCount++;
      flagSponsoredSpan(sponsoredSpan, state);
      markAsFlagged(div);
    }
  });
}

function getDivElements(): Element[] {
  const divElements = document.querySelectorAll(
    "div.fbt-content:not(.flagged-bought-together)"
  );
  return [...divElements];
}

function getSponsoredSpan(div: Element): Element | null {
  const sponsoredSpan = div.querySelector("span.sp-tag");
  return isSponsored(sponsoredSpan) ? sponsoredSpan : null;
}

function flagSponsoredSpan(spanElement: Element, state: State): void {
  spanElement.classList.add("sponsored-label");
  updateSponsoredTextSingle(spanElement, state);
}

function markAsFlagged(div: Element): void {
  div.classList.add("flagged-bought-together");
}
