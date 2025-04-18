import { appendLogoChild } from '../functions/appendLogoChild';

export function appendCreditChild(element: HTMLDivElement | HTMLButtonElement) {
  const brand = document.createElement('div');
  const brandLink = document.createElement('a');

  brand.classList.add('icon-border', 'font-bold');

  const isFirefox = navigator.userAgent.toLowerCase().indexOf('firefox') > -1;
  const storeUrl = isFirefox
    ? 'https://addons.mozilla.org/en-US/firefox/addon/reskroutzed/reviews/'
    : 'https://chromewebstore.google.com/detail/reskroutzed/amglnkndjeoojnjjeepeheobhneeogcl';

  brandLink.href = storeUrl;
  brandLink.textContent = 'by reSkroutzed';
  brandLink.classList.add('icon-border', 'font-bold');

  brand.appendChild(brandLink);
  appendLogoChild(brand);

  element.appendChild(brand);
}
