import { toggleVisibility } from "../helpers/helpers";

export function toggleSponsoredContentVisibility(visible: boolean) {
  toggleVisibilityBySelector("li.flagged-product", visible);
  toggleVisibilityBySelector("div.flagged-shelf", visible);
  toggleVisibilityBySelector("div.selected-product-cards", visible);
  toggleVisibilityBySelector("div.flagged-bought-together", visible);
}

function toggleVisibilityBySelector(selector: string, visible: boolean) {
  const elements = document.querySelectorAll(selector);
  elements?.forEach(element => toggleVisibility(element, visible));
}
