function priceElementToNumber(element: Element) {
    let priceValue = "";

    const leftPart = element.querySelector("span.comma");
    if (!leftPart?.previousSibling) {
        return undefined;
    }

    const integerPart = leftPart.previousSibling.textContent;
    priceValue = `${priceValue}${integerPart}`;

    const rightPart = element.querySelector("span.comma + span");
    if (!rightPart) {
        return undefined;
    }

    const decimalPart = rightPart.textContent;
    priceValue = `${priceValue}.${decimalPart}`;

    return parseFloat(priceValue);
}

export function buyThroughSkroutzRetriever() {
    const priceElement = document.querySelector(".price");
    return priceElement ? priceElementToNumber(priceElement) : undefined;
}
