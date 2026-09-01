import { BrowserClient, StorageKey } from '../../clients/browser/client';
import { DomClient } from '../../clients/dom/client';
import { buildSvg, ICON } from './icons';
import { ToggleButtonContext } from './toggleButtonContext';

export function createVideoToggleButton(ctx: ToggleButtonContext): HTMLButtonElement {
  const { state, videoHandler } = ctx;
  const button = document.createElement('button');
  button.classList.add('toggle-option-button', 'video-toggle-option');
  button.title = state.hideVideoAds ? 'Hide Videos' : 'Show Videos';

  const svg = buildSvg(ICON.video);
  DomClient.appendElementToElement(svg, button);

  const videoNotificationBubble = document.createElement('div');
  videoNotificationBubble.classList.add('notification-bubble', 'video-notification');
  videoNotificationBubble.textContent = `${state.videoAdCount}`;
  DomClient.appendElementToElement(videoNotificationBubble, button);

  const updateVideoNotificationCount = (): void => {
    videoNotificationBubble.textContent = `${state.videoAdCount}`;
    if (state.videoAdCount === 0) {
      videoNotificationBubble.style.display = 'none';
    } else {
      videoNotificationBubble.style.display = 'flex';
    }
  };

  updateVideoNotificationCount();

  setInterval(() => {
    updateVideoNotificationCount();
  }, 2000);

  if (!state.hideVideoAds) {
    button.classList.add('active');
  }

  button.addEventListener('click', (e) => {
    e.stopPropagation();
    state.hideVideoAds = !state.hideVideoAds;

    BrowserClient.setValue(StorageKey.VIDEO_AD_VISIBILITY, state.hideVideoAds);

    videoHandler.visibilityUpdate();
    button.classList.toggle('active');

    button.title = state.hideVideoAds ? 'Hide Videos' : 'Show Videos';
  });

  return button;
}
