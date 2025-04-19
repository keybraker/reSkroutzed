import { DomClient } from '../clients/dom/client';
import { State } from '../common/types/State.type';

export class SponsoredShelfHandler {
  private state: State;

  constructor(state: State) {
    this.state = state;
  }

  public flag(): void {
    this.resetShelfCount();

    const h4Elements = document.querySelectorAll('h4:not(.flagged-shelf)');

    [...h4Elements]
      .filter(DomClient.isElementSponsored)
      .forEach((element) => this.updateShelfCountAndVisibility(element));
  }

  private resetShelfCount(): void {
    const flaggedShelf = document.querySelectorAll('h4.flagged-shelf');

    if (flaggedShelf?.length === 0) {
      this.state.ShelfAdCount = 0;
    }
  }

  private updateShelfCountAndVisibility(h4Element: Element): void {
    this.state.ShelfAdCount++;

    h4Element.classList.add('sponsored-label');
    DomClient.updateSponsoredTextPlural(h4Element, this.state.language);

    const h4ParentElement = h4Element.parentElement;

    if (h4ParentElement) {
      h4ParentElement.classList.add('flagged-shelf');

      DomClient.updateSponsoredTextSingle(h4Element, this.state.language);

      DomClient.toggleElementVisibility(h4ParentElement, this.state);

      const sponsoredItems = h4ParentElement?.children[2]?.children[0]?.children;

      if (sponsoredItems) {
        [...sponsoredItems]?.forEach((element) => {
          this.state.productAdCount++;
          DomClient.flagElementAsSponsored(element);
          DomClient.updateSponsoredTextSingle(element, this.state.language);
        });
      }
    }
  }
}
