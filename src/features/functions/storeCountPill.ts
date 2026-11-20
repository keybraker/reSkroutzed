import { DomClient } from '../../clients/dom/client';
import { Language } from '../../common/enums/Language.enum';
import { formatStoreCount } from '../../common/functions/formatStoreCount';

export const STORE_COUNT_PILL_CLASS = 'resk-store-count-pill';

/** The picker's own "Εξέλιξη τιμής" chip; the store pill sits next to it. */
const NATIVE_PRICE_HISTORY_PILL_SELECTOR = '.btn-reset.icon.price-history';

/** The buybox row that opens the store list ("από 99,99 € σε 47 καταστήματα"). */
const NATIVE_OFFERS_TOGGLE_SELECTOR = '.alternative-option-wrapper.btn-reset';

/** How the native chips render their label, so the pill blends into the row. */
const PILL_LABEL_STYLES = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '8px',
  margin: '0',
  padding: '5px 12px',
  border: 'none',
  borderRadius: '999px',
  appearance: 'none',
  background: '#f1f1f1',
  color: '#101010',
  fontFamily: 'inherit',
  fontSize: '13px',
  fontWeight: '500',
  lineHeight: '1.35',
  letterSpacing: 'normal',
  textTransform: 'none',
  whiteSpace: 'nowrap',
  cursor: 'pointer',
  transition: 'background-color 0.18s ease',
};

/** Resting, hover and press surfaces, matching the native chips. */
const PILL_BACKGROUND = '#f1f1f1';
const PILL_HOVER_BACKGROUND = '#e8e8e8';
const PILL_PRESSED_BACKGROUND = '#e2e2e2';

// Solid silhouette, like the native chips' icons: an outline glyph next to the
// filled stars and bars reads as a different, lighter control.
//
// The 1px drop is optical, not geometric: flex centring already lines the glyph
// box up with the label's line box, but the label's ink (x-height Greek text)
// sits below the middle of that box, so the glyph needs the nudge to look centred.
const STORE_GLYPH =
  '<svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" style="display:block;transform:translateY(1px)"><path fill-rule="evenodd" d="M3 3h18l1.5 5H1.5L3 3zM4 9.5h16V21H4V9.5zm5 4.5V21h6v-7H9z"/></svg>';

export function removeStoreCountPill(): void {
  DomClient.getElementsByClass(`.${STORE_COUNT_PILL_CLASS}`).forEach((pill) => pill.remove());
}

/**
 * Renders the shop count as a pill in the buybox's chip row and keeps it in sync
 * with the current product. The chip opens Skroutz's own store list, so the
 * count doubles as the entry point to the offers.
 */
export function syncStoreCountPill(storeCount: number, language: Language): void {
  removeStoreCountPill();

  const nativePill = DomClient.getElementByClass(NATIVE_PRICE_HISTORY_PILL_SELECTOR);
  const anchor = nativePill ? findChipAnchor(nativePill) : null;
  const pillRow = anchor?.parentElement ?? null;

  if (!anchor || !pillRow || !Number.isFinite(storeCount) || storeCount <= 0) {
    return;
  }

  const pill = createStoreCountPill(storeCount, language);

  pillRow.insertBefore(pill, anchor.nextSibling);
}

/**
 * Some chip rows nest the price-history button inside a clickable chip. The pill
 * has to sit beside that chip, never inside it, or every click on it would be a
 * click on the price history.
 */
function findChipAnchor(nativePill: Element): Element {
  let anchor: Element = nativePill;

  while (anchor.parentElement?.matches('a, button, [role="button"]')) {
    anchor = anchor.parentElement;
  }

  return anchor;
}

function createStoreCountPill(storeCount: number, language: Language): HTMLButtonElement {
  const pill = DomClient.createElement('button', {
    className: STORE_COUNT_PILL_CLASS,
  }) as HTMLButtonElement;
  pill.type = 'button';
  // Inline the surface as well as shipping it in CSS: the chip has to look
  // native even when the injected stylesheet is stale or the page's own button
  // rules carry more weight.
  Object.assign(pill.style, PILL_LABEL_STYLES);
  pill.title = language === Language.GREEK ? 'Άνοιγμα λίστας καταστημάτων' : 'Open the store list';
  pill.innerHTML = `${STORE_GLYPH}<span>${formatStoreCount(storeCount, language)}</span>`;

  // The chip row sits inside the buybox, which reacts to clicks of its own. The
  // pill opens the store list only and must not fall through to its neighbours
  // (the row would otherwise run the price-history chip).
  pill.addEventListener('click', (event) => {
    event.preventDefault();
    event.stopPropagation();
    openStoreList(storeCount, language);
  });

  attachHoverAnimation(pill);

  return pill;
}

/**
 * Drives hover and press from the element itself instead of a `:hover` rule.
 * The chip has to react even when the injected stylesheet is stale (or the
 * page's own `!important` button rules win), and inline `!important` beats both.
 *
 * The reaction is the native chip's: the surface darkens, nothing moves.
 */
function attachHoverAnimation(pill: HTMLButtonElement): void {
  let isHovered = false;
  let isPressed = false;

  const paint = (): void => {
    const background = isPressed
      ? PILL_PRESSED_BACKGROUND
      : isHovered
        ? PILL_HOVER_BACKGROUND
        : PILL_BACKGROUND;
    pill.style.setProperty('background', background, 'important');
  };

  pill.addEventListener('pointerenter', () => {
    isHovered = true;
    paint();
  });
  pill.addEventListener('pointerleave', () => {
    isHovered = false;
    isPressed = false;
    paint();
  });
  pill.addEventListener('pointerdown', () => {
    isPressed = true;
    paint();
  });
  pill.addEventListener('pointerup', () => {
    isPressed = false;
    paint();
  });
  pill.addEventListener('pointercancel', () => {
    isPressed = false;
    paint();
  });
}

function openStoreList(storeCount: number, language: Language): void {
  findOffersToggle(storeCount, language)?.click();
}

function findOffersToggle(storeCount: number, language: Language): HTMLElement | null {
  const nativeToggle = DomClient.getElementByClass(NATIVE_OFFERS_TOGGLE_SELECTOR);
  if (nativeToggle) {
    return nativeToggle as HTMLElement;
  }

  // The row is the element whose own text carries the count, so match on the
  // rendered label and keep only the innermost hit: outer wrappers contain it
  // too, and clicking one of those lands on whatever they happen to react to.
  const label = formatStoreCount(storeCount, language);
  const matches = DomClient.getElementsByClass('a, button, [role="button"]').filter(
    (element) =>
      !element.classList.contains(STORE_COUNT_PILL_CLASS) &&
      (element.textContent ?? '').includes(label),
  );
  const innermost = matches.filter(
    (element) => !matches.some((other) => other !== element && element.contains(other)),
  );

  return (innermost[innermost.length - 1] as HTMLElement | undefined) ?? null;
}
