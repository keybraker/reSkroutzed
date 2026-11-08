import { BrowserClient, StorageKey } from '../../clients/browser/client';
import { DomClient } from '../../clients/dom/client';
import { buildSvg, ICON } from './icons';
import { ToggleButtonContext } from './toggleButtonContext';

export function createCalmModeToggleButton(ctx: ToggleButtonContext): HTMLButtonElement {
  const { state, calmModeDecorator } = ctx;
  const button = document.createElement('button');
  button.classList.add('toggle-option-button', 'calm-mode-option');
  button.title = state.calmMode ? 'Disable Calm Mode' : 'Enable Calm Mode';

  const svg = buildSvg(ICON.fire);
  DomClient.appendElementToElement(svg, button);

  if (state.calmMode) {
    button.classList.add('active');
  }

  button.addEventListener('click', (e) => {
    e.stopPropagation();

    state.calmMode = !state.calmMode;
    BrowserClient.setValue(StorageKey.CALM_MODE, state.calmMode);
    calmModeDecorator.sync();

    button.classList.toggle('active');
    button.title = state.calmMode ? 'Disable Calm Mode' : 'Enable Calm Mode';
  });

  return button;
}
