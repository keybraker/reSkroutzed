import { DomClient } from '../../clients/dom/client';
import { Language } from '../../common/enums/Language.enum';
import { createLogoElement } from './createLogoElement';

export function createReSkoutzedReviewElement(language: Language): HTMLDivElement {
  const reSkoutzedReviewElement = document.createElement('div');
  const reSkoutzedReviewLink = document.createElement('a');

  // Use the own-promotion outline so this appears as the top/start
  reSkoutzedReviewElement.classList.add('own-promotion');

  // Create a horizontal row and split into 3/4 (left) and 1/4 (right)
  const row = document.createElement('div');
  row.className = 'store-availability-row';

  const left = document.createElement('div');
  left.className = 'store-availability-left';

  const right = document.createElement('div');
  right.className = 'store-availability-right';

  const isFirefox = navigator.userAgent.toLowerCase().indexOf('firefox') > -1;
  const storeUrl = isFirefox
    ? 'https://addons.mozilla.org/en-US/firefox/addon/reskroutzed/reviews/'
    : 'https://chromewebstore.google.com/detail/reskroutzed/amglnkndjeoojnjjeepeheobhneeogcl';

  reSkoutzedReviewLink.href = storeUrl;
  reSkoutzedReviewLink.target = '_blank';
  reSkoutzedReviewLink.rel = 'noopener noreferrer';
  reSkoutzedReviewLink.textContent =
    language === Language.ENGLISH
      ? 'By reSkroutzed — Leave a review'
      : 'Από το reSkroutzed — Αφήστε μια κριτική';
  reSkoutzedReviewLink.classList.add('icon-border', 'font-bold');

  // Place the link and logo on the right side; left is reserved for the "buy me a coffee" element
  const icon = createLogoElement();
  const rightContent = document.createElement('div');
  rightContent.style.display = 'flex';
  rightContent.style.alignItems = 'center';
  rightContent.style.gap = '8px';
  DomClient.appendElementToElement(reSkoutzedReviewLink, rightContent);
  DomClient.appendElementToElement(icon, rightContent);
  DomClient.appendElementToElement(rightContent, right);

  row.appendChild(left);
  row.appendChild(right);
  reSkoutzedReviewElement.appendChild(row);

  return reSkoutzedReviewElement;
}
