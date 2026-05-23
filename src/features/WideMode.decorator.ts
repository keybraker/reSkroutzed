import { State } from '../common/types/State.type';
import { FeatureInstance } from './common/FeatureInstance';

export class WideModeDecorator implements FeatureInstance {
  private state: State;

  constructor(state: State) {
    this.state = state;
  }

  public execute(): void {
    if (document.getElementById('resk-wide-mode-style')) return;

    const style = document.createElement('style');
    style.id = 'resk-wide-mode-style';
    style.textContent = this.getStyleContent();
    document.head.appendChild(style);

    this.apply();
  }

  public destroy(): void {
    const style = document.getElementById('resk-wide-mode-style');
    if (style) {
      style.remove();
    }

    document.body.classList.remove('resk-wide-mode');
  }

  public visibilityUpdate(): void {
    const style = document.getElementById('resk-wide-mode-style');

    if (this.state.wideMode) {
      if (!style) {
        const newStyle = document.createElement('style');
        newStyle.id = 'resk-wide-mode-style';
        newStyle.textContent = this.getStyleContent();
        document.head.appendChild(newStyle);
      }
      document.body.classList.add('resk-wide-mode');
    } else {
      if (style) {
        style.remove();
      }
      document.body.classList.remove('resk-wide-mode');
    }
  }

  private apply(): void {
    if (this.state.wideMode) {
      document.body.classList.add('resk-wide-mode');
    } else {
      document.body.classList.remove('resk-wide-mode');
    }
  }

  private getStyleContent(): string {
    return `
      .resk-wide-mode .content {
        max-width: 80% !important;
      }
      .resk-wide-mode .main-content {
        max-width: 80% !important;
      }
      .resk-wide-mode .listing-list {
        max-width: 80% !important;
      }
      .resk-wide-mode .page-title-wrapper {
        max-width: 80% !important;
      }
      .resk-wide-mode .controls-wrapper {
        max-width: 80% !important;
      }
      .resk-wide-mode .filter-tags-wrapper {
        max-width: 80% !important;
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
        max-width: 80% !important;
      }
      .resk-wide-mode .sticky-wrapper {
        max-width: 80% !important;
      }
      .resk-wide-mode #sku-list {
        max-width: 80% !important;
      }
      .resk-wide-mode .site-header .content {
        max-width: 80% !important;
      }
    `;
  }
}
