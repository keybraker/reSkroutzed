import { Language } from "../enums/Language";
import { State } from "../types/State";

interface LowestPriceData {
  formatted: string;
  unformatted: number;
  shopId: number;
}

export class PriceCheckerIndicator {
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

    private getSKU(): string | null {
        const metaTag = document.querySelector("meta[itemprop=\"sku\"]") as HTMLMetaElement | null;
        return metaTag ? metaTag.content : null;
    }

    private async fetchMarketData() {
        try {
            const productCode = this.getSKU();
            if (!productCode) {
                throw new Error("Failed to fetch product SKU");
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
                throw new Error(`Failed to fetch (HTTP: ${response.status}) price data for product with SKU ${productCode}`);
            }

            const responseJSON = await response.json();
            const productCards = responseJSON.product_cards as {
                raw_price: number,
                shop_id: number,
                shipping_cost: number,
                final_price_formatted?: string,
                price: number,
            }[];
            const currency = responseJSON.price_min.trim().slice(-1);
            let shopId = 0;
            let lowestPrice = Number.MAX_VALUE;

            Object.values(productCards).forEach(card => {
                const totalCost = card.raw_price + card.shipping_cost;
                if (totalCost < lowestPrice) {
                    lowestPrice = totalCost;
                    shopId = card.shop_id;
                }
            });

            if (lowestPrice === Number.MAX_VALUE) {
                throw new Error("No available products found");
            }

            return {
                formatted: `${lowestPrice} ${currency}`,
                unformatted: lowestPrice,
                shopId,
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

        const isLowestPrice = !!this.btsPrice && !!this.lowestPriceData && this.btsPrice <= this.lowestPriceData.unformatted;
        const checkerStyle = isLowestPrice ? "info-label-positive" : "info-label-negative";

        priceIndication.classList.add("display-padding", "inline-flex-row", "price-checker-outline", checkerStyle);
        colFlex.classList.add("inline-flex-col");

        const icon = document.createElement("div");
        const information = document.createElement("div");
        const disclaimer = document.createElement("div");

        information.classList.add("align-center", "font-bold");
        disclaimer.classList.add("align-end", "text-black");

        const svgElement = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        svgElement.setAttribute("viewBox", "0 96 960 960");
        svgElement.setAttribute("width", "16");
        svgElement.setAttribute("height", "16");

        const img = document.createElement("img");
        img.src = "https://raw.githubusercontent.com/keybraker/skroutz-sponsored-flagger/main/src/assets/icons/128.png";
        img.alt = "Skroutz Sponsored Flagger";
        img.width = 16;
        img.height = 16;

        icon.appendChild(img);

        const lowestPrice = this.lowestPriceData ? this.lowestPriceData.unformatted : undefined;
        const formattedLowestPrice = lowestPrice?.toFixed(2);

        information.textContent = this.state.language === Language.ENGLISH
            ? `${formattedLowestPrice}€ is the lowest price with shipping apart from "Buy through Skroutz"`
            : `${formattedLowestPrice}€ είναι η χαμηλότερη τιμή με μεταφορικά εκτός "Αγορά μέσω Skroutz"`;

        colFlex.appendChild(information);

        const goToStoreButton = this.goToStoreButtonCreator(isLowestPrice);
        colFlex.appendChild(goToStoreButton);

        priceIndication.appendChild(icon);
        priceIndication.appendChild(colFlex);

        return priceIndication;
    }

    private goToStoreButtonCreator(isLowestPrice: boolean): HTMLButtonElement {
        const goToStoreButton = document.createElement("button");
        const buttonStyle = isLowestPrice ? "go-to-shop-button-positive" : "go-to-shop-button-negative";

        goToStoreButton.classList.add(buttonStyle);
        goToStoreButton.textContent = this.state.language === Language.ENGLISH
            ? "Go to Shop"
            : "Μετάβαση στο κατάστημα";
        goToStoreButton.classList.add("custom-button-class");

        goToStoreButton.addEventListener("click", () => {
            const targetId = `shop-${this.lowestPriceData?.shopId}`;
            const targetElement = document.getElementById(targetId);

            if (targetElement) {
                targetElement.scrollIntoView({ behavior: "smooth", block: "center", inline: "center" });
                targetElement.classList.add("lowest-price-store-highlight");
            }
        });

        return goToStoreButton;
    }
}
