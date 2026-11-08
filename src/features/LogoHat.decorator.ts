import { onBodyMutations } from '../common/functions/bodyMutationObserver';
import { FeatureInstance } from './common/FeatureInstance';

/**
 * Decorator that adds a festive hat to the Skroutz logo
 * All styling is included inline to eliminate the need for an external CSS file
 */
export class LogoHatDecorator implements FeatureInstance {
  private hat: HTMLImageElement | null = null;
  private viewportQuery: MediaQueryList | null = null;
  private unsubscribeFromMutations: (() => void) | null = null;

  private readonly handleViewportChange = (): void => {
    if (this.hat) {
      this.applyHatStyles(this.hat);
    }
  };

  public execute(): void {
    const logoLink = document.querySelector('h1 a#index-link');

    if (!logoLink) {
      return;
    }

    const wrapper = document.createElement('div');
    wrapper.style.display = 'inline-flex';
    wrapper.style.alignItems = 'center';

    const hat = document.createElement('img');
    hat.src = chrome.runtime.getURL('icons/48.png');
    hat.alt = 'reSkroutzed hat';

    this.applyHatStyles(hat);
    this.hat = hat;

    this.viewportQuery = window.matchMedia('(max-width: 767px)');
    this.viewportQuery.addEventListener('change', this.handleViewportChange);

    this.unsubscribeFromMutations = onBodyMutations(() => {
      if (document.contains(wrapper)) {
        return;
      }

      // The header may have been re-rendered with a brand new logo link, so look
      // the current one up instead of reusing the element we were given.
      const currentLogoLink = document.querySelector('h1 a#index-link');
      if (currentLogoLink) {
        this.addHatToLogo(currentLogoLink, wrapper, hat);
      }
    });

    this.addHatToLogo(logoLink, wrapper, hat);
  }

  public destroy(): void {
    this.unsubscribeFromMutations?.();
    this.unsubscribeFromMutations = null;

    this.viewportQuery?.removeEventListener('change', this.handleViewportChange);
    this.viewportQuery = null;
    this.hat = null;
  }

  private addHatToLogo(logoLink: Element, wrapper: HTMLDivElement, hat: HTMLImageElement): void {
    const logoParent = logoLink.parentElement;

    // The link is still inside a detached wrapper; wait for the header to render
    // a new link rather than nesting the wrapper inside itself.
    if (!logoParent || logoParent === wrapper) {
      return;
    }

    wrapper.replaceChildren();
    logoParent.insertBefore(wrapper, logoLink);
    wrapper.appendChild(hat);
    wrapper.appendChild(logoLink);
  }

  private applyHatStyles(hat: HTMLImageElement): void {
    const isMobile = window.matchMedia('(max-width: 767px)').matches;

    hat.style.position = 'relative';
    hat.style.top = isMobile ? '-9px' : '-12px';
    hat.style.marginRight = isMobile ? '-9px' : '-12px';
    hat.style.width = isMobile ? '18px' : '20px';
    hat.style.height = isMobile ? '18px' : '20px';
    hat.style.transform = 'rotate(-15deg)';
    hat.style.pointerEvents = 'none';
    hat.style.flexShrink = '0';
  }
}
