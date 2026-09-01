import { BrowserClient, StorageKey } from '../../clients/browser/client';
import { DomClient } from '../../clients/dom/client';
import { buildSvg, ICON } from './icons';
import { ToggleButtonContext } from './toggleButtonContext';

export function createSponsorshipToggleButton(ctx: ToggleButtonContext): HTMLButtonElement {
  const { state, sponsorshipAdHandler, campaignAdHandler } = ctx;
  const button = document.createElement('button');
  button.classList.add('toggle-option-button', 'sponsorship-toggle-option');
  button.title = state.hideSponsorships ? 'Hide Sponsorships' : 'Show Sponsorships';

  const svg = buildSvg(ICON.megaphone);
  DomClient.appendElementToElement(svg, button);

  const notificationBubble = document.createElement('div');
  notificationBubble.classList.add('notification-bubble', 'sponsorship-notification');
  notificationBubble.textContent = '0';
  DomClient.appendElementToElement(notificationBubble, button);

  const updateNotificationCount = (): void => {
    const sponsorshipElements = document.querySelectorAll('.flagged-sponsorship');
    notificationBubble.textContent = `${sponsorshipElements.length}`;
    notificationBubble.style.display = sponsorshipElements.length === 0 ? 'none' : 'flex';
  };

  updateNotificationCount();

  setInterval(updateNotificationCount, 2000);

  if (!state.hideSponsorships) {
    button.classList.add('active');
  }

  button.addEventListener('click', (e) => {
    e.stopPropagation();
    state.hideSponsorships = !state.hideSponsorships;
    BrowserClient.setValue(StorageKey.SPONSORSHIP_VISIBILITY, state.hideSponsorships);

    sponsorshipAdHandler.visibilityUpdate();
    campaignAdHandler.visibilityUpdate();
    button.classList.toggle('active');

    button.title = button.classList.contains('active') ? 'Show Sponsorships' : 'Hide Sponsorships';
  });

  return button;
}
