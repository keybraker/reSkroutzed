import { DomClient } from '../../clients/dom/client';

export function createBuyMeCoffeeElement(): HTMLDivElement {
  const buyMeCoffeeElement = document.createElement('div');
  const buyMeCoffeeLink = document.createElement('a');

  buyMeCoffeeElement.classList.add('buy-me-coffee');

  buyMeCoffeeLink.href = 'https://paypal.me/tsiakkas';
  buyMeCoffeeLink.target = '_blank';
  buyMeCoffeeLink.rel = 'noopener noreferrer';
  buyMeCoffeeLink.title = 'Buy Me A Coffee';
  buyMeCoffeeLink.classList.add('buy-me-coffee-link');

  const coffeeLabel = document.createElement('span');
  coffeeLabel.classList.add('coffee-label');
  coffeeLabel.textContent = 'Buy me a coffee';

  const coffeeIcon = document.createElement('span');
  coffeeIcon.classList.add('coffee-icon');
  coffeeIcon.textContent = '☕';

  DomClient.appendElementToElement(coffeeLabel, buyMeCoffeeLink);
  DomClient.appendElementToElement(coffeeIcon, buyMeCoffeeLink);
  DomClient.appendElementToElement(buyMeCoffeeLink, buyMeCoffeeElement);

  return buyMeCoffeeElement;
}
