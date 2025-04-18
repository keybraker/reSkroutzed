import { Language } from '../common/enums/Language.enum';
import { appendLogoChild } from './appendLogoChild';

export function addDeveloperSupportToElement(
  element: HTMLDivElement | HTMLButtonElement,
  language: Language,
) {
  const brand = document.createElement('div');
  const brandLink = document.createElement('a');

  brand.classList.add('support-developer', 'icon-border', 'font-bold');

  brandLink.href = 'https://paypal.me/tsiakkas';
  brandLink.target = '_blank'; // Open in new tab
  brandLink.rel = 'noopener noreferrer'; // Security best practice for external links
  if (language === Language.GREEK) {
    brandLink.textContent = 'ReSkroutzed';
  } else {
    brandLink.textContent = 'ReSkroutzed';
  }
  brandLink.classList.add('icon-border', 'font-bold');

  brand.appendChild(brandLink);
  appendLogoChild(brand);

  element.appendChild(brand);
}
