import { BrowserClient, StorageKey } from '../../clients/browser/client';

/**
 * Class put on <html> while dark mode is active.
 *
 * The rules that back it live in `src/css/darkMode.css`, which the manifest
 * injects at `document_start`. Keeping the CSS in a stylesheet (instead of a
 * JS-built `<style>` element) is what allows the page to be dark on its very
 * first paint — a JS-injected stylesheet only lands after the page has already
 * rendered light, which produces the visible light-to-dark flash.
 */
export const DARK_MODE_CLASS_NAME = 'resk-dark';

/**
 * Whether the user has dark mode switched on.
 *
 * Reads the synchronous localStorage mirror rather than chrome.storage, so it
 * can be answered during `document_start` — long before an async storage read
 * would resolve.
 */
export function isDarkModeEnabled(): boolean {
  return BrowserClient.getValue<boolean>(StorageKey.DARK_MODE);
}

/**
 * Enables dark mode by adding the class to <html>.
 *
 * @returns false when the document element does not exist yet, which can only
 *          happen before the parser has created it.
 */
export function applyDarkMode(): boolean {
  const root = document.documentElement;

  if (!root) {
    return false;
  }

  root.classList.add(DARK_MODE_CLASS_NAME);

  return true;
}

/** Disables dark mode by removing the class from <html>. */
export function removeDarkMode(): void {
  document.documentElement.classList.remove(DARK_MODE_CLASS_NAME);
}
