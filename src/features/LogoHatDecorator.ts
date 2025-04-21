import { FeatureInstance } from './common/FeatureInstance';

import '../css/logoHat.css';

export class LogoHatDecorator implements FeatureInstance {
  constructor() {}

  public execute(): void {
    const logoLink = document.querySelector('h1 a#index-link');

    if (!logoLink) {
      return;
    }

    const wrapper = document.createElement('div');
    wrapper.className = 'logo-hat-wrapper';

    const hat = document.createElement('img');
    hat.src = chrome.runtime.getURL('icons/48.png');
    hat.alt = 'reSkroutzed hat';
    hat.className = 'logo-hat-image';

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
