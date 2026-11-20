import { describe, expect, it } from 'vitest';

import { Language } from '../../../src/common/enums/Language.enum';
import { formatStoreCount } from '../../../src/common/functions/formatStoreCount';

describe('formatStoreCount', () => {
  it('uses the Greek plural for a shop count', () => {
    // Arrange / Act
    const label = formatStoreCount(47, Language.GREEK);

    // Assert
    expect(label).toBe('47 καταστήματα');
  });

  it('uses the Greek singular for a single shop', () => {
    // Arrange / Act
    const label = formatStoreCount(1, Language.GREEK);

    // Assert
    expect(label).toBe('1 κατάστημα');
  });

  it('uses the English plural and singular', () => {
    // Arrange / Act
    const many = formatStoreCount(47, Language.ENGLISH);
    const single = formatStoreCount(1, Language.ENGLISH);

    // Assert
    expect(many).toBe('47 stores');
    expect(single).toBe('1 store');
  });
});
