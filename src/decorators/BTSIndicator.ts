import { State } from "../types/State";

// Buy  Through Skroutz
export function BTSIndicator(state: State): void {
  const elements = document.querySelectorAll("article.offering-card");

  elements?.forEach((element) => insertPriceIndication(element, state));
}

function insertPriceIndication(element: Element, state: State): void {
  const priceIndication = createPriceIndicationElement(state);
  element.insertBefore(priceIndication, element.children[1]);
}

function createPriceIndicationElement(state: State): HTMLDivElement {
  const priceIndication = document.createElement("div");
  priceIndication.classList.add("inline-flex", "info-label");

  const icon = document.createElement("div");
  const text = document.createElement("div");
  text.classList.add("font-bold");

  const svgElement = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "svg"
  );
  svgElement.setAttribute("viewBox", "0 96 960 960");
  svgElement.setAttribute("width", "16");
  svgElement.setAttribute("height", "16");

  const pathElement = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "path"
  );
  pathElement.setAttribute(
    "d",
    "m40 936 440-760 440 760H40Zm104-60h672L480 296 144 876Zm340.175-57q12.825 0 21.325-8.675 8.5-8.676 8.5-21.5 0-12.825-8.675-21.325-8.676-8.5-21.5-8.5-12.825 0-21.325 8.675-8.5 8.676-8.5 21.5 0 12.825 8.675 21.325 8.676 8.5 21.5 8.5ZM454 708h60V484h-60v224Zm26-122Z"
  );

  svgElement.appendChild(pathElement);
  icon.appendChild(svgElement);

  text.textContent =
    state.language === "EN"
      ? "Might not be the lowest price (SSF)"
      : "Ενδέχεται να μην είναι η χαμηλότερη τιμή (SSF)";

  priceIndication.appendChild(icon);
  priceIndication.appendChild(text);

  return priceIndication;
}
