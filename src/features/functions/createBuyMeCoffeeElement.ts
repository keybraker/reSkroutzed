import { DomClient } from '../../clients/dom/client';
import { Language } from '../../common/enums/Language.enum';

// Use chrome.runtime.getURL to resolve bundled asset paths in MV3
function getAssetUrl(path: string): string {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (chrome as any).runtime.getURL(path);
  } catch (e) {
    // Fallback for tests / non-extension environments
    return path;
  }
}

export function createBuyMeCoffeeElement(language: Language): HTMLDivElement {
  const buyMeCoffeeElement = document.createElement('div');
  buyMeCoffeeElement.classList.add('buy-me-coffee');

  const labelContainer = document.createElement('div');
  labelContainer.classList.add('buy-me-coffee-label-container');

  const coffeeLabel = document.createElement('span');
  coffeeLabel.classList.add('coffee-label');
  coffeeLabel.textContent = language === Language.GREEK ? 'Υποστήριξε με' : 'Support me';

  DomClient.appendElementToElement(coffeeLabel, labelContainer);

  const optionsContainer = document.createElement('div');
  optionsContainer.classList.add('buy-me-coffee-options');

  const paypalLink = document.createElement('a');
  paypalLink.href = 'https://paypal.me/tsiakkas';
  paypalLink.target = '_blank';
  paypalLink.rel = 'noopener noreferrer';
  paypalLink.classList.add('buy-me-coffee-option', 'paypal');
  // Add icon image
  const paypalImg = document.createElement('img');
  paypalImg.classList.add('payment-icon');
  paypalImg.alt = 'PayPal';
  // Prefer WebP asset, then SVG, then inline SVG data
  paypalImg.src = getAssetUrl('externalPaymentProviders/paypal_logo.webp');
  paypalImg.onerror = () => {
    // try SVG next, but add diagnostics and a retry for the original WebP
    paypalImg.onerror = null;
    const originalWebp = getAssetUrl('externalPaymentProviders/paypal_logo.webp');
    // attempt to fetch HEAD to surface status in the extension console if blocked
    try {
      if (typeof fetch === 'function') {
        fetch(originalWebp, { method: 'HEAD' })
          .then((res) => {
            // eslint-disable-next-line no-console
            console.warn(
              'paypal asset HEAD',
              originalWebp,
              res.status,
              res.headers.get('content-type'),
            );
          })
          .catch((err) => {
            // eslint-disable-next-line no-console
            console.warn('paypal asset HEAD failed', originalWebp, err);
          });
      }
    } catch (_) {
      // ignore environments without fetch
    }
    // try the SVG fallback path first
    paypalImg.src = getAssetUrl('externalPaymentProviders/paypal.svg');
    // also try cache-busting the original webp once if SVG fails
    paypalImg.addEventListener(
      'error',
      () => {
        const retry = originalWebp + '?_r=' + Date.now();
        paypalImg.src = retry;
        // final fallback to inline data SVG if retry fails
        const svg =
          "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' aria-hidden='true'><rect width='24' height='24' rx='12' fill='%23ffc439' /></svg>";
        paypalImg.addEventListener(
          'error',
          () => {
            paypalImg.src = 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
          },
          { once: true },
        );
      },
      { once: true },
    );
  };
  DomClient.appendElementToElement(paypalImg, paypalLink);
  // Inline SVG fallback (hidden by default, shown if image fails)
  const paypalSvgSpan = document.createElement('span');
  paypalSvgSpan.classList.add('payment-svg');
  paypalSvgSpan.innerHTML =
    "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' aria-hidden='true'><rect width='24' height='24' rx='12' fill='#ffc439' /></svg>";
  paypalSvgSpan.style.display = 'none';
  DomClient.appendElementToElement(paypalSvgSpan, paypalLink);
  paypalImg.addEventListener('load', () => {
    paypalSvgSpan.style.display = 'none';
    paypalImg.style.display = '';
  });
  paypalImg.addEventListener('error', () => {
    paypalImg.style.display = 'none';
    paypalSvgSpan.style.display = '';
  });
  // Add text label for accessibility
  const paypalText = document.createElement('span');
  paypalText.classList.add('payment-text');
  paypalText.textContent = 'PayPal';
  DomClient.appendElementToElement(paypalText, paypalLink);

  const revolutLink = document.createElement('a');
  revolutLink.href = 'https://revolut.me/keybraker';
  revolutLink.target = '_blank';
  revolutLink.rel = 'noopener noreferrer';
  revolutLink.classList.add('buy-me-coffee-option', 'revolut');
  const revolutImg = document.createElement('img');
  revolutImg.classList.add('payment-icon');
  revolutImg.alt = 'Revolut';
  revolutImg.src = getAssetUrl('externalPaymentProviders/revolut_logo.webp');
  revolutImg.onerror = () => {
    revolutImg.onerror = null;
    const originalWebp = getAssetUrl('externalPaymentProviders/revolut_logo.webp');
    try {
      if (typeof fetch === 'function') {
        fetch(originalWebp, { method: 'HEAD' })
          .then((res) => {
            // eslint-disable-next-line no-console
            console.warn(
              'revolut asset HEAD',
              originalWebp,
              res.status,
              res.headers.get('content-type'),
            );
          })
          .catch((err) => {
            // eslint-disable-next-line no-console
            console.warn('revolut asset HEAD failed', originalWebp, err);
          });
      }
    } catch (_) {
      // ignore
    }
    revolutImg.src = getAssetUrl('externalPaymentProviders/revolut.svg');
    revolutImg.addEventListener(
      'error',
      () => {
        const retry = originalWebp + '?_r=' + Date.now();
        revolutImg.src = retry;
        const svg =
          "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' aria-hidden='true'><rect width='24' height='24' rx='12' fill='%23627eea' /></svg>";
        revolutImg.addEventListener(
          'error',
          () => {
            revolutImg.src = 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
          },
          { once: true },
        );
      },
      { once: true },
    );
  };
  DomClient.appendElementToElement(revolutImg, revolutLink);
  const revolutSvgSpan = document.createElement('span');
  revolutSvgSpan.classList.add('payment-svg');
  revolutSvgSpan.innerHTML =
    "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' aria-hidden='true'><rect width='24' height='24' rx='12' fill='#627eea' /></svg>";
  revolutSvgSpan.style.display = 'none';
  DomClient.appendElementToElement(revolutSvgSpan, revolutLink);
  revolutImg.addEventListener('load', () => {
    revolutSvgSpan.style.display = 'none';
    revolutImg.style.display = '';
  });
  revolutImg.addEventListener('error', () => {
    revolutImg.style.display = 'none';
    revolutSvgSpan.style.display = '';
  });
  const revolutText = document.createElement('span');
  revolutText.classList.add('payment-text');
  revolutText.textContent = 'Revolut';
  DomClient.appendElementToElement(revolutText, revolutLink);

  DomClient.appendElementToElement(paypalLink, optionsContainer);
  DomClient.appendElementToElement(revolutLink, optionsContainer);
  DomClient.appendElementToElement(labelContainer, buyMeCoffeeElement);
  DomClient.appendElementToElement(optionsContainer, buyMeCoffeeElement);

  return buyMeCoffeeElement;
}
