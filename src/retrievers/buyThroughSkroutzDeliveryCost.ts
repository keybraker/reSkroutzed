function deliveryCostElementToNumber(element: Element) {
    if (!element) return undefined;
    let deliveryText = element.textContent?.replace(/[^0-9,]/g, "");
    deliveryText = deliveryText?.replace(",", ".");
    return deliveryText ? parseFloat(deliveryText) : undefined;
}

export function buyThroughSkroutzDeliveryCostRetriever() {
    const deliveryCostElement = document.querySelector(".plus-reduced");
    return deliveryCostElement ? deliveryCostElementToNumber(deliveryCostElement) : undefined;
}
