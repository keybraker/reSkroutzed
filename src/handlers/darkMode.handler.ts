import { BrowserClient, StorageKey } from '../clients/browser/client';
import { State } from '../common/types/State.type';

export class DarkModeHandler {
  private state: State;

  constructor(state: State) {
    this.state = state;
  }

  public applyDarkMode(): void {
    if (this.state.darkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  }

  public toggleDarkMode(): void {
    this.state.darkMode = !this.state.darkMode;

    BrowserClient.setValue(StorageKey.DARK_MODE, this.state.darkMode);

    this.applyDarkMode();
  }
}
