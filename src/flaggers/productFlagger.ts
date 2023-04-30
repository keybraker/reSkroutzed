import { Language } from "../enums/Language";
import { isSponsored, toggleVisibility, updateSponsoredText } from "../helpers/helpers";

export function productFlagger(visible: boolean, language: Language, sponsoredCount: number): void {
  updateSponsoredCount(sponsoredCount);

  const nonFlaggedProductListItems = document.querySelectorAll(
    "li:not(.flagged-product)"
  );

  if (nonFlaggedProductListItems?.length === 0) return;

  [...nonFlaggedProductListItems]
    .filter(hasSponsoredLabelText)
    .forEach(element => flagProductListItem(element, visible, language, sponsoredCount));
}

function updateSponsoredCount(sponsoredCount: number): void {
  const flaggedProductListItems =
    document.querySelectorAll("li.flagged-product");

  if (flaggedProductListItems?.length === 0) {
    sponsoredCount = 0;
  }
}

function hasSponsoredLabelText(listItem: Element): boolean {
  const labelTextElement = listItem.querySelector(".label-text");
  return !!labelTextElement && isSponsored(labelTextElement);
}

export function flagProductListItem(listItem: Element, visible: boolean, language: Language, sponsoredCount: number): void {
  sponsoredCount++;

  flagLabelElement(listItem, language);
  flagImageElement(listItem);

  listItem.classList.add("flagged-product");
  toggleVisibility(listItem, visible);
}

function flagLabelElement(listItem: Element, language: Language): void {
  const labelTextElement = listItem.querySelector(".label-text");

  if (!labelTextElement) {
    return;
  }

  if (isSponsored(labelTextElement)) {
    labelTextElement.classList.add("flagged-product-label");
    updateSponsoredText(labelTextElement, false, language);
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