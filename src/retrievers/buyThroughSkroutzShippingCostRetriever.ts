function elementToNumber(element: Element) {
    if (!element) return undefined;
    let deliveryText = element.textContent?.replace(/[^0-9,]/g, "");
    deliveryText = deliveryText?.replace(",", ".");
    return deliveryText ? parseFloat(deliveryText) : undefined;
}

export function buyThroughSkroutzShippingCostRetriever() {
    const articleEm = document.querySelector("article.offering-card");
    const shippingCostEm = articleEm?.querySelector("em");

    const a = shippingCostEm ? elementToNumber(shippingCostEm) : undefined;
    console.log("a :>> ", a);

    return a;
}
