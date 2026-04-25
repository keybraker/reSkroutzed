import { DomClient } from '../../clients/dom/client';

export function createLogoElement(): HTMLDivElement {
  const icon = document.createElement('div');

  icon.classList.add('align-center', 'icon-border');

  const img = document.createElement('img');
  // img.src = chrome.runtime.getURL('icons/128.png');
  img.src = 'https://raw.githubusercontent.com/keybraker/reskroutzed/main/icons/128.png';
  img.alt = 'reSkroutzed';
  img.width = 18;
  img.height = 18;
  img.classList.add('logo-image');

  DomClient.appendElementToElement(img, icon);

  return icon;
}
