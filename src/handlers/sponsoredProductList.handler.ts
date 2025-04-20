import { State } from '../common/types/State.type';
import { BaseHandler } from './base.handler';

export class SponsoredProductListHandler extends BaseHandler {
  private readonly sponsoredProductListClasses = ['flagged-list-title'];

  constructor(state: State) {
    super(state);
  }

  public flag(): void {
    const promotedBoxes = this.getElements('h2:not(.flagged-list-title)');

    promotedBoxes
      .filter((element) => this.isSponsored(element))
      .forEach((element) => this.flagPromotedBox(element));
  }

  public visibilityUpdate(): void {
    const promotedBoxes = this.getElements(this.sponsoredProductListClasses.join(', '));

    promotedBoxes.forEach((promotedBox) => {
      this.toggleElementVisibility(promotedBox, !this.state.hideProductAds);
    });
  }

  private flagPromotedBox(promotedBox: Element): void {
    this.flagElement(promotedBox, 'flagged-list-title');
    this.updateSponsoredText(promotedBox, false); // Use plural text
    this.toggleElementVisibility(promotedBox, !this.state.hideProductAds);
  }
}
