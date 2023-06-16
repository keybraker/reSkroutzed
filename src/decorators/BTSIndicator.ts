import { State } from "../types/State";

interface LowestPriceData {
  formatted: { net: string; shipping: string };
  unformatted: { net: number; shipping: number };
}

interface ProductData {
  [key: string]: {
    net_price: number;
    net_price_formatted: string;
    shipping_cost: number;
    shipping_cost_formatted: string;
  };
}

export class BTSIndicator {
  private state: State;
  private btsPrice: number | undefined = undefined;
  private lowestPriceData: LowestPriceData | undefined = undefined;

  constructor(state: State) {
    this.state = state;
  }

  public async start() {
    const offeringCard = document.querySelector("article.offering-card");

    if (offeringCard) {
      this.btsPrice = this.fetchBTSPrice();
      this.lowestPriceData = await this.fetchMarketData();
      if (this.lowestPriceData) {
        this.insertPriceIndication(offeringCard);
      }
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

          return undefined;
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
      console.log("response :>> ", response);
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const responseJSON = await response.json();
      console.log("responseJSON :>> ", responseJSON);
      return this.findLowestPrices(responseJSON);
    } catch (error) {
      console.error("There was a problem with the fetch operation:", error);
      return undefined;
    }
  }

  private findLowestPrices(data: ProductData): LowestPriceData {
    let lowestTotalPrice = Infinity;
    let lowestNetPrice: number = 0;
    let lowestShippingCost: number = 0;
    let lowestNetPriceFormatted: string = "";
    let lowestShippingCostFormatted: string = "";

    for (const key in data) {
      if (data[key].net_price === null || data[key].shipping_cost === null) {
        continue;
      }

      const currentTotalPrice = data[key].net_price + data[key].shipping_cost;

      if (currentTotalPrice < lowestTotalPrice) {
        lowestTotalPrice = currentTotalPrice;
        lowestNetPrice = data[key].net_price;
        lowestShippingCost = data[key].shipping_cost;
        lowestNetPriceFormatted = data[key].net_price_formatted;
        lowestShippingCostFormatted = data[key].shipping_cost_formatted;
      }
    }

    return {
      formatted: {
        net: lowestNetPriceFormatted,
        shipping: lowestShippingCostFormatted,
      },
      unformatted: {
        net: lowestNetPrice,
        shipping: lowestShippingCost,
      },
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
      this.btsPrice &&
      this.lowestPriceData &&
      this.btsPrice <=
        this.lowestPriceData.unformatted.net +
          this.lowestPriceData.unformatted.shipping
        ? "info-label-positive"
        : "info-label-negative";

    priceIndication.classList.add("display-padding", "inline-flex-row", status);
    colFlex.classList.add("inline-flex-col");

    const icon = document.createElement("div");
    const information = document.createElement("div");
    const disclaimer = document.createElement("div");
    information.classList.add("font-bold");
    disclaimer.classList.add("align-end", "text-black");

    const svgElement = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "svg"
    );
    svgElement.setAttribute("viewBox", "0 96 960 960");
    svgElement.setAttribute("width", "16");
    svgElement.setAttribute("height", "16");

    // const pathElement = document.createElementNS(
    //   "http://www.w3.org/2000/svg",
    //   "path"
    // );
    // pathElement.setAttribute(
    //   "d",
    //   "m40 936 440-760 440 760H40Zm104-60h672L480 296 144 876Zm340.175-57q12.825 0 " +
    //     "21.325-8.675 8.5-8.676 8.5-21.5 0-12.825-8.675-21.325-8.676-8.5-21.5-8.5-12.825 " +
    //     "0-21.325 8.675-8.5 8.676-8.5 21.5 0 12.825 8.675 21.325 8.676 8.5 21.5 8.5ZM454 708h60V484h-60v224Zm26-122Z"
    // );
    //
    // svgElement.appendChild(pathElement);
    // icon.appendChild(svgElement);

    const img = document.createElement("img");
    img.src =
      "https://lh3.googleusercontent.com/BplITTwi7htB-tLaEtbn1RVBwhW1nN3akoNOnTbRKW6da4HU3SxFMYan_UAAQ-RuPHWwFSOBiug4xdINtA7kpbFQoyg=w128-h128-e365-rj-sc0x00ffffff";
    img.alt = "Skroutz Sponsored Flagger";
    img.width = 16;
    img.height = 16;

    icon.appendChild(img);

    const lowestPrice = this.lowestPriceData
      ? this.lowestPriceData.unformatted.net +
        this.lowestPriceData.unformatted.shipping
      : undefined;
    const formattedLowestPrice = lowestPrice?.toFixed(2);

    information.textContent =
      this.state.language === "EN"
        ? `The lowest price with shipping apart from "Buy through Skroutz" is ${formattedLowestPrice}€`
        : `Η χαμηλότερη τιμή με μεταφορικά εκτός "Αγορά μέσω Skroutz" είναι ${formattedLowestPrice}€`;

    colFlex.appendChild(information);
    // colFlex.appendChild(img);

    priceIndication.appendChild(icon);
    priceIndication.appendChild(colFlex);

    return priceIndication;
  }
}
