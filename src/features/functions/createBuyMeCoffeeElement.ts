import { DomClient } from '../../clients/dom/client';

export function createBuyMeCoffeeElement(): HTMLDivElement {
  const buyMeCoffeeElement = document.createElement('div');
  const buyMeCoffeeLink = document.createElement('a');

  buyMeCoffeeElement.classList.add('reskroutzed-tag', 'buy-me-coffee');

  buyMeCoffeeLink.href = 'https://paypal.me/tsiakkas';
  buyMeCoffeeLink.target = '_blank';
  buyMeCoffeeLink.rel = 'noopener noreferrer';
  buyMeCoffeeLink.title = 'Buy Me A Coffee';

  const coffeeIcon = document.createElement('span');
  coffeeIcon.classList.add('coffee-icon');
  coffeeIcon.innerHTML = '☕'; // Coffee cup emoji

  DomClient.appendElementToElement(coffeeIcon, buyMeCoffeeLink);
  DomClient.appendElementToElement(buyMeCoffeeLink, buyMeCoffeeElement);

  return buyMeCoffeeElement;
}
