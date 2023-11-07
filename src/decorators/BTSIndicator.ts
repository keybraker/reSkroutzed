import { State } from "../types/State";

interface LowestPriceData {
  formatted: string;
  unformatted: number;
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
      this.lowestPriceData = await this.fetchMarketData();
      if (this.lowestPriceData) {
        this.btsPrice = this.fetchBTSPrice();
        this.insertPriceIndication(offeringCard);
      }
    }
  }

  private fetchBTSPrice() {
    const priceElement = document.querySelector(".price");
    return priceElement ? this.priceElementToNumber(priceElement) : undefined;
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

  //

  private getProductCode(): string | null {
    const element = document.querySelector("span.sku-code");
    if (element) {
        const text = element.textContent;
        if (text) {
            const parts = text.split(": ");
            return parts[1];
        }
    }
    return null;
  }

  private async fetchMarketData() {
    try {
      const productCode = this.getProductCode();
      if (!productCode) {
        throw new Error("Failed to fetch product code");
      }

      const response = await fetch(
        `https://www.skroutz.gr/s/${productCode}/filter_products.json`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const responseJSON = await response.json();
      const productCards = responseJSON.product_cards as {
        raw_price: number,
        shipping_cost: number,
        final_price_formatted?: string,
        price: number,
      }[];
      const currency = responseJSON.price_min.trim().slice(-1);
      let lowestPrice = Number.MAX_VALUE;

      Object.values(productCards).forEach(card => {
        const totalCost = card.raw_price + card.shipping_cost;
        if (totalCost < lowestPrice) {
          lowestPrice = totalCost;
        }
      });

      if (lowestPrice === Number.MAX_VALUE) {
        throw new Error("No available products found");
      }

      return {
        formatted: `${lowestPrice} ${currency}`,
        unformatted: lowestPrice,
      };
    } catch (error) {
      console.error("There was a problem with the fetch operation:", error);
      return undefined;
    }
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
      this.btsPrice <= this.lowestPriceData.unformatted
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
      "https://raw.githubusercontent.com/keybraker/skroutz-sponsored-flagger/main/src/assets/icons/48.png";
    img.alt = "Skroutz Sponsored Flagger";
    img.width = 16;
    img.height = 16;

    icon.appendChild(img);

    const lowestPrice = this.lowestPriceData ? this.lowestPriceData.unformatted : undefined;
    const formattedLowestPrice = lowestPrice?.toFixed(2);

    information.textContent =
      this.state.language === "EN"
        ? `${formattedLowestPrice}€ is the lowest price with shipping apart from "Buy through Skroutz"`
        : `${formattedLowestPrice}€ είναι η χαμηλότερη τιμή με μεταφορικά εκτός "Αγορά μέσω Skroutz"`;

    colFlex.appendChild(information);
    // colFlex.appendChild(img);

    priceIndication.appendChild(icon);
    priceIndication.appendChild(colFlex);

    return priceIndication;
  }
}
