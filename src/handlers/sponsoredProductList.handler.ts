import {
  isSponsored,
  updateSponsoredTextPlural,
  toggleVisibility,
} from '../utilities/sponsored.util';
import { State } from '../common/types/State.type';

export class SponsoredProductListHandler {
  private state: State;

  constructor(state: State) {
    this.state = state;
  }

  public flag(): void {
    const promotedBoxes = document.querySelectorAll('h2:not(.flagged-list-title)');

    [...promotedBoxes]?.filter(isSponsored)?.forEach((element) => this.flagPromotedBox(element));
  }

  private flagPromotedBox(promotedBox: Element): void {
    promotedBox.classList.add('flagged-list-title');
    updateSponsoredTextPlural(promotedBox, this.state.language);
    toggleVisibility(promotedBox, this.state);
  }
}
