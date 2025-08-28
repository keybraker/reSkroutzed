import { DomClient } from '../../clients/dom/client';
import { ProductPriceHistory } from '../../clients/skroutz/client';
import { Language } from '../enums/Language.enum';
import { getLocaleForLanguage, translate } from '../utils/translations';

interface PricePoint {
  x: number;
  y: number;
  price: number;
  store: string;
  timestamp: number;
}
interface PriceHistoryCanvas extends HTMLCanvasElement {
  _points?: PricePoint[];
}

export function PriceHistoryComponent(
  currentPriceState: 'expensive' | 'cheap' | 'normal',
  productPriceHistory: ProductPriceHistory,
  language: Language,
): HTMLElement {
  const wrapper = DomClient.createElement('div', {
    className: 'price-history-wrapper',
  });

  const row = DomClient.createElement('div', {
    className: ['price-history-row', 'info-with-analysis-row'],
  });

  const labelSpan = document.createElement('span');
  labelSpan.className = 'price-history-label';
  labelSpan.textContent = translate(`priceHistory.${currentPriceState}`, language);
  DomClient.appendElementToElement(labelSpan, row);

  const containerId = `price-history-container-${Math.random().toString(36).slice(2, 8)}`;
  const toggleButton = DomClient.createElement('button', {
    className: ['analysis-toggle-button', 'price-history-toggle-button'],
  }) as HTMLButtonElement;
  toggleButton.type = 'button';
  toggleButton.setAttribute('aria-expanded', 'false');
  toggleButton.setAttribute('aria-controls', containerId);

  const btnText = document.createElement('span');
  btnText.textContent = language === Language.GREEK ? 'Εξέλιξη τιμής' : 'Price history';

  const iconSpan = document.createElement('span');
  iconSpan.className = 'analysis-icon';
  iconSpan.innerHTML =
    '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="4 14 8 10 12 14 20 6"/><polyline points="4 6 4 14 12 14"/></svg>';
  toggleButton.appendChild(btnText);
  toggleButton.appendChild(iconSpan);

  DomClient.appendElementToElement(toggleButton, row);

  const priceHistoryContainer = DomClient.createElement('div', {
    className: 'price-history-container',
  });
  (priceHistoryContainer as HTMLDivElement).id = containerId;
  priceHistoryContainer.classList.remove('visible');
  const canvas = document.createElement('canvas') as PriceHistoryCanvas;
  canvas.className = 'price-history-canvas';
  canvas.width = 700;
  canvas.height = 200;
  const ctx = canvas.getContext('2d')!;
  const padding = 50;
  const width = canvas.width;
  const height = canvas.height;

  const prices = productPriceHistory.allPrices || [];
  if (!prices.length) {
    ctx.fillStyle = '#999';
    ctx.font = '14px sans-serif';
    const noDataMsg = language === Language.GREEK ? 'Δεν υπάρχουν δεδομένα' : 'No price data';
    ctx.fillText(noDataMsg, 20, height / 2);
  } else {
    const minPrice = Math.min(...prices.map((p) => p.value));
    const maxPrice = Math.max(...prices.map((p) => p.value));
    const priceRange = maxPrice - minPrice || 1;
    const priceSteps = 5;
    const stepValue = priceRange / (priceSteps - 1);
    const xStep = prices.length > 1 ? (width - 2 * padding) / (prices.length - 1) : 0;

    const rootStyle = getComputedStyle(document.documentElement);
    const fallback = (v: string, fb: string): string => (v && v.trim().length ? v.trim() : fb);
    const gridColor = fallback(rootStyle.getPropertyValue('--price-history-grid-color'), '#333');
    const textColor = fallback(rootStyle.getPropertyValue('--price-history-text-color'), '#eee');
    const textSecondary = fallback(
      rootStyle.getPropertyValue('--price-history-text-secondary'),
      '#bbb',
    );
    const lineColor = fallback(rootStyle.getPropertyValue('--price-history-line-color'), '#0af');

    ctx.strokeStyle = gridColor;
    ctx.fillStyle = textColor;
    ctx.lineWidth = 1;
    ctx.font = '14px sans-serif';
    for (let i = 0; i < priceSteps; i++) {
      const price = minPrice + stepValue * i;
      const y = height - padding - ((price - minPrice) / priceRange) * (height - padding * 2);
      ctx.beginPath();
      ctx.moveTo(padding, y);
      ctx.lineTo(width - padding, y);
      ctx.stroke();
      ctx.fillText(`${price.toFixed(2)}€`, 5, y + 5);
    }

    ctx.fillStyle = textSecondary;
    ctx.font = '12px sans-serif';
    prices.forEach((p, i) => {
      if (i % Math.max(1, Math.floor(prices.length / 6)) === 0 || i === prices.length - 1) {
        const x = padding + i * xStep;
        const date = new Date(p.timestamp).toLocaleDateString(getLocaleForLanguage(language));
        ctx.fillText(date, x - 30, height - padding + 20);
      }
    });

    ctx.strokeStyle = lineColor;
    ctx.lineWidth = 2;
    ctx.beginPath();
    const points: PricePoint[] = [];
    prices.forEach((p, i) => {
      const x = padding + i * xStep;
      const y = height - padding - ((p.value - minPrice) / priceRange) * (height - padding * 2);
      points.push({ x, y, price: p.value, store: p.shop_name ?? '', timestamp: p.timestamp });
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();

    ctx.fillStyle = lineColor;
    points.forEach((pt) => {
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, 3, 0, Math.PI * 2);
      ctx.fill();
    });

    canvas._points = points;
  }

  const tooltip = DomClient.createElement('div', { className: 'price-history-tooltip' });
  DomClient.appendElementToElement(tooltip, priceHistoryContainer);

  canvas.addEventListener('mousemove', (e) => {
    const points: PricePoint[] = canvas._points || [];
    if (!points.length) return;
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const closestPoint = points.reduce((prev, curr) =>
      Math.abs(curr.x - mouseX) < Math.abs(prev.x - mouseX) ? curr : prev,
    );
    const date = new Date(closestPoint.timestamp).toLocaleDateString(
      getLocaleForLanguage(language),
      { day: '2-digit', month: '2-digit', year: '2-digit' },
    );
    tooltip.textContent = `${date}: ${closestPoint.price.toFixed(2)}€, ${closestPoint.store}`;
    tooltip.classList.add('visible');

    const midpoint = canvas.width / 2;
    const tooltipWidth = (tooltip as HTMLDivElement).offsetWidth || 140;
    let left: number;
    if (mouseX > midpoint) {
      left = mouseX - tooltipWidth - 12;
    } else {
      left = mouseX + 12;
    }
    left = Math.max(0, Math.min(left, canvas.width - tooltipWidth));
    tooltip.style.left = `${left}px`;

    const tooltipHeight = (tooltip as HTMLDivElement).offsetHeight || 24;
    let top = mouseY - tooltipHeight - 12;
    if (top < 0) top = mouseY + 12;
    if (top + tooltipHeight > canvas.height) top = canvas.height - tooltipHeight - 4;
    tooltip.style.top = `${top}px`;
    tooltip.classList.add('visible');
  });
  canvas.addEventListener('mouseleave', () => {
    tooltip.classList.remove('visible');
  });

  DomClient.appendElementToElement(canvas, priceHistoryContainer);
  toggleButton.addEventListener('click', () => {
    const willShow = !priceHistoryContainer.classList.contains('visible');
    priceHistoryContainer.classList.toggle('visible', willShow);
    toggleButton.classList.toggle('expanded', willShow);
    toggleButton.setAttribute('aria-expanded', String(willShow));
  });

  DomClient.appendElementToElement(row, wrapper);
  DomClient.appendElementToElement(priceHistoryContainer, wrapper);

  return wrapper;
}
