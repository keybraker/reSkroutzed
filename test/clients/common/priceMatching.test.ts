import { describe, expect, it } from 'vitest';

import {
  buildSearchQueryVariants,
  isVariantCompatible,
  scoreDealMatch,
} from '../../../src/clients/common/priceMatching';

const MACBOOK_QUERY =
  'Apple MacBook Pro 14.2" IPS Retina Display 120Hz (M5 Pro-15-Core/48GB/1TB SSD/16-Core GPU) Space Black (US Keyboard)';

const MACBOOK_48GB =
  'Apple MacBook Pro 14.2" IPS Retina Display 120Hz M5 Pro-15-Core/48GB/1TB SSD/16-Core GPU Space Black International English Keyboard';

const MACBOOK_24GB =
  'Apple MacBook Pro 14.2" IPS Retina Display 120Hz M5 Pro-15-Core / 24GB / 1TB SSD / 16-Core GPU Space Black US Keyboard';

describe('isVariantCompatible', () => {
  it('rejects a listing that differs only in memory capacity', () => {
    expect(isVariantCompatible(MACBOOK_QUERY, MACBOOK_24GB)).toBe(false);
  });

  it('accepts the listing that agrees on every spec', () => {
    expect(isVariantCompatible(MACBOOK_QUERY, MACBOOK_48GB)).toBe(true);
  });

  it('rejects a listing with a different storage size', () => {
    const twoTerabyte =
      'Apple MacBook Pro 14.2" IPS Retina Display 120Hz M5 Pro-15-Core/48GB/2TB SSD/16-Core GPU Space Black International English Keyboard';

    expect(isVariantCompatible(MACBOOK_QUERY, twoTerabyte)).toBe(false);
  });

  it('rejects a listing with a different GPU core count', () => {
    const twentyCoreGpu =
      'Apple MacBook Pro 14.2" IPS Retina Display 120Hz M5 Pro-15-Core/48GB/1TB SSD/20-Core GPU Space Black International English Keyboard';

    expect(isVariantCompatible(MACBOOK_QUERY, twentyCoreGpu)).toBe(false);
  });

  it('rejects a listing with a different screen size', () => {
    const sixteenInch =
      'Apple MacBook Pro 16.2" IPS Retina Display 120Hz M5 Pro-18-Core / 48GB / 1TB SSD / 20-Core GPU Space Black US Keyboard';

    expect(isVariantCompatible(MACBOOK_QUERY, sixteenInch)).toBe(false);
  });

  it('rejects a listing with a different refresh rate', () => {
    expect(
      isVariantCompatible(
        'Samsung Smart Τηλεόραση 55" 4K UHD 120Hz UE55U8000',
        'Samsung Smart Τηλεόραση 55" 4K UHD 60Hz UE55U8000',
      ),
    ).toBe(false);
  });

  it('accepts a listing that simply omits the specs', () => {
    expect(isVariantCompatible('Apple iPhone 17 Pro Max 256GB', 'Apple iPhone 17 Pro Max')).toBe(
      true,
    );
  });

  it('accepts a listing that lists fewer capacity values than the query', () => {
    // Skroutz writes "12GB 256GB"; provider catalogues often keep only the
    // storage, which is not a different configuration.
    expect(
      isVariantCompatible(
        'Samsung Galaxy S26 Ultra 5G 12GB 256GB Titanium Black',
        'Samsung Galaxy S26 Ultra 5G 256GB Titanium Black',
      ),
    ).toBe(true);
  });

  it('accepts the "12/256GB" shorthand for the same configuration', () => {
    expect(
      isVariantCompatible(
        'Samsung Galaxy S26 Ultra 5G 12GB 256GB Titanium Black',
        'Samsung Galaxy S26 Ultra 5G 12/256GB Titanium Black',
      ),
    ).toBe(true);
  });

  it('accepts a listing that states capacity values the query omits', () => {
    // The reverse of the case above: Skroutz kept only the storage, the
    // provider lists RAM as well. Still the same configuration.
    expect(
      isVariantCompatible(
        'Samsung Galaxy S26 Ultra 5G 256GB Titanium Black',
        'Samsung Galaxy S26 Ultra 5G 12GB 256GB Titanium Black',
      ),
    ).toBe(true);
  });

  it('rejects a listing for a different model that shares the brand', () => {
    // Real payload from BestPrice's /api/getDeals for the mobile-phone
    // category, which is the only deal it returns.
    expect(
      isVariantCompatible(
        'Samsung Galaxy S26 Ultra 5G 12GB 256GB Titanium Black',
        'Samsung Galaxy Z Fold5 5G 512GB',
      ),
    ).toBe(false);
  });

  it('ignores thousands separators in specs', () => {
    expect(
      isVariantCompatible(
        'Samsung Galaxy A56 5G 8GB 128GB 5000mAh',
        'Samsung Galaxy A56 5G 8GB 128GB 5.000 mAh',
      ),
    ).toBe(true);
  });

  it('rejects a listing that claims a capacity the query does not', () => {
    expect(
      isVariantCompatible(
        'Samsung Galaxy S26 Ultra 5G 12GB 256GB Titanium Black',
        'Samsung Galaxy S26 Ultra 5G 12GB 512GB Titanium Black',
      ),
    ).toBe(false);
  });

  it('passes titles that carry no configuration tokens at all', () => {
    expect(isVariantCompatible('Ninja Air Fryer AF500EU', 'Ninja Air Fryer AF500EU')).toBe(true);
  });
});

