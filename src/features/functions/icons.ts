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
 *   - icons fill that box (bbox ≈ 12-13 units) so they carry equal visual weight
 *     side by side; a small icon in a big box reads as the odd one out
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
    // Disc with 8 rays (rays meet the disc, so it still reads as a sun at 16px)
    path:
      'M8 3.8a4.2 4.2 0 1 0 0 8.4 4.2 4.2 0 0 0 0-8.4z' +
      'M8 3V1.5M8 14.5v-1.5' +
      'M3 8H1.5M14.5 8h-1.5' +
      'M4.46 4.46l-1.06-1.06M11.54 11.54l1.06 1.06' +
      'M4.46 11.54l-1.06 1.06M11.54 4.46l1.06-1.06',
    label: 'Light mode',
  },

  moon: {
    // Crescent moon — outer disc arc closed by a deeper bite, leaving sharp horns
    path: 'M13.75 8A5.75 5.75 0 1 1 8 2.25a5.5 5.5 0 0 0 5.75 5.75z',
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
    // Price tag: rounded head carrying the punch hole, rounded point at the far end
    path:
      'M8.3 1.8l5.14 5.14a1.5 1.5 0 0 1 0 2.12l-4.38 4.38a1.5 1.5 0 0 1-2.12 0L1.8 8.3V3.3a1.5 1.5 0 0 1 1.5-1.5z' +
      'M6.2 5.45a.75.75 0 1 0 0 1.5.75.75 0 0 0 0-1.5z',
    label: 'Product ads visible',
  },

  // ── Video Ads ──────────────────────────────────────────────────────────

  video: {
    // Video frame (wide rounded rectangle) with a centred play triangle
    path:
      'M4 3h8a2.5 2.5 0 0 1 2.5 2.5v5a2.5 2.5 0 0 1-2.5 2.5H4a2.5 2.5 0 0 1-2.5-2.5v-5A2.5 2.5 0 0 1 4 3z' +
      'M6.3 5.3L11.3 8l-5 2.7z',
    label: 'Video ads visible',
  },

  // ── Sponsorship ────────────────────────────────────────────────────────

  megaphone: {
    // Flared horn: closed cone, hand grip hanging under it, two sound waves
    path:
      'M9 2.5L1.75 5.75v4.5L9 13.5z' +
      'M6.6 12.42a3.2 3.2 0 0 1-3.5-1.56' +
      'M11.2 5.75a3 3 0 0 1 0 4.5' +
      'M13.6 4.3a8.06 8.06 0 0 1 0 7.4',
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
    path: 'M8 2.4l1.33 4.27L13.6 8l-4.27 1.33L8 13.6l-1.33-4.27L2.4 8l4.27-1.33z',
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
    // Monogram "AI" — 'A' apex with crossbar, then the 'I' stem at the same cap height
    path: 'M6.6 2.5l-3.5 11M6.6 2.5l3.5 11M4.25 9.6h4.7M12.9 2.5v11',
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
