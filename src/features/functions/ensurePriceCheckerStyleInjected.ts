/**
 * Id of the `<link>` that loads the price-checker stylesheet.
 *
 * The rules live in `src/css/priceChecker.css` instead of the stylesheet the
 * manifest injects on every page: they only matter once the checker has found a
 * host element, so listing pages never parse them.
 */
export const PRICE_CHECKER_STYLE_ID = 'resk-price-checker-style';

/**
 * Loads the price-checker stylesheet, at most once per page.
 *
 * Link to stylesheet rather than an injected `<style>` element so the file is
 * cached by the browser and stays a separate, independently cacheable asset.
 * The file is declared in `web_accessible_resources` in both manifests.
 */
export function ensurePriceCheckerStyleInjected(): void {
  if (document.getElementById(PRICE_CHECKER_STYLE_ID)) {
    return;
  }

  const link = document.createElement('link');
  link.id = PRICE_CHECKER_STYLE_ID;
  link.rel = 'stylesheet';
  link.href = chrome.runtime.getURL('css/priceChecker.css');

  document.head.appendChild(link);
}
