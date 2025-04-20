import { DomClient } from '../clients/dom/client';
import { State } from '../common/types/State.type';
import { BaseHandler } from './base.handler';

// FBT: Frequently Bought Together
export class SponsoredFbtHandler extends BaseHandler {
  constructor(state: State) {
    super(state);
  }

  public flag(): void {
    const divElements = DomClient.getElementsByClass(
      'div.fbt-content:not(.flagged-bought-together)',
    );

    divElements?.forEach((div: Element) => {
      const sponsoredSpan = this.getSponsoredSpan(div);

      if (sponsoredSpan) {
        this.state.productAdCount++;
        this.flagSponsoredSpan(sponsoredSpan);
        this.flagSponsoredDiv(div);
      }
    });
  }

  private getSponsoredSpan(div: Element): Element | null {
    const sponsoredSpan = DomClient.getElementByClass('span.sp-tag', div);

    if (!sponsoredSpan || !this.isSponsored(sponsoredSpan)) {
      return null;
    }

    return sponsoredSpan;
  }

  private flagSponsoredSpan(element: Element): void {
    this.flagElement(element, 'sponsored-label');
    this.updateSponsoredText(element, true);
  }

  private flagSponsoredDiv(div: Element): void {
    this.flagElement(div, 'flagged-bought-together');
  }
}
