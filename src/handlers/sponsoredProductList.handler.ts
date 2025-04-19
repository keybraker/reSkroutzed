
import { State } from '../common/types/State.type';
import { DomClient } from '../clients/dom/client';

export class SponsoredProductListHandler {
  private state: State;

  constructor(state: State) {
    this.state = state;
  }

  public flag(): void {
    const promotedBoxes = document.querySelectorAll('h2:not(.flagged-list-title)');

    [...promotedBoxes]?.filter(DomClient.isElementSponsored)?.forEach((element) => this.flagPromotedBox(element));
  }

  private flagPromotedBox(promotedBox: Element): void {
    promotedBox.classList.add('flagged-list-title');
    DomClient.updateSponsoredTextPlural(promotedBox, this.state.language);
    DomClient.toggleElementVisibility(promotedBox, this.state);
  }
}
