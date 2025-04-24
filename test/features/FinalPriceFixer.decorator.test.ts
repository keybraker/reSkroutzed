import { describe, it, expect, beforeEach, afterEach } from 'vitest';

import { FinalPriceFixerDecorator } from '../../src/features/FinalPriceFixer.decorator';
import { Language } from '../../src/common/enums/Language.enum';
import { State } from '../../src/common/types/State.type';

describe('FinalPriceFixerDecorator', (): void => {
  let finalPriceFixerDecorator: FinalPriceFixerDecorator;
  let mockState: State;

  beforeEach((): void => {
    mockState = {
      language: Language.ENGLISH,
      darkMode: false,
      hideProductAds: false,
      hideVideoAds: false,
      hideShelfProductAds: false,
      hideSponsorships: false,
      productAdCount: 0,
      videoAdCount: 0,
      ShelfAdCount: 0,
      minimumPriceDifference: 1,
      sponsorshipAdCount: 0,
    };

    document.body.innerHTML = `
      <label class="toggle-switch-label">Show Final Price</label>
    `;

    finalPriceFixerDecorator = new FinalPriceFixerDecorator(mockState);
  });

  afterEach((): void => {
    document.body.innerHTML = '';
  });

  describe('execute', (): void => {
    it('should append "(with cash on delivery)" text in English', (): void => {
      // Act
      finalPriceFixerDecorator.execute();

      // Assert
      const label = document.querySelector('.toggle-switch-label');
      expect(label?.textContent).toBe('Show Final Price (with cash on delivery)');
    });

    it('should append "(με αντικαταβολή)" text in Greek', (): void => {
      // Arrange
      mockState.language = Language.GREEK;
      finalPriceFixerDecorator = new FinalPriceFixerDecorator(mockState);

      // Act
      finalPriceFixerDecorator.execute();

      // Assert
      const label = document.querySelector('.toggle-switch-label');
      expect(label?.textContent).toBe('Show Final Price (με αντικαταβολή)');
    });

    it('should not modify anything if the label does not exist', (): void => {
      // Arrange
      document.body.innerHTML = '<div>No label here</div>';

      // Act - should not throw an error
      const execute = (): void => finalPriceFixerDecorator.execute();

      // Assert
      expect(execute).not.toThrow();
      expect(document.body.innerHTML).toBe('<div>No label here</div>');
    });
  });
});
