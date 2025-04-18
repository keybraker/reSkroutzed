import { State } from '../common/types/State.type';
import { toggleVisibility } from '../utilities/sponsored.util';

function toggleVisibilityByClass(selector: string, state: State) {
  const elements = document.querySelectorAll(selector);
  elements?.forEach((element) => toggleVisibility(element, state));
}

export function toggleContentVisibility(state: State) {
  toggleVisibilityByClass('li.flagged-product', state);
  toggleVisibilityByClass('div.flagged-shelf', state);
  toggleVisibilityByClass('div.selected-product-cards', state);
  toggleVisibilityByClass('div.flagged-bought-together', state);
  toggleVisibilityByClass('div.flagged-sponsorship', state);
}
