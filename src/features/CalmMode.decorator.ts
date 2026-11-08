import { State } from '../common/types/State.type';
import { FeatureInstance } from './common/FeatureInstance';

/**
 * Calm mode removes the infinite-scroll feed from the Skroutz homepage.
 *
 * Only the Greek main page (`https://www.skroutz.gr/`) is affected — other
 * storefronts and every other page keep their native layout.
 *
 * The target is the whole `<main data-controller="infinite-scroll">` element.
 * Everything around it (the search wrapper, "Δημοφιλείς αναζητήσεις",
 * "Δημοφιλείς αναζητήσεις & κατασκευαστές", the tags group and the footer)
 * is a sibling of that element and stays untouched.
 */
export class CalmModeDecorator implements FeatureInstance {
  private static readonly STYLE_ID = 'resk-calm-mode-style';
  private static readonly HOMEPAGE_HOSTNAME = 'www.skroutz.gr';

  private static readonly FEED_SELECTOR = 'main[data-controller~="infinite-scroll"]';

  constructor(private readonly state: State) {}

  /**
   * Whether the current page is the Skroutz homepage.
   */
  public static isHomepage(): boolean {
    return (
      window.location.hostname === CalmModeDecorator.HOMEPAGE_HOSTNAME &&
      window.location.pathname === '/'
    );
  }

  /**
   * Applies calm mode when enabled on the homepage, otherwise removes it.
   * Call this from the popup toggle handler and the universal toggle.
   */
  public execute(): void {
    if (this.state.calmMode && CalmModeDecorator.isHomepage()) {
      this.injectStyle();
    } else {
      this.removeStyle();
    }
  }

  /** Alias kept for parity with the other feature decorators. */
  public sync(): void {
    this.execute();
  }

  /**
   * Removes the calm-mode stylesheet.
   * Safe to call even if calm mode was never enabled.
   */
  public destroy(): void {
    this.removeStyle();
  }

  private injectStyle(): void {
    if (document.getElementById(CalmModeDecorator.STYLE_ID)) {
      return;
    }

    const style = document.createElement('style');
    style.id = CalmModeDecorator.STYLE_ID;
    style.textContent = `${CalmModeDecorator.FEED_SELECTOR} { display: none !important; }`;
    document.head.appendChild(style);
  }

  private removeStyle(): void {
    const el = document.getElementById(CalmModeDecorator.STYLE_ID);
    if (el) {
      el.remove();
    }
  }
}
