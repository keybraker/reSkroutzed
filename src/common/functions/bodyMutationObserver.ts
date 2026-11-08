export type BodyMutationCallback = (mutations: MutationRecord[]) => void;

/**
 * How long mutation batches are coalesced before subscribers run. Long enough
 * to fold a burst of DOM writes into one pass, short enough that the page does
 * not visibly lag behind the content it just rendered.
 */
export const BODY_MUTATION_DEBOUNCE_MS = 100;

const subscribers = new Set<BodyMutationCallback>();
let observer: MutationObserver | null = null;
let timer: number | undefined;
let pendingMutations: MutationRecord[] = [];

function flush(): void {
  timer = undefined;

  if (subscribers.size === 0) {
    pendingMutations = [];
    return;
  }

  const mutations = pendingMutations;
  pendingMutations = [];

  // Copy the set so a subscriber that unsubscribes during its own callback does
  // not skip the next one.
  [...subscribers].forEach((subscriber) => subscriber(mutations));
}

function scheduleFlush(): void {
  // Throttle rather than reset-on-every-batch: Skroutz pages mutate
  // continuously, and a debounce that resets would starve the subscribers for
  // as long as the page kept changing.
  if (timer !== undefined) {
    return;
  }

  timer = window.setTimeout(flush, BODY_MUTATION_DEBOUNCE_MS);
}

function handleMutations(mutations: MutationRecord[]): void {
  pendingMutations.push(...mutations);
  scheduleFlush();
}

/**
 * Subscribe to `childList` mutations anywhere under `document.body`.
 *
 * All callers share one `MutationObserver`, so a page with several features
 * that react to new DOM nodes only pays for a single observer. Mutations are
 * coalesced over {@link BODY_MUTATION_DEBOUNCE_MS} and every subscriber
 * receives the same batch.
 *
 * @returns an unsubscribe function; when the last subscriber leaves, the
 * observer is disconnected and any pending batch is dropped.
 */
export function onBodyMutations(callback: BodyMutationCallback): () => void {
  subscribers.add(callback);

  if (!observer && document.body) {
    observer = new MutationObserver(handleMutations);
    observer.observe(document.body, { childList: true, subtree: true });
  }

  return () => {
    subscribers.delete(callback);

    if (subscribers.size === 0) {
      observer?.disconnect();
      observer = null;

      if (timer !== undefined) {
        window.clearTimeout(timer);
        timer = undefined;
      }

      pendingMutations = [];
    }
  };
}
