import { State } from '../common/types/State.type';
import { FeatureInstance } from './common/FeatureInstance';

export class WideModeDecorator implements FeatureInstance {
  private static readonly STYLE_ID = 'resk-wide-mode-style';
  private static readonly CLASS_NAME = 'resk-wide-mode';

  constructor(private readonly state: State) {}

  /**
   * Injects the wide-mode stylesheet and applies the body class.
   * Idempotent — safe to call multiple times.
   */
  public execute(): void {
    this.injectStyle();
    document.body.classList.add(WideModeDecorator.CLASS_NAME);
  }

  /**
   * Removes the wide-mode body class and stylesheet.
   * Safe to call even if wide mode was never enabled.
   */
  public destroy(): void {
    document.body.classList.remove(WideModeDecorator.CLASS_NAME);
    this.removeStyle();
  }

  /**
   * Enables or disables wide mode based on current state.
   * Call this from the popup toggle handler.
   */
  public sync(): void {
    if (this.state.wideMode) {
      this.execute();
    } else {
      this.destroy();
    }
  }

  private injectStyle(): void {
    if (document.getElementById(WideModeDecorator.STYLE_ID)) {
      return;
    }

    const style = document.createElement('style');
    style.id = WideModeDecorator.STYLE_ID;
    style.textContent = this.getStyleContent();
    document.head.appendChild(style);
  }

  private removeStyle(): void {
    const el = document.getElementById(WideModeDecorator.STYLE_ID);
    if (el) {
      el.remove();
    }
  }

  private getStyleContent(): string {
    return `
      @media (min-width: 1600px) {
      .resk-wide-mode .content {
        max-width: 80% !important;
      }
      .resk-wide-mode .main-content {
        width: auto !important;
      }
      .resk-wide-mode .listing-list {
        width: auto !important;
      }
      .resk-wide-mode .page-title-wrapper {
        width: auto !important;
      }
      .resk-wide-mode .controls-wrapper {
        width: auto !important;
      }
      .resk-wide-mode .filter-tags-wrapper {
        width: auto !important;
      }
      .resk-wide-mode .top-section {
        max-width: 80% !important;
      }
      .resk-wide-mode .main-sidebar {
        max-width: 80% !important;
      }
      .resk-wide-mode .sidebar-overlay {
        max-width: 80% !important;
      }
      .resk-wide-mode footer .content {
        max-width: 80% !important;
      }
      .resk-wide-mode .content-scrollable {
        max-width: none !important;
      }
      .resk-wide-mode .sticky-wrapper {
        max-width: none !important;
      }
      .resk-wide-mode #sku-list {
        width: auto !important;
      }
      .resk-wide-mode .site-header .content {
        max-width: 80% !important;
      }
      .resk-wide-mode .simple-description {
        max-width: none !important;
        width: auto !important;
      }
      .resk-wide-mode .js-description-html {
        max-width: none !important;
        width: auto !important;
      }
      .resk-wide-mode .review-body {
        max-width: none !important;
        width: auto !important;
      }
      .resk-wide-mode .js-review-body-content {
        max-width: none !important;
        width: auto !important;
      }
      .resk-wide-mode .js-slidable {
        max-width: none !important;
        width: auto !important;
      }
      .resk-wide-mode .tl-shelf {
        max-width: none !important;
        width: auto !important;
      }
      .resk-wide-mode .tl-shelf-content {
        max-width: none !important;
        width: auto !important;
      }
      .resk-wide-mode .tl-shelf-wrapper {
        max-width: none !important;
        width: auto !important;
      }
      .resk-wide-mode .js-timeline-card {
        max-width: none !important;
        width: auto !important;
      }
      .resk-wide-mode .navigation-menu {
        max-width: none !important;
        width: auto !important;
      }
      .resk-wide-mode .scrollable {
        max-width: none !important;
        width: auto !important;
      }
      .resk-wide-mode .tiles-shelf {
        max-width: none !important;
        width: auto !important;
      }
      .resk-wide-mode .timeline-card {
        max-width: none !important;
        width: auto !important;
      }
      .resk-wide-mode .tracking-img-container {
        max-width: none !important;
        width: auto !important;
      }
      .resk-wide-mode .details-wrapper {
        display: flex !important;
        flex-direction: column !important;
        align-items: center !important;
      }
      .resk-wide-mode .rich-components {
        display: flex !important;
        flex-direction: column !important;
        align-items: center !important;
      }
      .resk-wide-mode .rich-components .inner-item {
        align-self: center !important;
      }
      }
    `;
  }
}
