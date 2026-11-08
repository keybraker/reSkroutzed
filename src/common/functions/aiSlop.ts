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
 * Collects every AI slop element present under `root`.
 *
 * Callers reacting to a mutation batch pass the added element nodes as roots, so
 * the scan stays local to the new markup instead of walking the whole document
 * — `AI_SLOP_SELECTOR` includes a `[class*=...]` attribute substring match, which
 * is the most expensive selector in the set. The root element itself is checked
 * too, because `querySelectorAll` only looks at descendants.
 *
 * @param root The subtree to search; defaults to the whole document.
 */
export function queryAISlopNodes(root: ParentNode = document): HTMLElement[] {
  const nodes = Array.from(root.querySelectorAll<HTMLElement>(AI_SLOP_SELECTOR));

  if (root instanceof Element && root.matches(AI_SLOP_SELECTOR)) {
    nodes.unshift(root as HTMLElement);
  }

  return nodes;
}
