import { DomClient } from '../clients/dom/client';
import { State } from '../common/types/State.type';

function toggleVisibilityByClass(selector: string, state: State) {
  const elements = document.querySelectorAll(selector);
  elements?.forEach((element) => DomClient.toggleElementVisibility(element, state));
}

export function toggleContentVisibility(state: State) {
  toggleVisibilityByClass('li.flagged-product', state);
  toggleVisibilityByClass('div.flagged-shelf', state);
  toggleVisibilityByClass('div.selected-product-cards', state);
  toggleVisibilityByClass('div.flagged-bought-together', state);
  toggleVisibilityByClass('div.flagged-sponsorship', state);
}
