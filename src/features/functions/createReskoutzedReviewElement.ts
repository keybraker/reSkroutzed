import { DomClient } from '../../clients/dom/client';
import { createLogoElement } from './createLogoElement';

export function createReSkoutzedReviewElement(): HTMLDivElement {
  const reSkoutzedReviewElement = document.createElement('div');
  const reSkoutzedReviewLink = document.createElement('a');

  reSkoutzedReviewElement.classList.add('reskroutzed-tag', 'icon-border', 'font-bold');

  const isFirefox = navigator.userAgent.toLowerCase().indexOf('firefox') > -1;
  const storeUrl = isFirefox
    ? 'https://addons.mozilla.org/en-US/firefox/addon/reskroutzed/reviews/'
    : 'https://chromewebstore.google.com/detail/reskroutzed/amglnkndjeoojnjjeepeheobhneeogcl';

  reSkoutzedReviewLink.href = storeUrl;
  reSkoutzedReviewLink.target = '_blank';
  reSkoutzedReviewLink.rel = 'noopener noreferrer';
  reSkoutzedReviewLink.textContent = 'By reSkroutzed';
  reSkoutzedReviewLink.classList.add('icon-border', 'font-bold');

  DomClient.appendElementToElement(reSkoutzedReviewLink, reSkoutzedReviewElement);
  const icon = createLogoElement();
  DomClient.appendElementToElement(icon, reSkoutzedReviewElement);

  return reSkoutzedReviewElement;
}
