import { State } from '../../common/types/State.type';

export function themeSync(state: State): void {
  if (state.darkMode) {
    document.body.classList.add('dark-mode');
  } else {
    document.body.classList.remove('dark-mode');
  }
}
