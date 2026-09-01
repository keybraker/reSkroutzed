import { BrowserClient, StorageKey } from '../../clients/browser/client';
import { DomClient } from '../../clients/dom/client';
import { themeSync } from './themeSync';
import { buildSvg, ICON } from './icons';
import { ToggleButtonContext } from './toggleButtonContext';

export function createDarkModeToggleButton(ctx: ToggleButtonContext): HTMLButtonElement {
  const { state } = ctx;
  const button = document.createElement('button');
  button.classList.add('toggle-option-button', 'dark-mode-option');
  button.title = state.darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode';

  const svg = buildSvg(ICON.moon);
  DomClient.appendElementToElement(svg, button);

  if (state.darkMode) {
    button.classList.add('active');
  }

  button.addEventListener('click', (e) => {
    e.stopPropagation();

    state.darkMode = !state.darkMode;
    BrowserClient.setValue(StorageKey.DARK_MODE, state.darkMode);
    themeSync(state);

    button.classList.toggle('active');
    button.title = state.darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode';
  });

  return button;
}
