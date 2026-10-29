import { DomClient } from '../../clients/dom/client';
import { Language } from '../../common/enums/Language.enum';

export function createReSkoutzedReviewElement(language: Language): HTMLDivElement {
  const reSkoutzedReviewElement = document.createElement('div');
  const reSkoutzedReviewLink = document.createElement('a');
  const reviewCopy = document.createElement('span');

  reSkoutzedReviewElement.classList.add('own-promotion');

  const row = document.createElement('div');
  row.className = 'store-availability-row own-promotion-row';

  const left = document.createElement('div');
  left.className = 'store-availability-left own-promotion-left';

  const right = document.createElement('div');
  right.className = 'store-availability-right own-promotion-right';

  const isFirefox = navigator.userAgent.toLowerCase().indexOf('firefox') > -1;
  const storeUrl = isFirefox
    ? 'https://addons.mozilla.org/en-US/firefox/addon/reskroutzed/reviews/'
    : 'https://chromewebstore.google.com/detail/reskroutzed/amglnkndjeoojnjjeepeheobhneeogcl';

  reSkoutzedReviewLink.href = storeUrl;
  reSkoutzedReviewLink.target = '_blank';
  reSkoutzedReviewLink.rel = 'noopener noreferrer';
  reSkoutzedReviewLink.classList.add('own-promotion-review-link');

  reviewCopy.className = 'own-promotion-review-copy';
  reviewCopy.textContent = language === Language.GREEK ? 'Αξιολόγησε <3' : 'Rate <3';

  DomClient.appendElementToElement(reviewCopy, reSkoutzedReviewLink);
  DomClient.appendElementToElement(reSkoutzedReviewLink, left);

  row.appendChild(left);
  row.appendChild(right);
  reSkoutzedReviewElement.appendChild(row);

  return reSkoutzedReviewElement;
}
