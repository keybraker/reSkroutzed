import { State } from "../types/State";

interface LowestPriceData {
  formatted: string;
  unformatted: number;
}

interface ProductData {
  [key: string]: {
    final_price: number;
    final_price_formatted: string;
  };
}

export class BTSIndicator {
  private state: State;
  private btsPrice: number | undefined = undefined;
  private lowestPrice: number | undefined = undefined;
  private lowestPriceFormatted: string | undefined = undefined;

  constructor(state: State) {
    this.state = state;
  }

  public async start() {
    const offeringCard = document.querySelector("article.offering-card");

    if (offeringCard) {
      this.btsPrice = this.fetchBTSPrice();
      const priceData = await this.fetchMarketData();
      this.lowestPrice = priceData?.unformatted;
      this.lowestPriceFormatted = priceData?.formatted;

      this.insertPriceIndication(offeringCard);
    }
  }

  private fetchBTSPrice() {
    const priceElement = document.querySelector(".price");
    return priceElement ? this.priceElementToNumber(priceElement) : undefined;
  }

  private async fetchMarketData() {
    try {
      const storeIdElements = document.querySelectorAll(
        'a.js-product-link[data-type="title"]'
      );
      const productIds = Array.from(storeIdElements)
        .map((el) => {
          const href = el.getAttribute("href");
          if (href) {
            const match = href.match(/show\/(\d+)/);
            return match ? parseInt(match[1], 10) : null;
          }

          return null;
        })
        .filter((id) => id !== null);
      const payload = {
        product_ids: productIds,
        active_sizes: [],
      };

      const response = await fetch(
        "https://www.skroutz.gr/personalization/product_prices.json",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const responseJSON = await response.json();

      const lowestPriceData = this.findLowestPrices(responseJSON);
      return lowestPriceData;
    } catch (error) {
      console.error("There was a problem with the fetch operation:", error);
      return null;
    }
  }

  private findLowestPrices(data: ProductData): LowestPriceData {
    let lowestFinalPrice = Infinity;
    let lowestFinalPriceFormatted: string = "";

    for (const key in data) {
      if (data[key].final_price < lowestFinalPrice) {
        lowestFinalPrice = data[key].final_price;
        lowestFinalPriceFormatted = data[key].final_price_formatted;
      }
    }

    return {
      formatted: lowestFinalPriceFormatted,
      unformatted: lowestFinalPrice,
    };
  }

  private priceElementToNumber(element: Element) {
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

  private insertPriceIndication(element: Element): void {
    const priceIndication = this.createPriceIndicationElement();
    element.insertBefore(priceIndication, element.children[1]);
  }

  private createPriceIndicationElement(): HTMLDivElement {
    const priceIndication = document.createElement("div");
    const colFlex = document.createElement("div");

    const status =
      this.btsPrice && this.lowestPrice && this.btsPrice <= this.lowestPrice
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
    disclaimer.classList.add("align-end");

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
        ? `The lowest price with shipping apart from "Buy through Skroutz" is ${this.lowestPriceFormatted}`
        : `Η χαμηλότερη τιμή με μεταφορικά εκτός "Αγορά μέσω Skroutz" είναι ${this.lowestPriceFormatted}`;

    disclaimer.textContent = "Skroutz Sponsored Flagger";

    colFlex.appendChild(information);
    colFlex.appendChild(disclaimer);

    priceIndication.appendChild(icon);
    priceIndication.appendChild(colFlex);

    return priceIndication;
  }
}
