import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { SkroutzClient, ProductPriceData } from '../../../src/clients/skroutz/client';
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

  // Preserve original console.error
  const originalConsoleError = console.error;

  beforeEach(() => {
    // Mock document body and elements
    document.body.innerHTML = `
      <meta itemprop="sku" content="12345678">
      <article class="offering-card">
        <div class="price">1.028<span class="comma">,</span><span>89</span></div>
      </article>
    `;

    // Mock fetch API
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue(mockProductData),
    });

    // Silence console errors during tests to keep output clean
    console.error = vi.fn();
  });

  afterEach(() => {
    // Reset mocks
    vi.restoreAllMocks();
    document.body.innerHTML = '';

    // Restore console.error
    console.error = originalConsoleError;
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
    });

    it('should throw an error if fetch fails', async () => {
      // Mock failed fetch response
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 404,
      });

      // Act & Assert
      await expect(SkroutzClient.getCurrentProductData()).rejects.toThrow('Failed to fetch');
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

    it('should throw an error if price element is missing', async () => {
      // Remove the price element
      document.body.innerHTML = `
        <meta itemprop="sku" content="12345678">
        <article class="offering-card"></article>
      `;

      // Act & Assert
      await expect(SkroutzClient.getCurrentProductData()).rejects.toThrow('Failed to fetch price');
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
      await expect(SkroutzClient.getCurrentProductData()).rejects.toThrow('Failed to parse price');
    });

    it('should handle fetch rejected promises', async () => {
      // Mock fetch that rejects
      global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));

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
