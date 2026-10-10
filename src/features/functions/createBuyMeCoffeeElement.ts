import { DomClient } from '../../clients/dom/client';
import { Language } from '../../common/enums/Language.enum';

const SUPPORT_URL = 'https://itsiakkas.com/support';

export function createBuyMeCoffeeElement(language: Language): HTMLDivElement {
  const buyMeCoffeeElement = document.createElement('div');
  buyMeCoffeeElement.classList.add('buy-me-coffee');

  const supportLink = document.createElement('a');
  supportLink.href = SUPPORT_URL;
  supportLink.target = '_blank';
  supportLink.rel = 'noopener noreferrer';
  supportLink.classList.add('buy-me-coffee-link');

  const coffeeLabel = document.createElement('span');
  coffeeLabel.classList.add('coffee-label');
  coffeeLabel.textContent = language === Language.GREEK ? 'Υποστήριξε με' : 'Support me';

  DomClient.appendElementToElement(coffeeLabel, supportLink);
  DomClient.appendElementToElement(supportLink, buyMeCoffeeElement);

  return buyMeCoffeeElement;
}
