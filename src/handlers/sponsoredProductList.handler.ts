import { State } from '../common/types/State.type';
import { BaseHandler } from './base.handler';

export class SponsoredProductListHandler extends BaseHandler {
  constructor(state: State) {
    super(state);
  }

  public flag(): void {
    const promotedBoxes = this.getElements('h2:not(.flagged-list-title)');

    promotedBoxes
      .filter((element) => this.isSponsored(element))
      .forEach((element) => this.flagPromotedBox(element));
  }

  private flagPromotedBox(promotedBox: Element): void {
    this.flagElement(promotedBox, 'flagged-list-title');
    this.updateSponsoredText(promotedBox, false); // Use plural text
    this.toggleElementVisibility(promotedBox, !this.state.hideProductAds);
  }
}
