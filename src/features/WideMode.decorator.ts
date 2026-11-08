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
        /*
         * Skroutz caps main layout containers at 1500px. Wide mode raises the
         * cap, but keeps a viewport-relative gutter so ultrawides do not turn
         * product cards into giant tiles and leave no breathing room.
         */
        .resk-wide-mode .content:not(.specs-container) {
          width: min(3040px, calc(100% - clamp(48px, 4vw, 192px))) !important;
          max-width: min(3040px, calc(100% - clamp(48px, 4vw, 192px))) !important;
        }

        /*
         * These already fill their parent once .content is widened, so drop
         * any Skroutz max-width that would keep them narrow.
         */
        .resk-wide-mode .main-content,
        .resk-wide-mode .listing-list,
        .resk-wide-mode .page-title-wrapper,
        .resk-wide-mode .controls-wrapper,
        .resk-wide-mode .filter-tags-wrapper,
        .resk-wide-mode #sku-list {
          width: auto !important;
          max-width: none !important;
        }

        /*
         * Skroutz pins the listing to four columns from 1326px up. Let the
         * grid add columns as the content widens while keeping card sizes
         * near the native 250-290px range.
         */
        .resk-wide-mode .listing-list {
          grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)) !important;
        }

        /*
         * Long-form areas keep a comfortable reading measure. The native
         * review body (910px) and specs container (1070px) caps are left
         * untouched on purpose.
         */
        .resk-wide-mode .reviews-container.content,
        .resk-wide-mode .reviews-aggregation.content,
        .resk-wide-mode .qna-sku-section.content {
          width: min(1500px, calc(100% - clamp(48px, 4vw, 192px))) !important;
          max-width: min(1500px, calc(100% - clamp(48px, 4vw, 192px))) !important;
          margin-inline: auto !important;
        }

        .resk-wide-mode .reviews-ai-summary {
          max-width: 1070px !important;
          margin-inline: auto !important;
        }
      }
    `;
  }
}
