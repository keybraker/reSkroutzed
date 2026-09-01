import { BrowserClient } from '../../clients/browser/client';
import { DomClient } from '../../clients/dom/client';
import { Language } from '../../common/enums/Language.enum';
import { getTranslation } from '../../common/functions/translations';
import { updatePriceDifferenceValue } from './updatePriceDifferenceValue';
import { ToggleButtonContext } from './toggleButtonContext';

export function createPriceDifferenceOption(ctx: ToggleButtonContext): HTMLButtonElement {
  const { state } = ctx;
  const button = document.createElement('button');
  button.classList.add('toggle-option-button', 'price-difference-option');

  const titleText =
    state.language === Language.GREEK
      ? `Ελάχιστη ποσοστιαία διαφορά: ${state.minimumPriceDifference}%`
      : `Minimum Percentage Difference: ${state.minimumPriceDifference}%`;
  button.title = titleText;

  button.setAttribute('data-value', state.minimumPriceDifference.toString());

  let isMobile = false;
  try {
    isMobile = BrowserClient.detectMobile();
  } catch (error) {
    console.warn('Failed to detect mobile status:', error);
  }

  if (isMobile) {
    const mobileContainer = document.createElement('div');
    mobileContainer.classList.add('price-difference-mobile-container');
    mobileContainer.style.display = 'flex';
    mobileContainer.style.alignItems = 'center';
    mobileContainer.style.justifyContent = 'center';
    mobileContainer.style.width = '100%';
    mobileContainer.style.height = '100%';

    const valueText = document.createElement('span');
    valueText.classList.add('price-value-mobile');
    valueText.textContent = state.minimumPriceDifference.toString();
    valueText.style.fontSize = '14px';
    valueText.style.fontWeight = 'bold';
    DomClient.appendElementToElement(valueText, mobileContainer);

    const percentSymbol = document.createElement('span');
    percentSymbol.classList.add('price-currency-symbol-mobile');
    percentSymbol.textContent = '%';
    percentSymbol.style.marginLeft = '2px';
    percentSymbol.style.fontSize = '14px';
    percentSymbol.style.fontWeight = 'bold';
    DomClient.appendElementToElement(percentSymbol, mobileContainer);

    DomClient.appendElementToElement(mobileContainer, button);
  } else {
    const flexContainer = document.createElement('div');
    flexContainer.classList.add('price-difference-container');
    flexContainer.style.display = 'flex';
    flexContainer.style.alignItems = 'center';
    flexContainer.style.justifyContent = 'center';
    flexContainer.style.width = '100%';
    flexContainer.style.height = '100%';

    const valueDisplay = document.createElement('span');
    valueDisplay.classList.add('price-value-display');
    valueDisplay.textContent = state.minimumPriceDifference.toString();
    DomClient.appendElementToElement(valueDisplay, flexContainer);

    const percentSymbol = document.createElement('span');
    percentSymbol.classList.add('price-currency-symbol');
    percentSymbol.textContent = '%';
    percentSymbol.style.marginLeft = '2px';
    DomClient.appendElementToElement(percentSymbol, flexContainer);

    DomClient.appendElementToElement(flexContainer, button);
  }

  button.addEventListener('click', (e) => {
    e.stopPropagation();

    if (isMobile) {
      const inputValue = prompt(
        getTranslation(state.language, 'minimumPriceDifferencePrompt'),
        state.minimumPriceDifference.toString(),
      );

      if (inputValue !== null) {
        const newValue = parseFloat(inputValue);
        if (!isNaN(newValue) && newValue >= 0) {
          updatePriceDifferenceValue(state, newValue, button);
        }
      }
    } else {
      const container = button.querySelector('.price-difference-container');
      if (!container) return;

      const valueDisplay = container.querySelector('.price-value-display') as HTMLElement;
      const percentSymbol = container.querySelector('.price-currency-symbol') as HTMLElement;
      if (valueDisplay && percentSymbol) {
        valueDisplay.style.display = 'none';
        percentSymbol.style.display = 'none';
      }

      const input = document.createElement('input');
      input.type = 'number';
      input.min = '0';
      input.step = '0.1';
      input.value = state.minimumPriceDifference.toString();
      input.classList.add('price-inline-input');
      input.style.width = '70%';
      input.style.height = '60%';
      input.style.textAlign = 'center';
      input.style.padding = '0px';
      input.style.border = '1px solid white';
      input.style.borderRadius = '2px';
      input.style.background = 'rgba(255, 255, 255, 0.2)';
      input.style.color = 'white';
      input.style.font = 'inherit';
      input.style.fontSize = '16px';
      input.style.fontWeight = 'bold';

      DomClient.appendElementToElement(input, container);
      input.focus();
      input.select();

      const saveValue = (): void => {
        const newValue = parseFloat(input.value);
        if (!isNaN(newValue) && newValue >= 0) {
          updatePriceDifferenceValue(state, newValue, button);
        }

        if (valueDisplay && percentSymbol) {
          valueDisplay.style.display = '';
          percentSymbol.style.display = '';
        }

        if (input.parentNode) {
          input.parentNode.removeChild(input);
        }
      };

      input.addEventListener('blur', saveValue);

      input.addEventListener('keyup', (event) => {
        if (event.key === 'Enter') {
          saveValue();
        } else if (event.key === 'Escape') {
          if (valueDisplay && percentSymbol) {
            valueDisplay.style.display = '';
            percentSymbol.style.display = '';
          }
          if (input.parentNode) {
            input.parentNode.removeChild(input);
          }
        }
      });
    }
  });

  return button;
}
