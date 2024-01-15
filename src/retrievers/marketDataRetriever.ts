function getSKU(): string | null {
    const metaTag = document.querySelector("meta[itemprop=\"sku\"]") as HTMLMetaElement | null;
    return metaTag ? metaTag.content : null;
}

export async function marketDataReceiver() {
    try {
        const productCode = getSKU();
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
