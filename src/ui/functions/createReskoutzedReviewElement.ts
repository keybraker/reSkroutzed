import { DomClient } from '../../clients/dom/client';
import { createLogoElement } from './createLogoElement';

export function createReskoutzedReviewElement(): HTMLDivElement {
  const reskoutzedReviewElement = document.createElement('div');
  const reskoutzedLink = document.createElement('a');

  reskoutzedReviewElement.classList.add('icon-border', 'font-bold');

  const isFirefox = navigator.userAgent.toLowerCase().indexOf('firefox') > -1;
  const storeUrl = isFirefox
    ? 'https://addons.mozilla.org/en-US/firefox/addon/reskroutzed/reviews/'
    : 'https://chromewebstore.google.com/detail/reskroutzed/amglnkndjeoojnjjeepeheobhneeogcl';

  reskoutzedLink.href = storeUrl;
  reskoutzedLink.textContent = 'by reSkroutzed';
  reskoutzedLink.classList.add('icon-border', 'font-bold');

  reskoutzedReviewElement.appendChild(reskoutzedLink);
  const icon = createLogoElement();
  DomClient.appendElementToElement(icon, reskoutzedReviewElement);

  return reskoutzedReviewElement;
}
