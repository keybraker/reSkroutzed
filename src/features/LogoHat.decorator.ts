import { FeatureInstance } from './common/FeatureInstance';

/**
 * Decorator that adds a festive hat to the Skroutz logo
 * All styling is included inline to eliminate the need for an external CSS file
 */
export class LogoHatDecorator implements FeatureInstance {
  constructor() {}

  public execute(): void {
    const logoLink = document.querySelector('h1 a#index-link');

    if (!logoLink) {
      return;
    }

    const wrapper = document.createElement('div');
    wrapper.style.position = 'relative';
    wrapper.style.display = 'inline-block';

    const hat = document.createElement('img');
    hat.src = chrome.runtime.getURL('icons/48.png');
    hat.alt = 'reSkroutzed hat';

    this.applyHatStyles(hat);

    window.matchMedia('(max-width: 767px)').addEventListener('change', () => {
      this.applyHatStyles(hat);
    });

    const observer = new MutationObserver((_mutations, _obs) => {
      if (!document.contains(wrapper)) {
        this.addHatToLogo(logoLink, wrapper, hat);
      }
    });

    observer.observe(document.body, { childList: true, subtree: true });

    this.addHatToLogo(logoLink, wrapper, hat);
  }

  private addHatToLogo(logoLink: Element, wrapper: HTMLDivElement, hat: HTMLImageElement): void {
    const logoParent = logoLink.parentElement;
    if (!logoParent) {
      return;
    }

    logoParent.insertBefore(wrapper, logoLink);
    wrapper.appendChild(logoLink);
    wrapper.appendChild(hat);
  }

  private applyHatStyles(hat: HTMLImageElement): void {
    const isMobile = window.matchMedia('(max-width: 767px)').matches;

    hat.style.position = 'absolute';
    hat.style.top = isMobile ? '-4px' : '0px';
    hat.style.left = isMobile ? '6px' : '12px';
    hat.style.width = isMobile ? '18px' : '20px';
    hat.style.height = isMobile ? '18px' : '20px';
    hat.style.transform = 'rotate(-15deg)';
    hat.style.zIndex = '10';
    hat.style.pointerEvents = 'none';
  }
}
