import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { ProductPriceData, SkroutzClient } from '../../../src/clients/skroutz/client';
import { ProductData } from '../../../src/clients/skroutz/types';

describe('SkroutzClient', () => {
  // Sample product data for tests
  const mockProductData: ProductData = {
    product_card_ids: [1, 2, 3],
    sponsored_product_card_ids: [1],
    disabled_product_ids: [],
    product_cards: {
      '1': {
        id: 1,
        shop_id: 101,
        price: '€1.028,89',
        shipping_cost: 0,
        raw_price: 1028.89,
        sponsored: true,
        ecommerce_final_price: 0,
        // Other required fields with default values
        marketplace: false,
        shop_details_icons: [],
        products: [],
        ecommerce_available: true,
        only_available_through_fbs: null,
        official_reseller: false,
        expert_seller: false,
        sponsored_by_merchant_tracking_url: '',
        merchant_funded_installments: false,
        sponsored_by_merchant_follow_cookie_link_data_cart: {},
        discount_voucher_active: false,
        fbs_active: false,
        force_cargo_shipping_benefits: false,
        ecommerce_final_price_formatted: '',
        ecommerce_payment_method_cost_formatted: null,
        ecommerce_payment_method_cost_supported: null,
        ecommerce_shipping_cost_formatted: '',
        fbm: false,
        final_price: 1028.89,
        final_price_formatted: '€1.028,89',
        final_price_without_payment_cost_formatted: '€1.028,89',
        has_merchant_loyalty_points: false,
        loyalty_points: '',
        net_price_formatted: '€1.028,89',
        no_credit_card: false,
        payment_method_cost_formatted: null,
        payment_method_cost_supported: null,
        shipping_cost_formatted: '€0',
        untracked_redirect_supported: false,
        coupon_info: null,
      },
      '2': {
        id: 2,
        shop_id: 102,
        price: '€999,99',
        shipping_cost: 3.5,
        raw_price: 999.99,
        sponsored: false,
        ecommerce_final_price: 0,
        // Other required fields with default values
        marketplace: false,
        shop_details_icons: [],
        products: [],
        ecommerce_available: true,
        only_available_through_fbs: null,
        official_reseller: false,
        expert_seller: false,
        sponsored_by_merchant_tracking_url: '',
        merchant_funded_installments: false,
        sponsored_by_merchant_follow_cookie_link_data_cart: {},
        discount_voucher_active: false,
        fbs_active: false,
        force_cargo_shipping_benefits: false,
        ecommerce_final_price_formatted: '',
        ecommerce_payment_method_cost_formatted: null,
        ecommerce_payment_method_cost_supported: null,
        ecommerce_shipping_cost_formatted: '',
        fbm: false,
        final_price: 999.99,
        final_price_formatted: '€999,99',
        final_price_without_payment_cost_formatted: '€999,99',
        has_merchant_loyalty_points: false,
        loyalty_points: '',
        net_price_formatted: '€999,99',
        no_credit_card: false,
        payment_method_cost_formatted: null,
        payment_method_cost_supported: null,
        shipping_cost_formatted: '€3,5',
        untracked_redirect_supported: false,
        coupon_info: null,
      },
      '3': {
        id: 3,
        shop_id: 103,
        price: '€950,00',
        shipping_cost: 5,
        raw_price: 950,
        sponsored: false,
        ecommerce_final_price: 945,
        // Other required fields with default values
        marketplace: false,
        shop_details_icons: [],
        products: [],
        ecommerce_available: true,
        only_available_through_fbs: null,
        official_reseller: false,
        expert_seller: false,
        sponsored_by_merchant_tracking_url: '',
        merchant_funded_installments: false,
        sponsored_by_merchant_follow_cookie_link_data_cart: {},
        discount_voucher_active: false,
        fbs_active: false,
        force_cargo_shipping_benefits: false,
        ecommerce_final_price_formatted: '€945',
        ecommerce_payment_method_cost_formatted: null,
        ecommerce_payment_method_cost_supported: null,
        ecommerce_shipping_cost_formatted: '',
        fbm: false,
        final_price: 950,
        final_price_formatted: '€950,00',
        final_price_without_payment_cost_formatted: '€950,00',
        has_merchant_loyalty_points: false,
        loyalty_points: '',
        net_price_formatted: '€950,00',
        no_credit_card: false,
        payment_method_cost_formatted: null,
        payment_method_cost_supported: null,
        shipping_cost_formatted: '€5',
        untracked_redirect_supported: false,
        coupon_info: null,
      },
    },
    shop_count: 3,
    price_min: '€950,00',
    price_drop_percentage: null,
  };

  const mockStoreData = [
    {
      stores_count: 1,
      store_location_id: 10,
      store_location_address: {
        city: 'Αθήνα',
        country: 'GR',
        region: 'Αττική',
        street: 'Κηφισίας 1',
        postcode: '11523',
        full: 'Κηφισίας 1, Αθήνα 11523',
      },
      display_full_store_address: true,
      show_added_delay_message: false,
    },
    {
      stores_count: 1,
      store_location_id: 11,
      store_location_address: {
        city: 'Ηράκλειο',
        country: 'GR',
        region: 'Κρήτη',
        street: '25ης Αυγούστου 10',
        postcode: '71202',
        full: '25ης Αυγούστου 10, Ηράκλειο 71202',
      },
      display_full_store_address: true,
      show_added_delay_message: false,
    },
    {
      stores_count: 1,
      store_location_id: 12,
      store_location_address: {
        city: 'Πάτρα',
        country: 'GR',
        region: 'Αχαΐα',
        street: 'Μαιζώνος 4',
        postcode: '26221',
        full: 'Μαιζώνος 4, Πάτρα 26221',
      },
      display_full_store_address: true,
      show_added_delay_message: false,
    },
  ];

  const createFetchMock = (): ReturnType<typeof vi.fn> =>
    vi.fn().mockImplementation((input: RequestInfo | URL) => {
      const url = String(input);

      if (url.includes('filter_products.json')) {
        return Promise.resolve({
          ok: true,
          json: vi.fn().mockResolvedValue(mockProductData),
        });
      }

      if (url.includes('product_cards_nearest_location.json')) {
        return Promise.resolve({
          ok: true,
          json: vi.fn().mockResolvedValue(mockStoreData),
        });
      }

      if (url.includes('refresh_show')) {
        return Promise.resolve({
          ok: true,
          text: vi.fn().mockResolvedValue('<div></div>'),
        });
      }

      return Promise.reject(new Error(`Unexpected fetch URL: ${url}`));
    });

  // Preserve original console.error
  const originalConsoleError = console.error;
  const originalConsoleWarn = console.warn;

  beforeEach(() => {
    (
      SkroutzClient as unknown as { productDataCache: Map<string, Promise<ProductData>> }
    ).productDataCache.clear();

    // Mock document body and elements
    document.body.innerHTML = `
      <meta itemprop="sku" content="12345678">
      <div class="merchant-box">
        <div class="merchant-box-bottom-content">
          <div class="location"><span>Θεσσαλονίκη, Ελλάδα</span></div>
          <div class="store-pickup"><span>Δυνατότητα παραλαβής από το κατάστημα</span></div>
          <a class="storefront-link" href="/shop/101/TestShop/products.html?from=sku_page">Δες όλα τα προϊόντα</a>
        </div>
      </div>
      <div class="merchant-box">
        <div class="merchant-box-bottom-content">
          <div class="location"><span>Μαρούσι, Ελλάδα</span></div>
          <div class="store-pickup"><span>Δυνατότητα παραλαβής από το κατάστημα</span></div>
          <a class="storefront-link" href="/shop/102/TestShop2/products.html?from=sku_page">Δες όλα τα προϊόντα</a>
        </div>
      </div>
      <div class="merchant-box">
        <div class="merchant-box-bottom-content">
          <div class="location"><span>Βουλγαρία</span></div>
        </div>
      </div>
      <article class="offering-card">
        <div class="price">1.028<span class="comma">,</span><span>89</span></div>
      </article>
    `;

    // Mock fetch API
    global.fetch = createFetchMock() as unknown as typeof global.fetch;

    // Silence console errors during tests to keep output clean
    console.error = vi.fn();
    console.warn = vi.fn();
  });

  afterEach(() => {
    // Reset mocks
    vi.restoreAllMocks();
    document.body.innerHTML = '';

    // Restore console.error
    console.error = originalConsoleError;
    console.warn = originalConsoleWarn;
  });

  describe('getCurrentProductData', () => {
    it('should return the correct price data for skroutz and store', async () => {
      // Act
      const result: ProductPriceData = await SkroutzClient.getCurrentProductData();

      // Assert
      expect(fetch).toHaveBeenCalledWith(
        'https://www.skroutz.gr/s/12345678/filter_products.json',
        expect.any(Object),
      );

      // Check Skroutz price data
      expect(result.buyThroughSkroutz).toEqual({
        price: 1028.89,
        shippingCost: 0,
        totalPrice: 1028.89,
        shopId: 101,
      });

      // Check Store price data (should be the lowest total price)
      expect(result.buyThroughStore).toEqual({
        price: 945,
        shippingCost: 5,
        totalPrice: 950,
        shopId: 103,
      });

      expect(result.storeAvailability).toEqual({
        availableShopCount: 3,
        cities: ['Θεσσαλονίκη', 'Μαρούσι'],
        userCity: undefined,
        matchingCities: [],
        cityShopMap: {
          Θεσσαλονίκη: [101],
          Μαρούσι: [102],
        },
        orderCities: ['Αθήνα', 'Ηράκλειο', 'Πάτρα'],
        orderCityShopMap: {
          Αθήνα: [101],
          Ηράκλειο: [102],
          Πάτρα: [103],
        },
        onlineOnlyShopCount: 0,
      });
    });

    it('should match the buybox against ecommerce_final_price when Skroutz shows the discounted price', async () => {
      document.body.innerHTML = `
        <meta itemprop="sku" content="12345678">
        <div class="merchant-box">
          <div class="merchant-box-bottom-content">
            <div class="location"><span>Θεσσαλονίκη, Ελλάδα</span></div>
            <div class="store-pickup"><span>Δυνατότητα παραλαβής από το κατάστημα</span></div>
            <a class="storefront-link" href="/shop/101/TestShop/products.html?from=sku_page">Δες όλα τα προϊόντα</a>
          </div>
        </div>
        <div class="merchant-box">
          <div class="merchant-box-bottom-content">
            <div class="location"><span>Πάτρα, Ελλάδα</span></div>
            <div class="store-pickup"><span>Δυνατότητα παραλαβής από το κατάστημα</span></div>
            <a class="storefront-link" href="/shop/103/TestShop3/products.html?from=sku_page">Δες όλα τα προϊόντα</a>
          </div>
        </div>
        <article class="buybox">
          <div class="price-box">
            <div class="price-and-installments"></div>
            <div class="final-price">
              <span class="integer-part">945</span>
              <span class="decimal-part">00</span>
            </div>
          </div>
        </article>
      `;

      const result: ProductPriceData = await SkroutzClient.getCurrentProductData();

      expect(result.buyThroughSkroutz).toEqual({
        price: 945,
        shippingCost: 5,
        totalPrice: 950,
        shopId: 103,
      });
    });

    it('should match the buybox against raw_price when ecommerce_final_price equals raw_price plus shipping', async () => {
      // Mirrors real Skroutz API behaviour where ecommerce_final_price = raw_price + shipping_cost
      // and the buybox .final-price shows the net/raw price, not the total.
      const ecProductData: ProductData = {
        product_card_ids: [10],
        sponsored_product_card_ids: [],
        disabled_product_ids: [],
        product_cards: {
          '10': {
            id: 10,
            shop_id: 5527,
            price: '20,96 €',
            shipping_cost: 3.5,
            raw_price: 20.96,
            sponsored: false,
            ecommerce_final_price: 24.46, // raw_price + shipping_cost
            marketplace: false,
            shop_details_icons: [],
            products: [],
            ecommerce_available: true,
            only_available_through_fbs: false,
            official_reseller: false,
            expert_seller: false,
            sponsored_by_merchant_tracking_url: '',
            merchant_funded_installments: false,
            sponsored_by_merchant_follow_cookie_link_data_cart: {},
            discount_voucher_active: false,
            fbs_active: false,
            force_cargo_shipping_benefits: false,
            ecommerce_final_price_formatted: '24,46 €',
            ecommerce_payment_method_cost_formatted: null,
            ecommerce_payment_method_cost_supported: null,
            ecommerce_shipping_cost_formatted: '3,50 €',
            fbm: false,
            final_price: 24.46,
            final_price_formatted: '24,46 €',
            final_price_without_payment_cost_formatted: '24,46 €',
            has_merchant_loyalty_points: false,
            loyalty_points: '21',
            net_price_formatted: '20,96 €',
            no_credit_card: false,
            payment_method_cost_formatted: null,
            payment_method_cost_supported: null,
            shipping_cost_formatted: '+ 3,50 €',
            untracked_redirect_supported: true,
            coupon_info: null,
          },
        },
        shop_count: 1,
        price_min: '20,96 €',
        price_drop_percentage: null,
      };

      global.fetch = vi.fn().mockImplementation((input: RequestInfo | URL) => {
        const url = String(input);
        if (url.includes('filter_products.json')) {
          return Promise.resolve({ ok: true, json: vi.fn().mockResolvedValue(ecProductData) });
        }
        if (url.includes('product_cards_nearest_location.json')) {
          return Promise.resolve({ ok: true, json: vi.fn().mockResolvedValue([]) });
        }
        if (url.includes('refresh_show')) {
          return Promise.resolve({ ok: true, text: vi.fn().mockResolvedValue('<div></div>') });
        }
        return Promise.reject(new Error(`Unexpected fetch URL: ${url}`));
      }) as unknown as typeof global.fetch;

      document.body.innerHTML = `
        <meta itemprop="sku" content="12345678">
        <article class="buybox">
          <div class="price-box">
            <div class="price-and-installments"></div>
            <div class="final-price">
              <span class="integer-part">20</span>
              <span class="decimal-part">96</span>
            </div>
          </div>
        </article>
      `;

      const result: ProductPriceData = await SkroutzClient.getCurrentProductData();

      expect(result.buyThroughSkroutz).toEqual({
        price: 20.96,
        shippingCost: 3.5,
        totalPrice: 24.46,
        shopId: 5527,
      });
    });

    it('should match the buybox against raw_price when the API value has floating point noise', async () => {
      const noisyPriceProductData: ProductData = {
        product_card_ids: [11],
        sponsored_product_card_ids: [],
        disabled_product_ids: [],
        product_cards: {
          '11': {
            id: 11,
            shop_id: 13113,
            price: '17,36 €',
            shipping_cost: 3.5,
            raw_price: 17.360000000000003,
            sponsored: false,
            ecommerce_final_price: 20.86,
            marketplace: false,
            shop_details_icons: [],
            products: [],
            ecommerce_available: true,
            only_available_through_fbs: false,
            official_reseller: false,
            expert_seller: false,
            sponsored_by_merchant_tracking_url: '',
            merchant_funded_installments: false,
            sponsored_by_merchant_follow_cookie_link_data_cart: {},
            discount_voucher_active: false,
            fbs_active: true,
            force_cargo_shipping_benefits: false,
            ecommerce_final_price_formatted: '20,86 €',
            ecommerce_payment_method_cost_formatted: null,
            ecommerce_payment_method_cost_supported: null,
            ecommerce_shipping_cost_formatted: '3,50 €',
            fbm: false,
            final_price: 20.86,
            final_price_formatted: '20,86 €',
            final_price_without_payment_cost_formatted: '20,86 €',
            has_merchant_loyalty_points: false,
            loyalty_points: '',
            net_price_formatted: '17,36 €',
            no_credit_card: false,
            payment_method_cost_formatted: null,
            payment_method_cost_supported: null,
            shipping_cost_formatted: '3,50 €',
            untracked_redirect_supported: false,
            coupon_info: null,
          },
        },
        shop_count: 1,
        price_min: '17,36 €',
        price_drop_percentage: null,
      };

      global.fetch = vi.fn().mockImplementation((input: RequestInfo | URL) => {
        const url = String(input);

        if (url.includes('filter_products.json')) {
          return Promise.resolve({
            ok: true,
            json: vi.fn().mockResolvedValue(noisyPriceProductData),
          });
        }

        if (url.includes('product_cards_nearest_location.json')) {
          return Promise.resolve({
            ok: true,
            json: vi.fn().mockResolvedValue([]),
          });
        }

        if (url.includes('refresh_show')) {
          return Promise.resolve({
            ok: true,
            text: vi.fn().mockResolvedValue('<div></div>'),
          });
        }

        return Promise.reject(new Error(`Unexpected fetch URL: ${url}`));
      }) as unknown as typeof global.fetch;

      document.body.innerHTML = `
        <meta itemprop="sku" content="12345678">
        <article class="buybox">
          <div class="price-box">
            <div class="price-and-installments"></div>
            <div class="final-price">
              <span class="integer-part">17</span>
              <span class="decimal-part">36</span>
            </div>
          </div>
        </article>
      `;

      const result: ProductPriceData = await SkroutzClient.getCurrentProductData();

      expect(result.buyThroughSkroutz).toEqual({
        price: 17.360000000000003,
        shippingCost: 3.5,
        totalPrice: 20.860000000000003,
        shopId: 13113,
      });
    });

    it('should match the buybox against the active merchant shop when price fields do not match', async () => {
      const mismatchedBuyboxProductData: ProductData = {
        product_card_ids: [12, 13],
        sponsored_product_card_ids: [],
        disabled_product_ids: [],
        product_cards: {
          '12': {
            id: 12,
            shop_id: 13113,
            price: '17,50 €',
            shipping_cost: 3.5,
            raw_price: 17.5,
            sponsored: false,
            ecommerce_final_price: 20.95,
            marketplace: false,
            shop_details_icons: [],
            products: [],
            ecommerce_available: true,
            only_available_through_fbs: false,
            official_reseller: false,
            expert_seller: false,
            sponsored_by_merchant_tracking_url: '',
            merchant_funded_installments: false,
            sponsored_by_merchant_follow_cookie_link_data_cart: {},
            discount_voucher_active: false,
            fbs_active: true,
            force_cargo_shipping_benefits: false,
            ecommerce_final_price_formatted: '20,95 €',
            ecommerce_payment_method_cost_formatted: null,
            ecommerce_payment_method_cost_supported: null,
            ecommerce_shipping_cost_formatted: '3,50 €',
            fbm: false,
            final_price: 20.95,
            final_price_formatted: '20,95 €',
            final_price_without_payment_cost_formatted: '20,95 €',
            has_merchant_loyalty_points: false,
            loyalty_points: '',
            net_price_formatted: '17,50 €',
            no_credit_card: false,
            payment_method_cost_formatted: null,
            payment_method_cost_supported: null,
            shipping_cost_formatted: '3,50 €',
            untracked_redirect_supported: false,
            coupon_info: null,
          },
          '13': {
            id: 13,
            shop_id: 15000,
            price: '18,00 €',
            shipping_cost: 4,
            raw_price: 18,
            sponsored: false,
            ecommerce_final_price: 22,
            marketplace: false,
            shop_details_icons: [],
            products: [],
            ecommerce_available: true,
            only_available_through_fbs: false,
            official_reseller: false,
            expert_seller: false,
            sponsored_by_merchant_tracking_url: '',
            merchant_funded_installments: false,
            sponsored_by_merchant_follow_cookie_link_data_cart: {},
            discount_voucher_active: false,
            fbs_active: true,
            force_cargo_shipping_benefits: false,
            ecommerce_final_price_formatted: '22,00 €',
            ecommerce_payment_method_cost_formatted: null,
            ecommerce_payment_method_cost_supported: null,
            ecommerce_shipping_cost_formatted: '4,00 €',
            fbm: false,
            final_price: 22,
            final_price_formatted: '22,00 €',
            final_price_without_payment_cost_formatted: '22,00 €',
            has_merchant_loyalty_points: false,
            loyalty_points: '',
            net_price_formatted: '18,00 €',
            no_credit_card: false,
            payment_method_cost_formatted: null,
            payment_method_cost_supported: null,
            shipping_cost_formatted: '4,00 €',
            untracked_redirect_supported: false,
            coupon_info: null,
          },
        },
        shop_count: 2,
        price_min: '17,50 €',
        price_drop_percentage: null,
      };

      global.fetch = vi.fn().mockImplementation((input: RequestInfo | URL) => {
        const url = String(input);

        if (url.includes('filter_products.json')) {
          return Promise.resolve({
            ok: true,
            json: vi.fn().mockResolvedValue(mismatchedBuyboxProductData),
          });
        }

        if (url.includes('product_cards_nearest_location.json')) {
          return Promise.resolve({
            ok: true,
            json: vi.fn().mockResolvedValue([]),
          });
        }

        if (url.includes('refresh_show')) {
          return Promise.resolve({
            ok: true,
            text: vi.fn().mockResolvedValue('<div></div>'),
          });
        }

        return Promise.reject(new Error(`Unexpected fetch URL: ${url}`));
      }) as unknown as typeof global.fetch;

      document.body.innerHTML = `
        <meta itemprop="sku" content="12345678">
        <article class="buybox">
          <div class="price-box">
            <div class="price-and-installments"></div>
            <div class="final-price">
              <span class="integer-part">17</span>
              <span class="decimal-part">36</span>
            </div>
          </div>
          <div class="merchant-box">
            <div class="merchant-box-bottom-content">
              <a class="store-link" href="/shop/13113/Bella-Rosa/products.html?from=sku_page">Bella Rosa</a>
            </div>
          </div>
        </article>
      `;

      const result: ProductPriceData = await SkroutzClient.getCurrentProductData();

      expect(result.buyThroughSkroutz).toEqual({
        price: 17.36,
        shippingCost: 3.5,
        totalPrice: 20.86,
        shopId: 13113,
      });
    });

    it('should throw an error if fetch fails', async () => {
      // Mock failed fetch response
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 404,
      }) as unknown as typeof global.fetch;

      // Act & Assert
      await expect(SkroutzClient.getCurrentProductData()).rejects.toThrow('Failed to fetch');
    });

    it('should match store cities against the selected user city when available', async () => {
      document.body.innerHTML = `
        <meta itemprop="sku" content="12345678">
        <div class="header-user-actions">
          <span class="country-picker-text js-cp-link" tabindex="0">Ηρακλειο Κρήτης 71305</span>
        </div>
        <div class="merchant-box">
          <div class="merchant-box-bottom-content">
            <div class="location"><span>Ηράκλειο, Ελλάδα</span></div>
            <div class="store-pickup"><span>Δυνατότητα παραλαβής από το κατάστημα</span></div>
            <a class="storefront-link" href="/shop/101/TestShop/products.html?from=sku_page">Δες όλα τα προϊόντα</a>
          </div>
        </div>
        <div class="merchant-box">
          <div class="merchant-box-bottom-content">
            <div class="location"><span>Αθήνα, Ελλάδα</span></div>
            <div class="store-pickup"><span>Δυνατότητα παραλαβής από το κατάστημα</span></div>
            <a class="storefront-link" href="/shop/102/TestShop2/products.html?from=sku_page">Δες όλα τα προϊόντα</a>
          </div>
        </div>
        <article class="offering-card">
          <div class="price">1.028<span class="comma">,</span><span>89</span></div>
        </article>
      `;

      const result = await SkroutzClient.getCurrentProductData();

      expect(result.storeAvailability).toEqual({
        availableShopCount: 3,
        cities: ['Αθήνα', 'Ηράκλειο'],
        userCity: 'Ηρακλειο Κρήτης',
        matchingCities: ['Ηράκλειο'],
        cityShopMap: {
          Αθήνα: [102],
          Ηράκλειο: [101],
        },
        orderCities: ['Πάτρα'],
        orderCityShopMap: {
          Πάτρα: [103],
        },
        onlineOnlyShopCount: 0,
      });
    });

    it('should keep price data working when store availability fetch fails', async () => {
      document.body.innerHTML = `
        <meta itemprop="sku" content="12345678">
        <article class="offering-card">
          <div class="price">1.028<span class="comma">,</span><span>89</span></div>
        </article>
      `;

      global.fetch = vi.fn().mockImplementation((input: RequestInfo | URL) => {
        const url = String(input);

        if (url.includes('filter_products.json')) {
          return Promise.resolve({
            ok: true,
            json: vi.fn().mockResolvedValue(mockProductData),
          });
        }

        if (url.includes('product_cards_nearest_location.json')) {
          return Promise.resolve({
            ok: false,
            status: 500,
          });
        }

        return Promise.reject(new Error(`Unexpected fetch URL: ${url}`));
      }) as unknown as typeof global.fetch;

      const result = await SkroutzClient.getCurrentProductData();

      expect(result.buyThroughStore).toEqual({
        price: 945,
        shippingCost: 5,
        totalPrice: 950,
        shopId: 103,
      });
      expect(result.storeAvailability).toEqual({
        availableShopCount: 3,
        cities: [],
        userCity: undefined,
        matchingCities: [],
        cityShopMap: {},
        orderCities: [],
        orderCityShopMap: {},
        onlineOnlyShopCount: 3,
      });
      expect(console.warn).toHaveBeenCalled();
    });

    it('should ignore locations that do not offer store pickup', async () => {
      document.body.innerHTML = `
        <meta itemprop="sku" content="12345678">
        <div class="merchant-box">
          <div class="merchant-box-bottom-content">
            <div class="location"><span>Θεσσαλονίκη, Ελλάδα</span></div>
          </div>
        </div>
        <div class="merchant-box">
          <div class="merchant-box-bottom-content">
            <div class="location"><span>Αχαρνές, Ελλάδα</span></div>
            <div class="store-pickup"><span>Δυνατότητα παραλαβής από το κατάστημα</span></div>
            <a class="storefront-link" href="/shop/102/TestShop2/products.html?from=sku_page">Δες όλα τα προϊόντα</a>
          </div>
        </div>
        <article class="offering-card">
          <div class="price">1.028<span class="comma">,</span><span>89</span></div>
        </article>
      `;

      global.fetch = vi.fn().mockImplementation((input: RequestInfo | URL) => {
        const url = String(input);

        if (url.includes('filter_products.json')) {
          return Promise.resolve({
            ok: true,
            json: vi.fn().mockResolvedValue(mockProductData),
          });
        }

        if (url.includes('product_cards_nearest_location.json')) {
          return Promise.resolve({
            ok: false,
            status: 500,
          });
        }

        return Promise.reject(new Error(`Unexpected fetch URL: ${url}`));
      }) as unknown as typeof global.fetch;

      const result = await SkroutzClient.getCurrentProductData();

      expect(result.storeAvailability).toEqual({
        availableShopCount: 3,
        cities: ['Αχαρνές'],
        userCity: undefined,
        matchingCities: [],
        cityShopMap: {
          Αχαρνές: [102],
        },
        orderCities: ['Θεσσαλονίκη'],
        orderCityShopMap: {
          Θεσσαλονίκη: [],
        },
        onlineOnlyShopCount: 2,
      });
      expect(fetch).toHaveBeenCalledWith(
        'https://www.skroutz.gr/s/product_cards_nearest_location.json',
        expect.any(Object),
      );
      expect(console.warn).toHaveBeenCalled();
    });

    it('should prefer the drawer city and keep explicit no-store-city results from the DOM', async () => {
      document.body.innerHTML = `
        <meta itemprop="sku" content="12345678">
        <div class="header-user-actions">
          <span class="country-picker-text js-cp-link" tabindex="0">Ελλάδα</span>
        </div>
        <div class="bottom-drawer-content">
          <div class="bottom-drawer-body">
            <div class="blp-prompt js-blp-prompt">
              <p><span>Υπολογισμός τιμών για:</span>Αθήνα</p>
              <button type="button" data-type="personalization-settings">Αλλαγή</button>
            </div>
            <div class="availability-message">
              <p>Το προϊόν δεν είναι διαθέσιμο στην πόλη σου, Αθήνα.</p>
              <p>Το προϊόν δεν έχει αυτή τη στιγμή διαθέσιμες πόλεις καταστημάτων.</p>
            </div>
            <div class="merchant-box">
              <div class="merchant-box-bottom-content">
                <div class="location"><span>Θεσσαλονίκη, Ελλάδα</span></div>
              </div>
            </div>
          </div>
        </div>
        <article class="offering-card">
          <div class="price">1.028<span class="comma">,</span><span>89</span></div>
        </article>
      `;

      const result = await SkroutzClient.getCurrentProductData();

      expect(result.storeAvailability).toEqual({
        availableShopCount: 3,
        cities: [],
        userCity: 'Αθήνα',
        matchingCities: [],
        cityShopMap: {},
        orderCities: ['Θεσσαλονίκη'],
        orderCityShopMap: {
          Θεσσαλονίκη: [],
        },
        onlineOnlyShopCount: 3,
      });
      expect(fetch).not.toHaveBeenCalledWith(
        'https://www.skroutz.gr/s/product_cards_nearest_location.json',
        expect.anything(),
      );
    });

    it('should use refresh_show markup when API and initial DOM do not expose locations', async () => {
      document.body.innerHTML = `
        <meta itemprop="sku" content="12345678">
        <div data-sku-page--index-refresh-show-url-value="/s/12345678/refresh_show"></div>
        <article class="offering-card">
          <div class="price">1.028<span class="comma">,</span><span>89</span></div>
        </article>
      `;

      global.fetch = vi.fn().mockImplementation((input: RequestInfo | URL) => {
        const url = String(input);

        if (url.includes('filter_products.json')) {
          return Promise.resolve({
            ok: true,
            json: vi.fn().mockResolvedValue(mockProductData),
          });
        }

        if (url.includes('product_cards_nearest_location.json')) {
          return Promise.resolve({
            ok: true,
            json: vi.fn().mockResolvedValue([
              {
                stores_count: 1,
                store_location_id: 10,
                store_location_address: {
                  city: '',
                  country: 'GR',
                  region: '',
                  street: '',
                  postcode: '',
                  full: '',
                },
                display_full_store_address: false,
                show_added_delay_message: false,
              },
            ]),
          });
        }

        if (url.includes('refresh_show')) {
          return Promise.resolve({
            ok: true,
            text: vi.fn().mockResolvedValue(`
              <div class="product-cards-drawer-wrapper">
                <div class="bottom-drawer open side-bar right product-cards-drawer">
                  <div class="bottom-drawer-content">
                    <div class="bottom-drawer-body">
                      <ol id="prices" class="sku-list">
                        <li class="product-card-redesigned">
                          <div class="merchant-box-bottom-content">
                            <div class="location"><span>Αθήνα, Ελλάδα</span></div>
                            <div class="store-pickup"><span>Δυνατότητα παραλαβής από το κατάστημα</span></div>
                            <a class="storefront-link" href="/shop/101/TestShop/products.html?from=sku_page">Δες όλα τα προϊόντα</a>
                          </div>
                        </li>
                        <li class="product-card-redesigned">
                          <div class="merchant-box-bottom-content">
                            <div class="location"><span>Πάτρα, Ελλάδα</span></div>
                            <a class="storefront-link" href="/shop/102/TestShop2/products.html?from=sku_page">Δες όλα τα προϊόντα</a>
                          </div>
                        </li>
                      </ol>
                    </div>
                  </div>
                </div>
              </div>
            `),
          });
        }

        return Promise.reject(new Error(`Unexpected fetch URL: ${url}`));
      }) as unknown as typeof global.fetch;

      const result = await SkroutzClient.getCurrentProductData();

      expect(result.storeAvailability).toEqual({
        availableShopCount: 3,
        cities: ['Αθήνα'],
        userCity: undefined,
        matchingCities: [],
        cityShopMap: {
          Αθήνα: [101],
        },
        orderCities: ['Πάτρα'],
        orderCityShopMap: {
          Πάτρα: [102],
        },
        onlineOnlyShopCount: 1,
      });
      expect(fetch).toHaveBeenCalledWith('/s/12345678/refresh_show', expect.any(Object));
    });

    it('should fetch refresh_show on initial load when the DOM has no locations yet', async () => {
      document.body.innerHTML = `
        <meta itemprop="sku" content="12345678">
        <div data-sku-page--index-refresh-show-url-value="/s/12345678/refresh_show"></div>
        <article class="offering-card">
          <div class="price">1.028<span class="comma">,</span><span>89</span></div>
        </article>
      `;

      global.fetch = vi.fn().mockImplementation((input: RequestInfo | URL) => {
        const url = String(input);

        if (url.includes('filter_products.json')) {
          return Promise.resolve({
            ok: true,
            json: vi.fn().mockResolvedValue(mockProductData),
          });
        }

        if (url.includes('product_cards_nearest_location.json')) {
          return Promise.resolve({
            ok: true,
            json: vi.fn().mockResolvedValue([
              {
                stores_count: 3,
                store_location_id: 10,
                store_location_address: {
                  city: 'Γλυφάδα',
                  country: 'GR',
                  region: 'Αττική',
                  street: '',
                  postcode: '',
                  full: 'Γλυφάδα, Αττική',
                },
                display_full_store_address: false,
                show_added_delay_message: false,
              },
              {
                stores_count: 3,
                store_location_id: 11,
                store_location_address: {
                  city: 'Γλυφάδα',
                  country: 'GR',
                  region: 'Αττική',
                  street: '',
                  postcode: '',
                  full: 'Γλυφάδα, Αττική',
                },
                display_full_store_address: false,
                show_added_delay_message: false,
              },
              {
                stores_count: 3,
                store_location_id: 12,
                store_location_address: {
                  city: 'Γλυφάδα',
                  country: 'GR',
                  region: 'Αττική',
                  street: '',
                  postcode: '',
                  full: 'Γλυφάδα, Αττική',
                },
                display_full_store_address: false,
                show_added_delay_message: false,
              },
            ]),
          });
        }

        if (url.includes('refresh_show')) {
          return Promise.resolve({
            ok: true,
            text: vi.fn().mockResolvedValue(`
              <div class="product-cards-drawer-wrapper">
                <div class="bottom-drawer open side-bar right product-cards-drawer">
                  <div class="bottom-drawer-content">
                    <div class="bottom-drawer-body">
                      <ol id="prices" class="sku-list">
                        <li class="product-card-redesigned">
                          <div class="merchant-box-bottom-content">
                            <div class="location"><span>Γλυφάδα, Ελλάδα</span></div>
                            <div class="store-pickup"><span>Δυνατότητα παραλαβής από το κατάστημα</span></div>
                            <a class="storefront-link" href="/shop/101/ShopA/products.html?from=sku_page">Link</a>
                          </div>
                        </li>
                        <li class="product-card-redesigned">
                          <div class="merchant-box-bottom-content">
                            <div class="location"><span>Θεσσαλονίκη, Ελλάδα</span></div>
                            <div class="store-pickup"><span>Δυνατότητα παραλαβής από το κατάστημα</span></div>
                            <a class="storefront-link" href="/shop/102/ShopB/products.html?from=sku_page">Link</a>
                          </div>
                        </li>
                        <li class="product-card-redesigned">
                          <div class="merchant-box-bottom-content">
                            <div class="location"><span>Πάτρα, Ελλάδα</span></div>
                            <div class="store-pickup"><span>Δυνατότητα παραλαβής από το κατάστημα</span></div>
                            <a class="storefront-link" href="/shop/103/ShopC/products.html?from=sku_page">Link</a>
                          </div>
                        </li>
                      </ol>
                    </div>
                  </div>
                </div>
              </div>
            `),
          });
        }

        return Promise.reject(new Error(`Unexpected fetch URL: ${url}`));
      }) as unknown as typeof global.fetch;

      const result = await SkroutzClient.getCurrentProductData();

      expect(result.storeAvailability.cities).toEqual(['Γλυφάδα', 'Θεσσαλονίκη', 'Πάτρα']);
      expect(fetch).toHaveBeenCalledWith('/s/12345678/refresh_show', expect.any(Object));
    });

    it('should merge all pickup-only cities from refresh_show when API returns only nearest location', async () => {
      document.body.innerHTML = `
        <meta itemprop="sku" content="12345678">
        <div data-sku-page--index-refresh-show-url-value="/s/12345678/refresh_show"></div>
        <article class="offering-card">
          <div class="price">1.028<span class="comma">,</span><span>89</span></div>
        </article>
        <div class="merchant-box-bottom-content">
          <div class="location"><span>Γλυφάδα, Ελλάδα</span></div>
          <div class="store-pickup"><span>Δυνατότητα παραλαβής από το κατάστημα</span></div>
          <a class="storefront-link" href="/shop/201/ShopA/products.html?from=sku_page">Link</a>
        </div>
      `;

      global.fetch = vi.fn().mockImplementation((input: RequestInfo | URL) => {
        const url = String(input);

        if (url.includes('filter_products.json')) {
          return Promise.resolve({
            ok: true,
            json: vi.fn().mockResolvedValue(mockProductData),
          });
        }

        if (url.includes('product_cards_nearest_location.json')) {
          // API returns only 1 nearest entry out of 3 stores
          return Promise.resolve({
            ok: true,
            json: vi.fn().mockResolvedValue([
              {
                stores_count: 1,
                store_location_id: 10,
                store_location_address: {
                  city: 'Γλυφάδα',
                  country: 'GR',
                  region: 'Αττική',
                  street: '',
                  postcode: '',
                  full: 'Γλυφάδα, Αττική',
                },
                display_full_store_address: false,
                show_added_delay_message: false,
              },
            ]),
          });
        }

        if (url.includes('refresh_show')) {
          // Drawer has 3 stores ALL with store-pickup
          return Promise.resolve({
            ok: true,
            text: vi.fn().mockResolvedValue(`
              <div class="product-cards-drawer-wrapper">
                <div class="bottom-drawer open side-bar right product-cards-drawer">
                  <div class="bottom-drawer-content">
                    <div class="bottom-drawer-body">
                      <ol id="prices" class="sku-list">
                        <li class="product-card-redesigned">
                          <div class="merchant-box-bottom-content">
                            <div class="location"><span>Γλυφάδα, Ελλάδα</span></div>
                            <div class="store-pickup"><span>Δυνατότητα παραλαβής από το κατάστημα</span></div>
                            <a class="storefront-link" href="/shop/201/ShopA/products.html?from=sku_page">Link</a>
                          </div>
                        </li>
                        <li class="product-card-redesigned">
                          <div class="merchant-box-bottom-content">
                            <div class="location"><span>Θεσσαλονίκη, Ελλάδα</span></div>
                            <div class="store-pickup"><span>Δυνατότητα παραλαβής από το κατάστημα</span></div>
                            <a class="storefront-link" href="/shop/202/ShopB/products.html?from=sku_page">Link</a>
                          </div>
                        </li>
                        <li class="product-card-redesigned">
                          <div class="merchant-box-bottom-content">
                            <div class="location"><span>Πάτρα, Ελλάδα</span></div>
                            <div class="store-pickup"><span>Δυνατότητα παραλαβής από το κατάστημα</span></div>
                            <a class="storefront-link" href="/shop/203/ShopC/products.html?from=sku_page">Link</a>
                          </div>
                        </li>
                      </ol>
                    </div>
                  </div>
                </div>
              </div>
            `),
          });
        }

        return Promise.reject(new Error(`Unexpected fetch URL: ${url}`));
      }) as unknown as typeof global.fetch;

      const result = await SkroutzClient.getCurrentProductData();

      expect(result.storeAvailability.cities).toContain('Γλυφάδα');
      expect(result.storeAvailability.cities).toContain('Θεσσαλονίκη');
      expect(result.storeAvailability.cities).toContain('Πάτρα');
      expect(result.storeAvailability.cities).toHaveLength(3);
      expect(result.storeAvailability.cityShopMap['Γλυφάδα']).toContain(201);
      expect(result.storeAvailability.cityShopMap['Θεσσαλονίκη']).toContain(202);
      expect(result.storeAvailability.cityShopMap['Πάτρα']).toContain(203);
      expect(fetch).toHaveBeenCalledWith('/s/12345678/refresh_show', expect.any(Object));
    });

    it('should fetch refresh_show when the API collapses multiple shops into one city', async () => {
      document.body.innerHTML = `
        <meta itemprop="sku" content="12345678">
        <div data-sku-page--index-refresh-show-url-value="/s/12345678/refresh_show"></div>
        <article class="offering-card">
          <div class="price">1.028<span class="comma">,</span><span>89</span></div>
        </article>
        <div class="merchant-box-bottom-content">
          <div class="location"><span>Γλυφάδα, Ελλάδα</span></div>
          <div class="store-pickup"><span>Δυνατότητα παραλαβής από το κατάστημα</span></div>
          <a class="storefront-link" href="/shop/101/ShopA/products.html?from=sku_page">Link</a>
        </div>
      `;

      global.fetch = vi.fn().mockImplementation((input: RequestInfo | URL) => {
        const url = String(input);

        if (url.includes('filter_products.json')) {
          return Promise.resolve({
            ok: true,
            json: vi.fn().mockResolvedValue(mockProductData),
          });
        }

        if (url.includes('product_cards_nearest_location.json')) {
          return Promise.resolve({
            ok: true,
            json: vi.fn().mockResolvedValue([
              {
                stores_count: 3,
                store_location_id: 10,
                store_location_address: {
                  city: 'Γλυφάδα',
                  country: 'GR',
                  region: 'Αττική',
                  street: '',
                  postcode: '',
                  full: 'Γλυφάδα, Αττική',
                },
                display_full_store_address: false,
                show_added_delay_message: false,
              },
              {
                stores_count: 3,
                store_location_id: 11,
                store_location_address: {
                  city: 'Γλυφάδα',
                  country: 'GR',
                  region: 'Αττική',
                  street: '',
                  postcode: '',
                  full: 'Γλυφάδα, Αττική',
                },
                display_full_store_address: false,
                show_added_delay_message: false,
              },
              {
                stores_count: 3,
                store_location_id: 12,
                store_location_address: {
                  city: 'Γλυφάδα',
                  country: 'GR',
                  region: 'Αττική',
                  street: '',
                  postcode: '',
                  full: 'Γλυφάδα, Αττική',
                },
                display_full_store_address: false,
                show_added_delay_message: false,
              },
            ]),
          });
        }

        if (url.includes('refresh_show')) {
          return Promise.resolve({
            ok: true,
            text: vi.fn().mockResolvedValue(`
              <div class="product-cards-drawer-wrapper">
                <div class="bottom-drawer open side-bar right product-cards-drawer">
                  <div class="bottom-drawer-content">
                    <div class="bottom-drawer-body">
                      <ol id="prices" class="sku-list">
                        <li class="product-card-redesigned">
                          <div class="merchant-box-bottom-content">
                            <div class="location"><span>Γλυφάδα, Ελλάδα</span></div>
                            <div class="store-pickup"><span>Δυνατότητα παραλαβής από το κατάστημα</span></div>
                            <a class="storefront-link" href="/shop/101/ShopA/products.html?from=sku_page">Link</a>
                          </div>
                        </li>
                        <li class="product-card-redesigned">
                          <div class="merchant-box-bottom-content">
                            <div class="location"><span>Θεσσαλονίκη, Ελλάδα</span></div>
                            <div class="store-pickup"><span>Δυνατότητα παραλαβής από το κατάστημα</span></div>
                            <a class="storefront-link" href="/shop/102/ShopB/products.html?from=sku_page">Link</a>
                          </div>
                        </li>
                        <li class="product-card-redesigned">
                          <div class="merchant-box-bottom-content">
                            <div class="location"><span>Πάτρα, Ελλάδα</span></div>
                            <div class="store-pickup"><span>Δυνατότητα παραλαβής από το κατάστημα</span></div>
                            <a class="storefront-link" href="/shop/103/ShopC/products.html?from=sku_page">Link</a>
                          </div>
                        </li>
                      </ol>
                    </div>
                  </div>
                </div>
              </div>
            `),
          });
        }

        return Promise.reject(new Error(`Unexpected fetch URL: ${url}`));
      }) as unknown as typeof global.fetch;

      const result = await SkroutzClient.getCurrentProductData();

      expect(result.storeAvailability.cities).toEqual(['Γλυφάδα', 'Θεσσαλονίκη', 'Πάτρα']);
      expect(result.storeAvailability.cityShopMap).toEqual({
        Γλυφάδα: [101],
        Θεσσαλονίκη: [102],
        Πάτρα: [103],
      });
      expect(result.storeAvailability.onlineOnlyShopCount).toBe(0);
      expect(fetch).toHaveBeenCalledWith('/s/12345678/refresh_show', expect.any(Object));
    });

    it('should parse all locations from merchant-box-bottom rows with stock indicators', async () => {
      document.body.innerHTML = `
        <meta itemprop="sku" content="12345678">
        <article class="offering-card">
          <div class="price">1.028<span class="comma">,</span><span>89</span></div>
        </article>
        <div class="merchant-box-bottom expanded">
          <div class="rating-info"><span>4,7</span></div>
          <div class="location"><span>Καλλιθέα, Ελλάδα</span></div>
          <div class="stock"><span>2 τεμάχια</span></div>
          <a href="/shop/2164/Techstores/products.html?from=sku_page" class="storefront-link"><span>Δες όλα τα προϊόντα του καταστήματος</span></a>
        </div>
        <div class="merchant-box-bottom expanded">
          <div class="rating-info"><span>4,6</span></div>
          <div class="location"><span>Πειραιάς, Ελλάδα</span></div>
          <div class="stock"><span>1 τεμάχιο</span></div>
          <a href="/shop/2165/Shop2/products.html?from=sku_page" class="storefront-link"><span>Δες όλα τα προϊόντα του καταστήματος</span></a>
        </div>
        <div class="merchant-box-bottom expanded">
          <div class="rating-info"><span>4,9</span></div>
          <div class="location"><span>Αθήνα, Ελλάδα</span></div>
          <div class="stock"><span>3 τεμάχια</span></div>
          <a href="/shop/2166/Shop3/products.html?from=sku_page" class="storefront-link"><span>Δες όλα τα προϊόντα του καταστήματος</span></a>
        </div>
      `;

      global.fetch = vi.fn().mockImplementation((input: RequestInfo | URL) => {
        const url = String(input);

        if (url.includes('filter_products.json')) {
          return Promise.resolve({
            ok: true,
            json: vi.fn().mockResolvedValue(mockProductData),
          });
        }

        if (url.includes('product_cards_nearest_location.json')) {
          return Promise.resolve({
            ok: true,
            json: vi.fn().mockResolvedValue([]),
          });
        }

        if (url.includes('refresh_show')) {
          return Promise.resolve({
            ok: true,
            text: vi.fn().mockResolvedValue(document.body.innerHTML),
          });
        }

        return Promise.reject(new Error(`Unexpected fetch URL: ${url}`));
      }) as unknown as typeof global.fetch;

      const result = await SkroutzClient.getCurrentProductData();

      expect(result.storeAvailability.cities).toEqual(['Αθήνα', 'Καλλιθέα', 'Πειραιάς']);
      expect(result.storeAvailability.cityShopMap).toEqual({
        Αθήνα: [2166],
        Καλλιθέα: [2164],
        Πειραιάς: [2165],
      });
    });

    it('should throw an error if SKU meta tag is missing', async () => {
      // Remove the SKU meta tag
      document.body.innerHTML = `
        <article class="offering-card">
          <div class="price">1.028<span class="comma">,</span><span>89</span></div>
        </article>
      `;

      // Act & Assert
      await expect(SkroutzClient.getCurrentProductData()).rejects.toThrow(
        'Failed to fetch product SKU',
      );
    });

    it('should extract SKU from URL if meta tag is missing', async () => {
      const originalLocation = window.location;
      // Setup URL to contain SKU
      Object.defineProperty(window, 'location', {
        value: {
          pathname: '/s/12345678/product-name.html',
        },
        writable: true,
      });

      // Remove meta tag, keep price valid
      document.body.innerHTML = `
        <article class="offering-card">
          <div class="price">1.028<span class="comma">,</span><span>89</span></div>
        </article>
      `;

      const result = await SkroutzClient.getCurrentProductData();
      expect(result).toBeDefined();
      expect(fetch).toHaveBeenCalledWith(
        'https://www.skroutz.gr/s/12345678/filter_products.json',
        expect.any(Object),
      );

      // Cleanup
      Object.defineProperty(window, 'location', {
        value: originalLocation,
        writable: true,
      });
    });

    it('should throw an error if price element is missing', async () => {
      // Remove the price element
      document.body.innerHTML = `
        <meta itemprop="sku" content="12345678">
        <article class="offering-card"></article>
      `;

      // Act & Assert
      await expect(SkroutzClient.getCurrentProductData()).rejects.toThrow(
        'Failed to fetch/parse current product price',
      );
    });

    it('should handle invalid price format', async () => {
      // Set invalid price format
      document.body.innerHTML = `
        <meta itemprop="sku" content="12345678">
        <article class="offering-card">
          <div class="price">invalid<span class="comma">,</span><span>price</span></div>
        </article>
      `;

      // Act & Assert
      await expect(SkroutzClient.getCurrentProductData()).rejects.toThrow(
        'Failed to fetch/parse current product price',
      );
    });

    it('should handle fetch rejected promises', async () => {
      // Mock fetch that rejects
      global.fetch = vi
        .fn()
        .mockRejectedValue(new Error('Network error')) as unknown as typeof global.fetch;

      // Act & Assert
      await expect(SkroutzClient.getCurrentProductData()).rejects.toThrow('Network error');
    });
  });

  describe('price comparison', () => {
    it('should identify when store price is lower than Skroutz price', async () => {
      // Act
      const result: ProductPriceData = await SkroutzClient.getCurrentProductData();

      // Assert
      expect(result.buyThroughStore.totalPrice).toBeLessThan(result.buyThroughSkroutz.totalPrice);
      expect(result.buyThroughStore.totalPrice).toBe(950);
      expect(result.buyThroughSkroutz.totalPrice).toBe(1028.89);
    });

    it('should use ecommerce_final_price when available', async () => {
      // Act
      const result: ProductPriceData = await SkroutzClient.getCurrentProductData();

      // Assert
      expect(result.buyThroughStore.price).toBe(945);
      expect(result.buyThroughStore.price).not.toBe(950);
    });
  });
});
