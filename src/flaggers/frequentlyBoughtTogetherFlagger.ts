import { Language } from "../enums/Language";
import { updateSponsoredText } from "../helpers/helpers";

export function frequentlyBoughtTogetherFlagger(language: Language, sponsoredCount: number): void {
  const divElements = document.querySelectorAll(
    "div.fbt-content:not(.flagged-bought-together)"
  );

  [...divElements].forEach((div: Element) => {
    const sponsoredSpan = div.querySelector("span.sp-tag");

    if (sponsoredSpan && sponsoredSpan.textContent === "Sponsored") {
      sponsoredCount++;
      flagSponsoredSpan(sponsoredSpan, language);
      div.classList.add("flagged-bought-together");
    }
  });
}

function flagSponsoredSpan(spanElement: Element, language: Language): void {
  spanElement.classList.add("warning-label");
  updateSponsoredText(spanElement, false, language);
}