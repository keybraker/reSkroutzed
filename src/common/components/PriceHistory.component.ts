import { DomClient } from '../../clients/dom/client';
import { ProductPriceHistory } from '../../clients/skroutz/client';
import { Language } from '../enums/Language.enum';

function applyDarkModeStyles(
  wrapper: HTMLElement,
  header: HTMLElement,
  toggleIcon: HTMLElement,
  priceHistoryContainer: HTMLElement,
): void {
  if (document.body.classList.contains('dark-mode')) {
    wrapper.style.border = '1px dashed rgba(255, 255, 255, 0.2)';
    wrapper.style.backgroundColor = 'rgba(255, 255, 255, 0.025)';
    header.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
    header.style.color = '#ffffff';
    header.style.borderBottomColor = 'rgba(255, 255, 255, 0.1)';
    toggleIcon.style.border = '1px dashed rgba(255, 255, 255, 0.3)';
    toggleIcon.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
    toggleIcon.style.color = '#ffffff';
    toggleIcon.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.3)';
    priceHistoryContainer.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
  }
}

export function PriceHistoryComponent(
  currentPriceState: 'expensive' | 'cheap' | 'normal',
  productPriceHistory: ProductPriceHistory,
  language: Language,
): HTMLElement {
  const wrapper = DomClient.createElement('div', {
    className: 'price-history-wrapper',
  });
  wrapper.style.border = '1px dashed rgba(0, 0, 0, 0.2)';
  wrapper.style.borderRadius = '6px';
  wrapper.style.margin = '8px 0';
  wrapper.style.overflow = 'hidden';
  wrapper.style.backgroundColor = 'rgba(0, 0, 0, 0.015)';
  wrapper.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.05)';

  const header = DomClient.createElement('div', {
    className: 'price-history-header',
  });
  header.style.display = 'flex';
  header.style.justifyContent = 'space-between';
  header.style.alignItems = 'center';
  header.style.padding = '12px 15px';
  header.style.backgroundColor = 'rgba(248, 248, 248, 0.8)';
  header.style.cursor = 'pointer';
  header.style.fontWeight = 'bold';
  header.style.fontSize = '14px';
  header.style.color = '#000';
  header.style.borderBottom = '1px dashed rgba(0, 0, 0, 0.1)';
  header.style.transition = 'background-color 0.2s ease, border-color 0.2s ease';

  const getLabel = (english: string, greek: string): string =>
    language === Language.ENGLISH ? english : greek;

  header.textContent = getLabel(
    currentPriceState === 'cheap'
      ? 'Good price compared to historical price'
      : currentPriceState === 'normal'
        ? 'Average price compared to historical price'
        : 'High price compared to historical price',
    currentPriceState === 'cheap'
      ? 'Καλή τιμή σε σχέση με τα το τελευταίο εξάμηνο'
      : currentPriceState === 'normal'
        ? 'Κανονική τιμή σε σχέση με τα το τελευταίο εξάμηνο'
        : 'Υψηλή τιμή σε σχέση με τα το τελευταίο εξάμηνο',
  );

  const toggleIcon = DomClient.createElement('span', {});
  toggleIcon.textContent = '▼';
  toggleIcon.style.marginLeft = '8px';
  toggleIcon.style.fontSize = '12px';
  toggleIcon.style.transition = 'transform 0.2s ease';
  toggleIcon.style.color = '#000';
  toggleIcon.style.border = '1px solid rgba(0, 0, 0, 0.77)';
  toggleIcon.style.borderRadius = '50%';
  toggleIcon.style.width = '24px';
  toggleIcon.style.height = '24px';
  toggleIcon.style.backgroundColor = 'rgba(255, 255, 255, 0.9)';
  toggleIcon.style.display = 'flex';
  toggleIcon.style.alignItems = 'center';
  toggleIcon.style.justifyContent = 'center';
  toggleIcon.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.1)';
  DomClient.appendElementToElement(toggleIcon, header);

  const priceHistoryContainer = DomClient.createElement('div', {
    className: 'price-history-container',
  });
  priceHistoryContainer.style.padding = '15px';
  priceHistoryContainer.style.backgroundColor = 'rgba(255, 255, 255, 0.9)';
  priceHistoryContainer.style.display = 'none';

  const canvas = document.createElement('canvas') as HTMLCanvasElement;
  canvas.width = 700;
  canvas.height = 200;
  canvas.style.width = '100%';
  canvas.style.height = '200px';

  const ctx = canvas.getContext('2d')!;
  const padding = 50;
  const width = canvas.width;
  const height = canvas.height;

  const minPrice = Math.min(...productPriceHistory.allPrices.map((p) => p.value));
  const maxPrice = Math.max(...productPriceHistory.allPrices.map((p) => p.value));

  const priceSteps = 5;
  const stepValue = (maxPrice - minPrice) / (priceSteps - 1);
  const xStep = (width - 2 * padding) / (productPriceHistory.allPrices.length - 1);

  ctx.strokeStyle = '#eee';
  ctx.fillStyle = '#222';
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

  ctx.fillStyle = '#888';
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

  ctx.strokeStyle = '#ff9800';
  ctx.lineWidth = 3;
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

  const tooltip = DomClient.createElement('div', { className: 'tooltip' });
  tooltip.style.position = 'absolute';
  tooltip.style.background = '#333';
  tooltip.style.color = '#fff';
  tooltip.style.padding = '6px 10px';
  tooltip.style.borderRadius = '4px';
  tooltip.style.fontSize = '0.75em';
  tooltip.style.pointerEvents = 'none';
  tooltip.style.opacity = '0';
  tooltip.style.transition = 'opacity 0.2s ease';
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
    tooltip.style.opacity = '1';
  });

  canvas.addEventListener('mouseleave', () => {
    tooltip.style.opacity = '0';
  });

  DomClient.appendElementToElement(canvas, priceHistoryContainer);

  header.addEventListener('click', () => {
    const isVisible = priceHistoryContainer.style.display !== 'none';
    priceHistoryContainer.style.display = isVisible ? 'none' : 'block';
    toggleIcon.textContent = isVisible ? '▼' : '▲';
  });

  header.addEventListener('mouseenter', () => {
    header.style.backgroundColor = document.body.classList.contains('dark-mode')
      ? 'rgba(255, 255, 255, 0.15)'
      : 'rgba(248, 248, 248, 0.9)';
    header.style.borderBottomColor = document.body.classList.contains('dark-mode')
      ? 'rgba(255, 255, 255, 0.2)'
      : 'rgba(0, 0, 0, 0.15)';
  });

  header.addEventListener('mouseleave', () => {
    header.style.backgroundColor = document.body.classList.contains('dark-mode')
      ? 'rgba(255, 255, 255, 0.1)'
      : 'rgba(248, 248, 248, 0.8)';
    header.style.borderBottomColor = document.body.classList.contains('dark-mode')
      ? 'rgba(255, 255, 255, 0.1)'
      : 'rgba(0, 0, 0, 0.1)';
  });

  DomClient.appendElementToElement(header, wrapper);
  DomClient.appendElementToElement(priceHistoryContainer, wrapper);
  applyDarkModeStyles(wrapper, header, toggleIcon, priceHistoryContainer);

  return wrapper;
}
