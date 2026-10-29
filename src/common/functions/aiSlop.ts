/**
 * Selectors matching the AI-generated content that the "AI Slop" toggle removes.
 *
 * The same list is needed by the content script and by the universal toggle's
 * AI slop button, so it lives here to keep the two from drifting apart.
 */
export const AI_SLOP_SELECTOR: string = [
  '[class*="sofos"]',
  '.sofos-entrypoint',
  '.sofos-listing-shelf',
  '.sofos-chat-button-wrapper',
  '.sofos-chat-button',
  '.shifu-chat-button',
  '.reviews-ai-summary',
].join(',');

/**
 * Class applied to every AI slop element while the feature is enabled.
 */
export const AI_HIDE_CLASS = 'resk-hide-ai';

/**
 * Injects the stylesheet that hides flagged AI slop elements.
 *
 * The style tag is guarded by its id, so calling this repeatedly is a no-op
 * after the first injection.
 */
export function ensureAISlopStyleInjected(): void {
  if (document.getElementById('resk-ai-hide-style')) return;
  const style = document.createElement('style');
  style.id = 'resk-ai-hide-style';
  style.textContent = `.${AI_HIDE_CLASS} { display: none !important; }`;
  document.head.appendChild(style);
}

/**
 * Collects every AI slop element currently present in the document.
 */
export function queryAISlopNodes(): NodeListOf<HTMLElement> {
  return document.querySelectorAll(AI_SLOP_SELECTOR) as NodeListOf<HTMLElement>;
}
