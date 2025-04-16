function priceElementToNumber(element: Element) {
    const rawTextContent = element.childNodes[0]?.textContent || "";

    const commaElement = element.querySelector("span.comma");
    const decimalElement = element.querySelector("span.comma + span");

    if (!commaElement || !decimalElement) {
        return undefined;
    }

    const decimalPart = decimalElement.textContent || "";
    const integerPart = rawTextContent.replace(/\./g, "");
    const priceValue = `${integerPart}.${decimalPart}`;

    return parseFloat(priceValue);
}

export function buyThroughSkroutzRetriever() {
    const priceElement = document.querySelector(".price");
    return priceElement ? priceElementToNumber(priceElement) : undefined;
}
