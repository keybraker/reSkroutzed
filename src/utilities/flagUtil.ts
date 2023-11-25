export function isFlagged(element: Element | null) {
    if (!element || !element?.textContent) {
        return false;
    }

    const sponsoredTexts = ["Sponsored", "Προωθούμενα", "Sponsored", "Προωθούμενo"];

    return sponsoredTexts.includes(element.textContent);
}

export function flagProductListItem(listItem: Element): void {
    listItem.classList.add("flagged-product");
    flagImageElement(listItem);
    flagLabelElement(listItem);
}

function flagLabelElement(listItem: Element): void {
    const labelTextElement = listItem.querySelector(".label-text");

    if (labelTextElement) {
        labelTextElement.classList.add("flagged-product-label");
    }
}

function flagImageElement(listItem: Element): void {
    const imageLinkElement = listItem.querySelector("a.image");

    if (imageLinkElement) {
        imageLinkElement.classList.add("flagged-product-image");
    }
}
