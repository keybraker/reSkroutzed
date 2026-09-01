import { BrowserClient, StorageKey } from '../../clients/browser/client';
import { DomClient } from '../../clients/dom/client';
import { buildSvg, ICON } from './icons';
import { ToggleButtonContext } from './toggleButtonContext';

export function createAISlopToggleButton(ctx: ToggleButtonContext): HTMLButtonElement {
  const { state } = ctx;
  const button = document.createElement('button');
  button.classList.add('toggle-option-button', 'ai-slop-toggle-option');
  button.title = state.hideAISlop ? 'Hide AI Slop' : 'Show AI Slop';

  const svg = buildSvg(ICON.aiSlop);
  DomClient.appendElementToElement(svg, button);

  if (state.hideAISlop) {
    button.classList.add('active');
  }

  const notificationBubble = document.createElement('div');
  notificationBubble.classList.add('notification-bubble', 'ai-notification');
  notificationBubble.textContent = '0';
  DomClient.appendElementToElement(notificationBubble, button);

  const ensureStyle = (): void => {
    if (document.getElementById('resk-ai-hide-style')) return;
    const style = document.createElement('style');
    style.id = 'resk-ai-hide-style';
    style.textContent = `.resk-hide-ai { display: none !important; }`;
    document.head.appendChild(style);
  };

  const queryNodes = (): NodeListOf<HTMLElement> => {
    const selector = [
      '[class*="sofos"]',
      '.sofos-entrypoint',
      '.sofos-listing-shelf',
      '.sofos-chat-button-wrapper',
      '.sofos-chat-button',
    ].join(',');
    return document.querySelectorAll(selector) as NodeListOf<HTMLElement>;
  };

  const apply = (): void => {
    ensureStyle();
    const nodes = queryNodes();
    let count = 0;
    nodes.forEach((el) => {
      const element = el as HTMLElement;
      if (state.hideAISlop) {
        element.classList.add('resk-hide-ai');
      } else {
        element.classList.remove('resk-hide-ai');
      }
      count += 1;
    });
    notificationBubble.textContent = `${count}`;
    notificationBubble.style.display = count === 0 ? 'none' : 'flex';
  };

  // initial apply and count
  setTimeout(apply, 0);

  // keep the counter fresh
  const counterInterval = window.setInterval(apply, 2000);
  button.addEventListener('remove', () => window.clearInterval(counterInterval));

  button.addEventListener('click', (e) => {
    e.stopPropagation();
    state.hideAISlop = !state.hideAISlop;

    BrowserClient.setValue(StorageKey.AI_SLOP_VISIBILITY, state.hideAISlop);

    apply();
    button.classList.toggle('active');
    button.title = state.hideAISlop ? 'Hide AI Slop' : 'Show AI Slop';
  });

  return button;
}
