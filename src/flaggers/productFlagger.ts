import { isSponsored, toggleVisibility, updateSponsoredTextSingle } from "../helpers/helpers";
import { State } from "../types/State";

export function productFlagger(state: State): void {
  updateSponsoredCount(state);

  const nonFlaggedProductListItems = document.querySelectorAll(
    "li:not(.flagged-product)"
  );

  [...nonFlaggedProductListItems]
    .filter(hasSponsoredLabelText)
    .forEach(element => flagProductListItem(element, state));
}

function updateSponsoredCount(state: State): void {
  const flaggedProductLists =
    document.querySelectorAll("li.flagged-product");
  const flaggedProductDivs =
    document.querySelectorAll("div.flagged-bought-together");

  if (flaggedProductLists?.length === 0 && flaggedProductDivs?.length === 0) {
    state.sponsoredCount = 0;
  }
}

function hasSponsoredLabelText(listItem: Element): boolean {
  const labelTextElement = listItem.querySelector(".label-text");
  return !!labelTextElement && isSponsored(labelTextElement);
}

export function flagProductListItem(listItem: Element, state: State): void {
  state.sponsoredCount++;

  flagLabelElement(listItem, state);
  flagImageElement(listItem);

  listItem.classList.add("flagged-product");
  toggleVisibility(listItem, state);
}

function flagLabelElement(listItem: Element, state: State): void {
  const labelTextElement = listItem.querySelector(".label-text");

  if (labelTextElement && isSponsored(labelTextElement)) {
    labelTextElement.classList.add("flagged-product-label");
    updateSponsoredTextSingle(labelTextElement, state);
  }
}

function flagImageElement(listItem: Element): void {
  const imageLinkElement = listItem.querySelector("a.image");

  if (imageLinkElement) {
    imageLinkElement.classList.add("flagged-product-image");
  }
}