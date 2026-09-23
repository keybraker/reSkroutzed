import { describe, expect, it } from 'vitest';

import { createToggleSeparator } from '../../../src/features/functions/createToggleSeparator';

describe('createToggleSeparator', () => {
  it('should create a divider element carrying the separator class', () => {
    // Act
    const separator = createToggleSeparator();

    // Assert
    expect(separator.tagName).toBe('DIV');
    expect(separator.classList.contains('toggle-separator')).toBe(true);
  });

  it('should hide the divider from assistive technology', () => {
    // Act
    const separator = createToggleSeparator();

    // Assert
    expect(separator.getAttribute('aria-hidden')).toBe('true');
  });
});
