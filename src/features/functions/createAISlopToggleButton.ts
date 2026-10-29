import { BrowserClient, StorageKey } from '../../clients/browser/client';
import { DomClient } from '../../clients/dom/client';
import {
  AI_HIDE_CLASS,
  ensureAISlopStyleInjected,
  queryAISlopNodes,
} from '../../common/functions/aiSlop';
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

  const apply = (): void => {
    ensureAISlopStyleInjected();
    const nodes = queryAISlopNodes();
    let count = 0;
    nodes.forEach((element) => {
      if (state.hideAISlop) {
        element.classList.add(AI_HIDE_CLASS);
      } else {
        element.classList.remove(AI_HIDE_CLASS);
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
