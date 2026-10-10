import { describe, expect, it } from 'vitest';

import { createBetaTag } from '../../../src/features/functions/createBetaTag';

describe('createBetaTag', () => {
  it('renders a beta chip', () => {
    // Act
    const tag = createBetaTag();

    // Assert
    expect(tag.tagName).toBe('SPAN');
    expect(tag.textContent).toBe('beta');
    expect(tag.classList.contains('price-checker-beta-tag')).toBe(true);
  });
});
