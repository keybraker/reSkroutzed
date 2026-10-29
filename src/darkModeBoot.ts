import { applyDarkMode, isDarkModeEnabled } from './features/functions/darkMode';

/**
 * Boot script injected at `document_start`.
 *
 * Its only job is to put the dark-mode class on <html> before the browser
 * paints for the first time. The stylesheet that backs the class is injected
 * by the manifest at the same moment, so the page renders dark from the very
 * first frame instead of flashing light before the main content script flips
 * it at `document_end`.
 */
function boot(): void {
  if (!isDarkModeEnabled()) {
    return;
  }

  if (applyDarkMode()) {
    return;
  }

  // The document element does not exist yet — apply the class as soon as the
  // parser creates it.
  const observer = new MutationObserver(() => {
    if (applyDarkMode()) {
      observer.disconnect();
    }
  });

  observer.observe(document, { childList: true, subtree: true });
}

boot();
