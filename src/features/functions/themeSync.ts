import { State } from '../../common/types/State.type';

const STYLE_ID = 'resk-dark-mode-style';
const CLASS_NAME = 'resk-dark';

/**
 * Synchronises the dark mode filter stylesheet with the current state.
 *
 * Uses CSS filter inversion (same approach as Dark Reader's "Filter" engine):
 * `filter: invert(1) hue-rotate(180deg)` on <html> darkens every element
 * automatically. Media elements are re-inverted to preserve original colours.
 */
export function themeSync(state: State): void {
  if (state.darkMode) {
    injectDarkModeFilter();
  } else {
    removeDarkModeFilter();
  }
}

function injectDarkModeFilter(): void {
  if (document.getElementById(STYLE_ID)) {
    return;
  }

  document.documentElement.classList.add(CLASS_NAME);

  const style = document.createElement('style');
  style.id = STYLE_ID;
  style.textContent = buildFilterCSS();
  document.head.appendChild(style);
}

function removeDarkModeFilter(): void {
  document.documentElement.classList.remove(CLASS_NAME);

  const el = document.getElementById(STYLE_ID);
  if (el) {
    el.remove();
  }
}

function buildFilterCSS(): string {
  return [
    `html.${CLASS_NAME} {`,
    `  filter: invert(1) hue-rotate(180deg) !important;`,
    `  background-color: #1e1e1e !important;`,
    `}`,
    '',
    `/* Restore media elements to original appearance */`,
    `html.${CLASS_NAME} img,`,
    `html.${CLASS_NAME} video,`,
    `html.${CLASS_NAME} canvas,`,
    `html.${CLASS_NAME} svg,`,
    `html.${CLASS_NAME} [style*="background-image"],`,
    `html.${CLASS_NAME} .product-image img,`,
    `html.${CLASS_NAME} .sku-image,`,
    `html.${CLASS_NAME} .image-gallery img,`,
    `html.${CLASS_NAME} .category-image {`,
    `  filter: invert(1) hue-rotate(180deg) !important;`,
    `}`,
    '',
    `/* Utility class to opt-out specific elements from inversion */`,
    `html.${CLASS_NAME} .resk-no-invert {`,
    `  filter: none !important;`,
    `}`,
    '',
    `/* Print — disable filter */`,
    `@media print {`,
    `  html.${CLASS_NAME} {`,
    `    filter: none !important;`,
    `    background-color: #fff !important;`,
    `  }`,
    `  html.${CLASS_NAME} img,`,
    `  html.${CLASS_NAME} video,`,
    `  html.${CLASS_NAME} canvas,`,
    `  html.${CLASS_NAME} svg,`,
    `  html.${CLASS_NAME} [style*="background-image"] {`,
    `    filter: none !important;`,
    `  }`,
    `}`,
  ].join('\n');
}
