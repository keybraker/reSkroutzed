import { State } from '../common/types/State.type';
import { FeatureInstance } from './common/FeatureInstance';

/**
 * Dark mode feature that uses CSS filter inversion (Dark Reader "Filter" engine approach).
 * Applies `filter: invert(1) hue-rotate(180deg)` to <html> to automatically darken all
 * components without naming them individually. Media elements (img, video, canvas, svg)
 * are re-inverted to preserve their original appearance.
 *
 * The stylesheet is injected programmatically only when dark mode is enabled,
 * and removed when disabled. No static CSS file with component-specific rules is needed.
 */
export class DarkModeDecorator implements FeatureInstance {
  private static readonly STYLE_ID = 'resk-dark-mode-style';
  private static readonly CLASS_NAME = 'resk-dark';

  constructor(private readonly state: State) {}

  /**
   * Injects the dark mode filter stylesheet and applies the class.
   * Idempotent — safe to call multiple times.
   */
  public execute(): void {
    this.injectStyle();
    document.documentElement.classList.add(DarkModeDecorator.CLASS_NAME);
  }

  /**
   * Removes the dark mode filter stylesheet and class.
   * Safe to call even if dark mode was never enabled.
   */
  public destroy(): void {
    document.documentElement.classList.remove(DarkModeDecorator.CLASS_NAME);
    this.removeStyle();
  }

  /**
   * Enables or disables dark mode based on current state.
   * Call this from the popup toggle handler.
   */
  public sync(): void {
    if (this.state.darkMode) {
      this.execute();
    } else {
      this.destroy();
    }
  }

  private injectStyle(): void {
    if (document.getElementById(DarkModeDecorator.STYLE_ID)) {
      return;
    }

    const style = document.createElement('style');
    style.id = DarkModeDecorator.STYLE_ID;
    style.textContent = this.buildFilterCSS();
    document.head.appendChild(style);
  }

  private removeStyle(): void {
    const el = document.getElementById(DarkModeDecorator.STYLE_ID);
    if (el) {
      el.remove();
    }
  }

  /**
   * Builds the CSS filter inversion stylesheet.
   *
   * Strategy (same as Dark Reader "Filter" engine):
   * 1. Invert + hue-rotate on <html> darkens the entire page in one rule.
   * 2. Re-apply the same filter on media elements to cancel the inversion
   *    and restore original colours.
   * 3. Print media query disables the filter so pages print normally.
   * 4. Some Skroutz-specific elements get explicit overrides where the
   *    generic inversion produces undesirable results.
   */
  private buildFilterCSS(): string {
    const html = DarkModeDecorator.CLASS_NAME;
    return [
      `html.${html} {`,
      `  filter: invert(1) hue-rotate(180deg) !important;`,
      `  background-color: #1e1e1e !important;`,
      `}`,
      '',
      `/* Restore media elements to original appearance */`,
      `html.${html} img,`,
      `html.${html} video,`,
      `html.${html} canvas,`,
      `html.${html} svg,`,
      `html.${html} [style*="background-image"],`,
      `html.${html} .product-image img,`,
      `html.${html} .sku-image,`,
      `html.${html} .image-gallery img,`,
      `html.${html} .category-image {`,
      `  filter: invert(1) hue-rotate(180deg) !important;`,
      `}`,
      '',
      `/* Utility class to opt-out specific elements from inversion */`,
      `html.${html} .resk-no-invert {`,
      `  filter: none !important;`,
      `}`,
      '',
      `/* Print — disable filter */`,
      `@media print {`,
      `  html.${html} {`,
      `    filter: none !important;`,
      `    background-color: #fff !important;`,
      `  }`,
      `  html.${html} img,`,
      `  html.${html} video,`,
      `  html.${html} canvas,`,
      `  html.${html} svg,`,
      `  html.${html} [style*="background-image"] {`,
      `    filter: none !important;`,
      `  }`,
      `}`,
    ].join('\n');
  }
}
