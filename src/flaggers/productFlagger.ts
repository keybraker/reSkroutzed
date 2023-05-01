import { Language } from "../enums/Language";
import { State } from "../types/State";
import { isSponsored, toggleVisibility, updateSponsoredText } from "../helpers/helpers";

export function productFlagger(state: State): void {
  updateSponsoredCount(state);

  const nonFlaggedProductListItems = document.querySelectorAll(
    "li:not(.flagged-product)"
  );

  if (nonFlaggedProductListItems?.length === 0) return;

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

  if (!labelTextElement) {
    return;
  }

  if (isSponsored(labelTextElement)) {
    labelTextElement.classList.add("flagged-product-label");
    updateSponsoredText(labelTextElement, false, state);
  }
}

function flagImageElement(listItem: Element): void {
  const imageLinkElement = listItem.querySelector(
    "a.image"
  );

  if (imageLinkElement) {
    imageLinkElement.classList.add("flagged-product-image");
  }
}