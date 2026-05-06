import { DomClient } from '../../clients/dom/client';

export function createBuyMeCoffeeElement(): HTMLDivElement {
  const buyMeCoffeeElement = document.createElement('div');
  buyMeCoffeeElement.classList.add('buy-me-coffee');

  const triggerButton = document.createElement('button');
  triggerButton.classList.add('buy-me-coffee-link');
  triggerButton.title = 'Buy Me A Coffee';
  triggerButton.type = 'button';

  const coffeeLabel = document.createElement('span');
  coffeeLabel.classList.add('coffee-label');
  coffeeLabel.textContent = 'Buy me a coffee';

  const coffeeIcon = document.createElement('span');
  coffeeIcon.classList.add('coffee-icon');
  coffeeIcon.textContent = '☕';

  DomClient.appendElementToElement(coffeeLabel, triggerButton);
  DomClient.appendElementToElement(coffeeIcon, triggerButton);

  // Create modal popup
  const modal = document.createElement('div');
  modal.classList.add('buy-me-coffee-modal');

  const modalContent = document.createElement('div');
  modalContent.classList.add('buy-me-coffee-modal-content');

  const modalTitle = document.createElement('h3');
  modalTitle.textContent = 'Buy me a coffee';
  DomClient.appendElementToElement(modalTitle, modalContent);

  const optionsContainer = document.createElement('div');
  optionsContainer.classList.add('buy-me-coffee-options');

  // PayPal option
  const paypalLink = document.createElement('a');
  paypalLink.href = 'https://paypal.me/tsiakkas';
  paypalLink.target = '_blank';
  paypalLink.rel = 'noopener noreferrer';
  paypalLink.classList.add('buy-me-coffee-option', 'paypal');
  paypalLink.textContent = 'PayPal';

  // Revolut option
  const revolutLink = document.createElement('a');
  revolutLink.href = 'https://revolut.me/keybraker';
  revolutLink.target = '_blank';
  revolutLink.rel = 'noopener noreferrer';
  revolutLink.classList.add('buy-me-coffee-option', 'revolut');
  revolutLink.textContent = 'Revolut';

  DomClient.appendElementToElement(paypalLink, optionsContainer);
  DomClient.appendElementToElement(revolutLink, optionsContainer);
  DomClient.appendElementToElement(optionsContainer, modalContent);

  const closeButton = document.createElement('button');
  closeButton.classList.add('buy-me-coffee-close');
  closeButton.type = 'button';
  closeButton.textContent = '✕';

  DomClient.appendElementToElement(closeButton, modalContent);
  DomClient.appendElementToElement(modalContent, modal);

  // Event listeners
  triggerButton.addEventListener('click', () => {
    modal.classList.add('active');
  });

  closeButton.addEventListener('click', () => {
    modal.classList.remove('active');
  });

  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.classList.remove('active');
    }
  });

  DomClient.appendElementToElement(triggerButton, buyMeCoffeeElement);
  DomClient.appendElementToElement(modal, buyMeCoffeeElement);

  return buyMeCoffeeElement;
}
