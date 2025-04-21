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

    hat.style.position = 'absolute';
    hat.style.top = '-6px';
    hat.style.left = '-10px';
    hat.style.width = '20px';
    hat.style.height = '20px';
    hat.style.transform = 'rotate(-15deg)';
    hat.style.zIndex = '10';
    hat.style.pointerEvents = 'none';

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
}
