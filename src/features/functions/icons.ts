/**
 * Universal Toggle — Icon Design System
 *
 * Every icon in the universal toggle bar is defined here as a single-source-of-truth
 * SVG path. All icons share a consistent design language:
 *
 *   - 16×16 viewBox
 *   - Stroke-based rendering (1.5px stroke, round caps/joins)
 *     → crisp at small sizes, like Lucide / Feather icons
 *   - color inherited from parent button via currentColor
 *   - 1px internal padding — content fits within [1.5, 14.5]
 *   - Paired "on" / "off" variants; "off" uses a circle-slash for clarity
 *
 * Usage:
 *   import { buildSvg, ICON } from './icons';
 *   const svg = buildSvg(ICON.video);
 *   button.appendChild(svg);
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** Complete definition of a single icon. */
export interface IconDef {
  /** SVG path `d` attribute. */
  path: string;
  /** Human-readable label (for `<title>` accessibility). */
  label: string;
}

// ---------------------------------------------------------------------------
// Path helpers — reusable building blocks
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Icon definitions
// ---------------------------------------------------------------------------

export const ICON = {
  // ── Dark Mode ──────────────────────────────────────────────────────────

  sun: {
    // Circle with 8 rays
    path:
      'M8 3.5a4.5 4.5 0 1 0 0 9 4.5 4.5 0 0 0 0-9z' +
      'M8 1v1.5M8 13.5V15' +
      'M1 8h1.5M13.5 8H15' +
      'M3.05 3.05l1.06 1.06M11.89 11.89l1.06 1.06' +
      'M3.05 12.95l1.06-1.06M11.89 4.11l1.06-1.06',
    label: 'Light mode',
  },

  moon: {
    // Crescent moon
    path: 'M13.5 8A5.5 5.5 0 1 1 8 2.5a4.5 4.5 0 0 0 5.5 5.5z',
    label: 'Dark mode',
  },

  // ── Wide Mode ──────────────────────────────────────────────────────────

  expand: {
    // Two diagonal arrows pointing outward
    path: 'M9 1.5h5.5v5.5M14.5 1.5l-6 6' + 'M7 14.5H1.5V9M1.5 14.5l6-6',
    label: 'Wide mode',
  },

  // ── Product Ads ────────────────────────────────────────────────────────

  tag: {
    // Price tag
    path:
      'M2 3h4.34a1 1 0 0 1 .7.3l5.66 5.66a1 1 0 0 1 0 1.41l-4.95 4.95a1 1 0 0 1-1.41 0L1.3 10.28A1 1 0 0 1 1 9.58V4a1 1 0 0 1 1-1z' +
      'M4.5 6a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z',
    label: 'Product ads visible',
  },

  // ── Video Ads ──────────────────────────────────────────────────────────

  video: {
    // Play button (rectangle with play triangle)
    path:
      'M2.5 3.5a1 1 0 0 1 1-1H8a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H3.5a1 1 0 0 1-1-1v-9z' +
      'M6 7v2l2.5-1L6 7z',
    label: 'Video ads visible',
  },

  // ── Sponsorship ────────────────────────────────────────────────────────

  megaphone: {
    // Loudspeaker / announcement
    path:
      'M2 5.5a1 1 0 0 0-1 1v3a1 1 0 0 0 1 1h1.5l-2 5h1.5l2.5-5h1a.5.5 0 0 0 .5-.5v-4a.5.5 0 0 0-.5-.5H2z' +
      'M8 2l2-1v10l-2-1' +
      'M11 4v4M13 2.5v7',
    label: 'Sponsorships visible',
  },

  // ── Shelf Ads ──────────────────────────────────────────────────────────

  shelf: {
    // 3D box / package
    path: 'M8 2l6 3.5v5L8 14 2 10.5v-5L8 2z' + 'M2 5.5l6 3.5' + 'M8 9v5' + 'M14 5.5l-6 3.5',
    label: 'Shelf ads visible',
  },

  // ── Recommendation Ads ─────────────────────────────────────────────────

  sparkle: {
    // 4-point star / sparkle
    path: 'M8 1.5l1.07 3.43L12.5 6l-3.43 1.07L8 10.5l-1.07-3.43L3.5 6l3.43-1.07L8 1.5z',
    label: 'Recommendation ads visible',
  },

  // ── Skoop ──────────────────────────────────────────────────────────────

  newspaper: {
    // Document with text lines
    path:
      'M3 2.5h7v4h3.5a.5.5 0 0 1 .5.5v6a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V3.5a1 1 0 0 1 1-1z' +
      'M4.5 7h5M4.5 9.5h5M4.5 12h3',
    label: 'Skoop visible',
  },

  // ── AI Slop ────────────────────────────────────────────────────────────

  aiSlop: {
    // Monogram "AI" — left stroke is the 'A', right stroke is the 'I'
    path: 'M3.5 13.5 L7 2.5 M7 2.5 L10.5 13.5 M5 9.5 L9 9.5' + 'M12.5 3.5 V12.5',
    label: 'AI slop visible',
  },
} as const satisfies Record<string, IconDef>;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** SVG attributes applied to every stroke-rendered icon `<path>`. */
const STROKE_ATTRS = {
  fill: 'none',
  stroke: 'currentColor',
  'stroke-width': '1.5',
  'stroke-linecap': 'round',
  'stroke-linejoin': 'round',
} as const;

/**
 * Build a ready-to-append SVG element from an icon definition.
 *
 * All icons are stroke-rendered for crisp appearance at small sizes.
 *
 * @param icon  The icon definition (path + label).
 * @param size  Width / height in px (default 16).
 */
export function buildSvg(icon: IconDef, size: number = 16): SVGSVGElement {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', '0 0 16 16');
  svg.setAttribute('width', String(size));
  svg.setAttribute('height', String(size));

  const title = document.createElementNS('http://www.w3.org/2000/svg', 'title');
  title.textContent = icon.label;
  svg.appendChild(title);

  const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  path.setAttribute('d', icon.path);
  for (const [key, value] of Object.entries(STROKE_ATTRS)) {
    path.setAttribute(key, value);
  }
  svg.appendChild(path);

  return svg;
}
