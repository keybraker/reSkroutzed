import { BrowserClient, StorageKey } from '../../clients/browser/client';
import { DomClient } from '../../clients/dom/client';
import { buildSvg, ICON } from './icons';
import { ToggleButtonContext } from './toggleButtonContext';

export function createSkoopToggleButton(ctx: ToggleButtonContext): HTMLButtonElement {
  const { state, skoopHandler } = ctx;
  const button = document.createElement('button');
  button.classList.add('toggle-option-button', 'skoop-toggle-option');
  button.title = state.hideSkoopAds ? 'Hide Skoop Recommendations' : 'Show Skoop Recommendations';

  const svg = buildSvg(ICON.newspaper);
  DomClient.appendElementToElement(svg, button);

  if (!state.hideSkoopAds) {
    button.classList.add('active');
  }

  const skoopNotificationBubble = document.createElement('div');
  skoopNotificationBubble.classList.add('notification-bubble', 'skoop-notification');
  skoopNotificationBubble.textContent = `${state.skoopAdCount}`;
  DomClient.appendElementToElement(skoopNotificationBubble, button);

  const updateSkoopNotificationCount = (): void => {
    const flaggedSkoopElements = document.querySelectorAll('.flagged-skoop');

    if (flaggedSkoopElements.length !== state.skoopAdCount) {
      state.skoopAdCount = flaggedSkoopElements.length;
    }

    skoopNotificationBubble.textContent = `${state.skoopAdCount}`;
    skoopNotificationBubble.style.display = state.skoopAdCount === 0 ? 'none' : 'flex';
  };

  updateSkoopNotificationCount();
  setInterval(updateSkoopNotificationCount, 2000);

  button.addEventListener('click', (e) => {
    e.stopPropagation();
    state.hideSkoopAds = !state.hideSkoopAds;

    BrowserClient.setValue(StorageKey.SKOOP_AD_VISIBILITY, state.hideSkoopAds);

    skoopHandler.visibilityUpdate();
    button.classList.toggle('active');
    button.title = state.hideSkoopAds ? 'Hide Skoop Recommendations' : 'Show Skoop Recommendations';
  });

  return button;
}
