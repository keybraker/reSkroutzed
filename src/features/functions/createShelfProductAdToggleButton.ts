import { BrowserClient, StorageKey } from '../../clients/browser/client';
import { DomClient } from '../../clients/dom/client';
import { buildSvg, ICON } from './icons';
import { ToggleButtonContext } from './toggleButtonContext';

export function createShelfProductAdToggleButton(ctx: ToggleButtonContext): HTMLButtonElement {
  const { state, shelfProductAdHandler } = ctx;
  const button = document.createElement('button');
  button.classList.add('toggle-option-button', 'shelf-ad-toggle-option');
  button.title = state.hideShelfProductAds ? 'Hide Shelf Ads' : 'Show Shelf Ads';

  const svg = buildSvg(ICON.shelf);
  DomClient.appendElementToElement(svg, button);

  const shelfNotificationBubble = document.createElement('div');
  shelfNotificationBubble.classList.add('notification-bubble', 'shelf-notification');
  shelfNotificationBubble.textContent = `${state.shelfAdCount}`;
  DomClient.appendElementToElement(shelfNotificationBubble, button);

  const updateShelfNotificationCount = (): void => {
    shelfNotificationBubble.textContent = `${state.shelfAdCount}`;
    if (state.shelfAdCount === 0) {
      shelfNotificationBubble.style.display = 'none';
    } else {
      shelfNotificationBubble.style.display = 'flex';
    }
  };

  updateShelfNotificationCount();

  setInterval(() => {
    updateShelfNotificationCount();
  }, 2000);

  if (!state.hideShelfProductAds) {
    button.classList.add('active');
  }

  button.addEventListener('click', (e) => {
    e.stopPropagation();
    state.hideShelfProductAds = !state.hideShelfProductAds;

    BrowserClient.setValue(StorageKey.SHELF_PRODUCT_AD_VISIBILITY, state.hideShelfProductAds);

    shelfProductAdHandler.visibilityUpdate();
    button.classList.toggle('active');

    button.title = state.hideShelfProductAds ? 'Hide Shelf Ads' : 'Show Shelf Ads';
  });

  return button;
}
