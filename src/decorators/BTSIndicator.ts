import { State } from "../types/State";

export class BTSIndicator {
  private state: State;
  private btsPrice: number | null = null;
  private lowestPriceWithoutTransport: number | null = null;
  private lowestPriceWithoutTransportFormatted: number | null = null;

  constructor(state: State) {
    this.state = state;
  }

  public async start() {
    const offeringCard = document.querySelector("article.offering-card");

    if (offeringCard) {
      this.btsPrice = this.fetchBTSPrice();
      const priceData = await this.fetchMarketData();
      this.lowestPriceWithoutTransport = priceData?.unformatted;
      this.lowestPriceWithoutTransportFormatted = priceData?.formatted;

      this.insertPriceIndication(offeringCard);
    }
  }

  private fetchBTSPrice() {
    const priceElement = document.querySelector(".price");
    return priceElement ? this.priceElementToNumber(priceElement) : null;
  }

  private async fetchMarketData() {
    try {
      const response = await fetch("product_prices.json");
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const responseJSON = await response.json();
      return {
        formatted: responseJSON.data.price_min,
        unformatted: responseJSON.data.price_min_unformatted,
      };
    } catch (error) {
      console.error("There was a problem with the fetch operation:", error);
      return null;
    }
  }

  private priceElementToNumber(element: Element) {
    let priceValue = "";

    const leftPart = element.querySelector("span.comma");
    if (!leftPart?.previousSibling) {
      return null;
    }

    const integerPart = leftPart.previousSibling.textContent;
    priceValue = `${priceValue}${integerPart}`;

    const rightPart = element.querySelector("span.comma + span");
    if (!rightPart) {
      return null;
    }

    const decimalPart = rightPart.textContent;
    priceValue = `${priceValue}.${decimalPart}`;

    return parseFloat(priceValue);
  }

  private insertPriceIndication(element: Element): void {
    const priceIndication = this.createPriceIndicationElement();
    element.insertBefore(priceIndication, element.children[1]);
  }

  private createPriceIndicationElement(): HTMLDivElement {
    const priceIndication = document.createElement("div");
    const colFlex = document.createElement("div");

    const status =
      this.btsPrice &&
      this.lowestPriceWithoutTransport &&
      this.btsPrice <= this.lowestPriceWithoutTransport
        ? "info-label-positive"
        : "info-label-negative";

    priceIndication.classList.add(
      "display-papdding",
      "inline-flex-row",
      status
    );
    colFlex.classList.add("inline-flex-row-col");

    const icon = document.createElement("div");
    const information = document.createElement("div");
    const disclaimer = document.createElement("div");
    information.classList.add("font-bold");
    disclaimer.classList.add("font-italic");

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
      "m40 936 440-760 440 760H40Zm104-60h672L480 296 144 876Zm340.175-57q12.825 0 " +
        "21.325-8.675 8.5-8.676 8.5-21.5 0-12.825-8.675-21.325-8.676-8.5-21.5-8.5-12.825 " +
        "0-21.325 8.675-8.5 8.676-8.5 21.5 0 12.825 8.675 21.325 8.676 8.5 21.5 8.5ZM454 708h60V484h-60v224Zm26-122Z"
    );

    svgElement.appendChild(pathElement);
    icon.appendChild(svgElement);

    information.textContent =
      this.state.language === "EN"
        ? `The lowest price without shipping is ${this.lowestPriceWithoutTransportFormatted}`
        : `Η χαμηλότερη τιμή χωρίς μεταφορικά είναι ${this.lowestPriceWithoutTransportFormatted}`;

    disclaimer.textContent = "Skroutz Sponsored Flagger";

    colFlex.appendChild(information);
    colFlex.appendChild(disclaimer);

    priceIndication.appendChild(icon);
    priceIndication.appendChild(colFlex);

    return priceIndication;
  }
}
