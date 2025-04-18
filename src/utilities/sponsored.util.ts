import { Language } from '../enums/Language.enum';
import { State } from '../types/State.type';

export function toggleVisibility(element: Element, state: State) {
  state.hideProductAds
    ? element.classList.remove('display-none')
    : element.classList.add('display-none');
}

export function getSponsoredText(isPlural = false, language: Language) {
  return isPlural
    ? language === Language.ENGLISH
      ? 'Sponsored Stores'
      : 'Προωθούμενα Καταστήματα'
    : language === Language.ENGLISH
      ? 'Sponsored Store'
      : 'Προωθούμενo Κατάστημα';
}

export function updateSponsoredTextPlural(element: Element, language: Language) {
  if (isSponsored(element)) {
    element.classList.add('sponsored-label');
    element.textContent = getSponsoredText(true, language);
    return;
  }

  const labelTextElement = element.querySelector('.label-text');

  if (labelTextElement) {
    labelTextElement.classList.add('sponsored-label');
    labelTextElement.textContent = getSponsoredText(true, language);
  }
}

export function updateSponsoredTextSingle(element: Element, language: Language) {
  if (isSponsored(element)) {
    element.classList.add('sponsored-label');
    element.textContent = getSponsoredText(false, language);
    return;
  }

  const labelTextElement = element.querySelector('.label-text');

  if (labelTextElement) {
    labelTextElement.classList.add('sponsored-label');
    labelTextElement.textContent = getSponsoredText(false, language);
  }
}

export function isSponsored(element: Element | null): boolean {
  if (!element || !element.textContent) {
    return false;
  }

  const sponsoredTexts = [
    'Επιλεγμένο κατάστημα',
    'Eπιλεγμένο κατάστημα',
    'Selected shop',
    'Επιλεγμένα καταστήματα',
    'Eπιλεγμένα καταστήματα',
    'Selected shops',
    'Sponsored',
    'Sponsored Store',
    'Ad',
    'Advertisement',
    'Advertisement',
  ];

  return sponsoredTexts.includes(element.textContent.trim());
}
