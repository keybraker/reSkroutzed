import { State } from '../common/types/State.type';
import { FeatureInstance } from './common/FeatureInstance';
import { applyDarkMode, removeDarkMode } from './functions/darkMode';

/**
 * Dark mode feature that uses CSS filter inversion (Dark Reader "Filter" engine approach).
 * Applies `filter: invert(1) hue-rotate(180deg)` to <html> to automatically darken all
 * components without naming them individually. Media elements (img, video, canvas, svg)
 * are re-inverted to preserve their original appearance.
 *
 * The stylesheet lives in `src/css/darkMode.css` and is injected by the manifest at
 * `document_start`, so enabling dark mode is a single class toggle on <html> and the
 * page is dark from its very first paint.
 */
export class DarkModeDecorator implements FeatureInstance {
  constructor(private readonly state: State) {}

  /**
   * Applies the dark mode class to <html>.
   * Idempotent — safe to call multiple times.
   */
  public execute(): void {
    applyDarkMode();
  }

  /**
   * Removes the dark mode class from <html>.
   * Safe to call even if dark mode was never enabled.
   */
  public destroy(): void {
    removeDarkMode();
  }

  /**
   * Enables or disables dark mode based on current state.
   * Call this from the popup toggle handler.
   */
  public sync(): void {
    if (this.state.darkMode) {
      this.execute();
    } else {
      this.destroy();
    }
  }
}
