import { describe, expect, it } from 'vitest';

import { parseShopCards } from '../../../src/clients/skroutz/shopCards';

const buildCardHtml = (attributes: string, body = ''): string =>
  `<li class="product-card-redesigned" ${attributes}>${body}</li>`;

const buildShopsListHtml = (cards: string): string =>
  `<ol id="prices" class="sku-list">${cards}</ol>`;

describe('parseShopCards', () => {
  it('should parse shop id, prices and product name from a card', () => {
    // Arrange
    const html = buildShopsListHtml(
      buildCardHtml(
        'data-shop-id="5527" data-raw-price="1238.0" data-price="1.238,00 €"',
        '<div class="product-name" title="Apple iPhone 17 Pro">Apple iPhone 17 Pro</div>',
      ),
    );

    // Act
    const shopCards = parseShopCards(html);

    // Assert
    expect(shopCards).toEqual([
      {
        shopId: 5527,
        rawPrice: 1238,
        finalPrice: 1238,
        shippingCost: 0,
        productName: 'Apple iPhone 17 Pro',
      },
    ]);
  });

  it('should prefer the home delivery fee over the cheaper pickup fee', () => {
    // Arrange
    const html = buildShopsListHtml(
      buildCardHtml(
        'data-shop-id="24034" data-raw-price="1238.0"',
        `<div class="product-card-delivery-box">
          <div class="product-card-fee with-location">
            <span class="product-card-fee-text">
              <span class="product-card-fee-value">2,50 €</span>
              <span class="product-card-fee-suffix"> σε Skroutz Point</span>
              <span class="product-card-fee-subtext">ή 3,50 € μεταφορικά</span>
            </span>
          </div>
        </div>`,
      ),
    );

    // Act
    const shopCards = parseShopCards(html);

    // Assert
    expect(shopCards[0].shippingCost).toBe(3.5);
  });

  it('should treat free shipping cards as having no shipping cost', () => {
    // Arrange
    const html = buildShopsListHtml(
      buildCardHtml(
        'data-shop-id="1" data-raw-price="99.9"',
        '<span class="product-card-fee-text">Δωρεάν μεταφορικά</span>',
      ),
    );

    // Act
    const shopCards = parseShopCards(html);

    // Assert
    expect(shopCards[0].shippingCost).toBe(0);
  });

  it('should fall back to the displayed fee value when no home delivery fee is shown', () => {
    // Arrange
    const html = buildShopsListHtml(
      buildCardHtml(
        'data-shop-id="2" data-raw-price="10.0"',
        `<span class="product-card-fee-text">
          <span class="product-card-fee-value">4,20 €</span>
        </span>`,
      ),
    );

    // Act
    const shopCards = parseShopCards(html);

    // Assert
    expect(shopCards[0].shippingCost).toBe(4.2);
  });

  it('should default the displayed price to the raw price when the card has no formatted price', () => {
    // Arrange
    const html = buildShopsListHtml(buildCardHtml('data-shop-id="3" data-raw-price="17.36"'));

    // Act
    const shopCards = parseShopCards(html);

    // Assert
    expect(shopCards[0].finalPrice).toBe(17.36);
  });

  it('should keep the displayed price when it differs from the raw price', () => {
    // Arrange
    const html = buildShopsListHtml(
      buildCardHtml('data-shop-id="4" data-raw-price="950.0" data-price="945,00 €"'),
    );

    // Act
    const shopCards = parseShopCards(html);

    // Assert
    expect(shopCards[0]).toMatchObject({ rawPrice: 950, finalPrice: 945 });
  });

  it('should ignore skeleton cards that carry no shop data', () => {
    // Arrange
    const html = buildShopsListHtml(`
      <li class="product-card-redesigned product-card-skeleton"></li>
      ${buildCardHtml('data-shop-id="5" data-raw-price="10.0"')}
    `);

    // Act
    const shopCards = parseShopCards(html);

    // Assert
    expect(shopCards).toHaveLength(1);
    expect(shopCards[0].shopId).toBe(5);
  });

  it('should return an empty list when the response has no shop list', () => {
    // Arrange
    const html = '<div class="product-cards-drawer-wrapper"></div>';

    // Act
    const shopCards = parseShopCards(html);

    // Assert
    expect(shopCards).toEqual([]);
  });
});
