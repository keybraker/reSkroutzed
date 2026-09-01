import { BrowserClient, StorageKey } from '../../clients/browser/client';
import { DomClient } from '../../clients/dom/client';
import { buildSvg, ICON } from './icons';
import { ToggleButtonContext } from './toggleButtonContext';

export function createAdToggleButton(ctx: ToggleButtonContext): HTMLButtonElement {
  const { state, listProductAdHandler, shelfProductAdHandler } = ctx;
  const button = document.createElement('button');
  button.classList.add('toggle-option-button', 'ad-toggle-option');
  button.title = state.hideProductAds ? 'Hide Ads' : 'Show Ads';

  const svg = buildSvg(ICON.tag);
  DomClient.appendElementToElement(svg, button);

  if (!state.hideProductAds) {
    button.classList.add('active');
  }

  const notificationBubble = document.createElement('div');
  notificationBubble.classList.add('notification-bubble');
  notificationBubble.textContent = `${state.productAdCount}`;
  DomClient.appendElementToElement(notificationBubble, button);

  const updateNotificationCount = (): void => {
    const flaggedElements = document.querySelectorAll(
      'li.flagged-product, div.flagged-bought-together, .card.flagged-product',
    );

    if (flaggedElements.length !== state.productAdCount) {
      state.productAdCount = flaggedElements.length;
    }

    notificationBubble.textContent = `${state.productAdCount}`;

    if (state.productAdCount === 0) {
      notificationBubble.style.display = 'none';
    } else {
      notificationBubble.style.display = 'flex';
    }
  };

  updateNotificationCount();

  setInterval(() => {
    updateNotificationCount();
  }, 2000);

  button.addEventListener('click', (e) => {
    e.stopPropagation();
    state.hideProductAds = !state.hideProductAds;

    BrowserClient.setValue(StorageKey.PRODUCT_AD_VISIBILITY, state.hideProductAds);

    const sponsoredFlagButton = document.getElementById('sponsored-flagger-button');
    if (sponsoredFlagButton) {
      const activeButtonClass = 'flagger-toggle-product-active';
      if (state.hideProductAds) {
        sponsoredFlagButton.classList.remove(activeButtonClass);
      } else {
        sponsoredFlagButton.classList.add(activeButtonClass);
      }
    }

    listProductAdHandler.visibilityUpdate();
    shelfProductAdHandler.visibilityUpdate();

    button.classList.toggle('active');

    button.title = state.hideProductAds ? 'Hide Ads' : 'Show Ads';
  });

  return button;
}
