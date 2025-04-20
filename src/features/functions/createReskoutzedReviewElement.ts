import { DomClient } from '../../clients/dom/client';
import { createLogoElement } from './createLogoElement';

export function createReskoutzedReviewElement(): HTMLDivElement {
  const reskoutzedReviewElement = document.createElement('div');
  const reskoutzedReviewLink = document.createElement('a');

  reskoutzedReviewElement.classList.add('reskroutzed-tag', 'icon-border', 'font-bold');

  const isFirefox = navigator.userAgent.toLowerCase().indexOf('firefox') > -1;
  const storeUrl = isFirefox
    ? 'https://addons.mozilla.org/en-US/firefox/addon/reskroutzed/reviews/'
    : 'https://chromewebstore.google.com/detail/reskroutzed/amglnkndjeoojnjjeepeheobhneeogcl';

  reskoutzedReviewLink.href = storeUrl;
  reskoutzedReviewLink.target = '_blank';
  reskoutzedReviewLink.rel = 'noopener noreferrer';
  reskoutzedReviewLink.textContent = 'by reSkroutzed';
  reskoutzedReviewLink.classList.add('icon-border', 'font-bold');

  DomClient.appendElementToElement(reskoutzedReviewLink, reskoutzedReviewElement);
  const icon = createLogoElement();
  DomClient.appendElementToElement(icon, reskoutzedReviewElement);

  return reskoutzedReviewElement;
}
