import { DomClient } from '../../clients/dom/client';
import { Language } from '../../common/enums/Language.enum';
import { createLogoElement } from './createLogoElement';

export function createReSkoutzedReviewElement(language: Language): HTMLDivElement {
  const reSkoutzedReviewElement = document.createElement('div');
  const reSkoutzedReviewLink = document.createElement('a');
  const prefixText = document.createElement('span');
  const brandName = document.createElement('strong');
  const reviewCopy = document.createElement('span');
  const logoSlot = document.createElement('span');

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
  reSkoutzedReviewLink.classList.add('icon-border', 'own-promotion-review-link');

  prefixText.className = 'own-promotion-review-prefix';
  prefixText.textContent = language === Language.ENGLISH ? 'By' : '';

  reviewCopy.className = 'own-promotion-review-copy';

  const icon = createLogoElement();
  icon.classList.remove('icon-border');
  icon.classList.add('own-promotion-brand-logo');

  logoSlot.className = 'own-promotion-brand-logo-slot';

  brandName.textContent = 'reSkroutzed';
  DomClient.appendElementToElement(prefixText, reviewCopy);
  DomClient.appendElementToElement(brandName, reviewCopy);
  DomClient.appendElementToElement(reviewCopy, reSkoutzedReviewLink);

  DomClient.appendElementToElement(icon, logoSlot);
  DomClient.appendElementToElement(logoSlot, reSkoutzedReviewLink);

  DomClient.appendElementToElement(reSkoutzedReviewLink, left);

  row.appendChild(left);
  row.appendChild(right);
  reSkoutzedReviewElement.appendChild(row);

  return reSkoutzedReviewElement;
}
