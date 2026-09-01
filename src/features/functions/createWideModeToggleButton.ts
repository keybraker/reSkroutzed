import { BrowserClient, StorageKey } from '../../clients/browser/client';
import { DomClient } from '../../clients/dom/client';
import { buildSvg, ICON } from './icons';
import { ToggleButtonContext } from './toggleButtonContext';

export function createWideModeToggleButton(ctx: ToggleButtonContext): HTMLButtonElement {
  const { state, wideModeDecorator } = ctx;
  const button = document.createElement('button');
  button.classList.add('toggle-option-button', 'wide-mode-option');
  button.title = state.wideMode ? 'Disable Wide Mode' : 'Enable Wide Mode';

  const svg = buildSvg(ICON.expand);
  DomClient.appendElementToElement(svg, button);

  if (state.wideMode) {
    button.classList.add('active');
  }

  button.addEventListener('click', (e) => {
    e.stopPropagation();

    state.wideMode = !state.wideMode;
    BrowserClient.setValue(StorageKey.WIDE_MODE, state.wideMode);
    wideModeDecorator.sync();

    button.classList.toggle('active');
    button.title = state.wideMode ? 'Disable Wide Mode' : 'Enable Wide Mode';
  });

  return button;
}
