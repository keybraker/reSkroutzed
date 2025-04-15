function elementToNumber(element: Element): number {
  if (!element) {
    return 0;
  }

  let deliveryText = element.textContent?.replace(/[^0-9,]/g, "");
  deliveryText = deliveryText?.replace(",", ".");

  return deliveryText ? parseFloat(deliveryText) ?? 0 : 0;
}

export function buyThroughSkroutzShippingCostRetriever(): number {
  const articleEm = document.querySelector("article.offering-card");
  const shippingCostEm = articleEm?.querySelector("em");

  return shippingCostEm ? elementToNumber(shippingCostEm) ?? 0 : 0;
}
