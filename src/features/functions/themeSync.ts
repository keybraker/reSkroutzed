import { State } from '../../common/types/State.type';
import { applyDarkMode, removeDarkMode } from './darkMode';

/**
 * Synchronises the dark-mode class on <html> with the current state.
 *
 * Uses CSS filter inversion (same approach as Dark Reader's "Filter" engine):
 * `filter: invert(1) hue-rotate(180deg)` on <html> darkens every element
 * automatically. Media elements are re-inverted to preserve original colours.
 *
 * The rules themselves live in `src/css/darkMode.css` and are injected by the
 * manifest at `document_start`; only the class has to be toggled at runtime.
 */
export function themeSync(state: State): void {
  if (state.darkMode) {
    applyDarkMode();
  } else {
    removeDarkMode();
  }
}