describe('scoreDealMatch', () => {
  it('never scores a configuration mismatch as a match', () => {
    expect(scoreDealMatch({ title: MACBOOK_24GB }, MACBOOK_QUERY)).toBe(Number.NEGATIVE_INFINITY);
  });

  it('still scores the matching configuration', () => {
    const score = scoreDealMatch({ title: MACBOOK_48GB }, MACBOOK_QUERY);

    expect(Number.isFinite(score)).toBe(true);
    expect(score).toBeGreaterThan(0);
  });

  it('keeps penalising accessory listings that share the specs', () => {
    const accessory = scoreDealMatch(
      { title: 'Apple iPhone 17 Pro Max 256GB Θήκη' },
      'Apple iPhone 17 Pro Max 256GB',
    );
    const product = scoreDealMatch(
      { title: 'Apple iPhone 17 Pro Max 256GB' },
      'Apple iPhone 17 Pro Max 256GB',
    );

    expect(accessory).toBeLessThan(product);
  });

  it('matches the real BestPrice listing for this Skroutz page', () => {
    // The query the extension builds from the product slug, and the listing
    // BestPrice returns for "apple macbook pro 14 m5 pro space black".
    const slugQuery =
      'apple macbook pro 14 2 ips retina display 120hz m5 pro 15 core 48gb 1tb ssd 16 core gpu space black us keyboard';
    const listing = 'Apple MacBook Pro 14" 2026 (M5 Pro Chip 15-Core/48GB/1TB SSD/16-Core GPU)';

    expect(isVariantCompatible(slugQuery, listing)).toBe(true);
    expect(scoreDealMatch({ title: listing }, slugQuery)).toBeGreaterThan(0);
  });

  it('still rejects the 16" sibling the same search returns', () => {
    const slugQuery =
      'apple macbook pro 14 2 ips retina display 120hz m5 pro 15 core 48gb 1tb ssd 16 core gpu space black us keyboard';
    const sixteenInch = 'Apple MacBook Pro 16" 2026 (M5 Pro Chip 18-Core/48GB/1TB SSD/20-Core GPU)';

    expect(isVariantCompatible(slugQuery, sixteenInch)).toBe(false);
    expect(scoreDealMatch({ title: sixteenInch }, slugQuery)).toBe(Number.NEGATIVE_INFINITY);
  });
});

describe('buildSearchQueryVariants', () => {
  // The query the extension derives from this product's slug.
  const MACBOOK_SLUG_QUERY =
    'apple macbook pro 14 2 ips retina display 120hz m5 pro 15 core 48gb 1tb ssd 16 core gpu space black us keyboard';

  it('keeps the literal query first so specific lookups keep winning', () => {
    expect(buildSearchQueryVariants(MACBOOK_SLUG_QUERY)[0]).toBe(MACBOOK_SLUG_QUERY);
  });

  it('offers a broad query stripped of the spec and filler terms', () => {
    // BestPrice ANDs every term and answers this slug with "Δεν βρέθηκαν
    // αποτελέσματα … Χρησιμοποίησε λιγότερους όρους", while the stripped form
    // returns the exact machine.
    expect(buildSearchQueryVariants(MACBOOK_SLUG_QUERY)).toContain(
      'apple macbook pro 14 m5 pro space black',
    );
  });

  it('drops core counts but keeps the screen size', () => {
    const variants = buildSearchQueryVariants(
      'Apple MacBook Pro 14 IPS Retina Display 120Hz (M5 Pro-15-Core/48GB/1TB SSD/16-Core GPU)',
    );

    expect(variants).toContain('Apple MacBook Pro 14 M5 Pro');
  });

  it('keeps model names that embed a number', () => {
    const variants = buildSearchQueryVariants(
      'Samsung Galaxy S26 Ultra 5G 12GB 256GB Titanium Black',
    );

    expect(variants).toContain('Samsung Galaxy S26 Ultra 5G Titanium Black');
  });
});
