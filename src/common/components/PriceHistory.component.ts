import { DomClient } from '../../clients/dom/client';
import { ProductPriceHistory } from '../../clients/skroutz/client';
import { Language } from '../enums/Language.enum';

export function PriceHistoryComponent(
  currentPriceState: 'expensive' | 'cheap' | 'normal',
  productPriceHistory: ProductPriceHistory,
  language: Language,
): HTMLElement {
  const wrapper = DomClient.createElement('div', {
    className: 'price-history-wrapper',
  });

  const header = DomClient.createElement('div', {
    className: 'price-history-header',
  });

  const getLabel = (english: string, greek: string): string =>
    language === Language.ENGLISH ? english : greek;

  header.textContent = getLabel(
    currentPriceState === 'cheap'
      ? 'Good price compared to historical price'
      : currentPriceState === 'normal'
        ? 'Average price compared to historical price'
        : 'High price compared to historical price',
    currentPriceState === 'cheap'
      ? 'Καλή τιμή σε σχέση με το τελευταίο εξάμηνο'
      : currentPriceState === 'normal'
        ? 'Κανονική τιμή σε σχέση με το τελευταίο εξάμηνο'
        : 'Υψηλή τιμή σε σχέση με το τελευταίο εξάμηνο',
  );
  const toggleIcon = DomClient.createElement('span', {
    className: 'toggle-icon',
  });
  toggleIcon.textContent = '▼';
  DomClient.appendElementToElement(toggleIcon, header);

  const priceHistoryContainer = DomClient.createElement('div', {
    className: 'price-history-container',
  });
  const canvas = document.createElement('canvas') as HTMLCanvasElement;
  canvas.className = 'price-history-canvas';
  canvas.width = 700;
  canvas.height = 200;
  const ctx = canvas.getContext('2d')!;
  const padding = 50;
  const width = canvas.width;
  const height = canvas.height;

  const minPrice = Math.min(...productPriceHistory.allPrices.map((p) => p.value));
  const maxPrice = Math.max(...productPriceHistory.allPrices.map((p) => p.value));
  const priceSteps = 5;
  const stepValue = (maxPrice - minPrice) / (priceSteps - 1);
  const xStep = (width - 2 * padding) / (productPriceHistory.allPrices.length - 1);

  const computedStyle = getComputedStyle(document.documentElement);
  const gridColor = computedStyle.getPropertyValue('--price-history-grid-color').trim();
  const textColor = computedStyle.getPropertyValue('--price-history-text-color').trim();
  const textSecondary = computedStyle.getPropertyValue('--price-history-text-secondary').trim();
  const lineColor = computedStyle.getPropertyValue('--price-history-line-color').trim();

  ctx.strokeStyle = gridColor;
  ctx.fillStyle = textColor;
  ctx.font = '14px sans-serif';
  for (let i = 0; i < priceSteps; i++) {
    const price = minPrice + stepValue * i;
    const y =
      height - padding - ((price - minPrice) / (maxPrice - minPrice)) * (height - padding * 2);
    ctx.beginPath();
    ctx.moveTo(padding, y);
    ctx.lineTo(width - padding, y);
    ctx.stroke();
    ctx.fillText(`${price.toFixed(2)}€`, 5, y + 5);
  }
  ctx.fillStyle = textSecondary;
  ctx.font = '12px sans-serif';

  productPriceHistory.allPrices.forEach((p, i) => {
    if (i % 15 === 0 || i === productPriceHistory.allPrices.length - 1) {
      const x = padding + i * xStep;
      const date = new Date(p.timestamp).toLocaleDateString(
        language === Language.ENGLISH ? 'en-GB' : 'el-GR',
      );
      ctx.fillText(date, x - 20, height - padding + 20);
    }
  });

  ctx.strokeStyle = lineColor;
  ctx.beginPath();

  const points: { x: number; y: number; price: number; store: string; timestamp: number }[] = [];
  productPriceHistory.allPrices.forEach((p, i) => {
    const x = padding + i * xStep;
    const y =
      height - padding - ((p.value - minPrice) / (maxPrice - minPrice)) * (height - padding * 2);
    points.push({ x, y, price: p.value, store: p.shop_name ?? '', timestamp: p.timestamp });
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
  ctx.stroke();

  const tooltip = DomClient.createElement('div', {
    className: 'price-history-tooltip',
  });
  DomClient.appendElementToElement(tooltip, priceHistoryContainer);

  canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const closestPoint = points.reduce((prev, curr) =>
      Math.abs(curr.x - mouseX) < Math.abs(prev.x - mouseX) ? curr : prev,
    );

    const date = new Date(closestPoint.timestamp).toLocaleDateString('el-GR', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit',
    });
    tooltip.textContent = `${date}: ${closestPoint.price.toFixed(2)}€, ${closestPoint.store}`;
    tooltip.style.left = `${mouseX + 10}px`;
    tooltip.style.top = `${mouseY - 30}px`;
    tooltip.classList.add('visible');
  });
  canvas.addEventListener('mouseleave', () => {
    tooltip.classList.remove('visible');
  });

  DomClient.appendElementToElement(canvas, priceHistoryContainer);
  header.addEventListener('click', () => {
    const isVisible = priceHistoryContainer.classList.contains('visible');
    if (isVisible) {
      priceHistoryContainer.classList.remove('visible');
      toggleIcon.textContent = '▼';
    } else {
      priceHistoryContainer.classList.add('visible');
      toggleIcon.textContent = '▲';
    }
  });
  DomClient.appendElementToElement(header, wrapper);
  DomClient.appendElementToElement(priceHistoryContainer, wrapper);

  return wrapper;
}
