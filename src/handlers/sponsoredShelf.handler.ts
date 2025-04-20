import { DomClient } from '../clients/dom/client';
import { State } from '../common/types/State.type';
import { BaseHandler } from './base.handler';

export class SponsoredShelfHandler extends BaseHandler {
  constructor(state: State) {
    super(state);
  }

  public flag(): void {
    this.resetShelfCount();

    const h4Elements = this.getElements('h4:not(.flagged-shelf)');

    h4Elements
      .filter(this.isSponsored)
      .forEach((element) => this.updateShelfCountAndVisibility(element));
  }

  private resetShelfCount(): void {
    const flaggedShelf = this.getElements('h4.flagged-shelf');

    if (flaggedShelf.length === 0) {
      this.state.ShelfAdCount = 0;
    }
  }

  private updateShelfCountAndVisibility(h4Element: Element): void {
    this.state.ShelfAdCount++;

    this.flagElement(h4Element, 'sponsored-label');
    this.updateSponsoredText(h4Element, false); // false for plural

    const h4ParentElement = h4Element.parentElement;

    if (h4ParentElement) {
      this.flagElement(h4ParentElement, 'flagged-shelf');
      this.updateSponsoredText(h4Element, true); // true for singular
      this.toggleElementVisibility(h4ParentElement, !this.state.hideProductAds);

      const sponsoredItems = h4ParentElement?.children[2]?.children[0]?.children;

      if (sponsoredItems) {
        Array.from(sponsoredItems).forEach((element) => {
          this.state.productAdCount++;
          DomClient.flagElementAsSponsored(element);
          this.updateSponsoredText(element, true);
        });
      }
    }
  }
}
