import { DomClient } from '../clients/dom/client';
import { State } from '../common/types/State.type';

// FBT: Frequently Bought Together
export class SponsoredFbtHandler {
  private state: State;

  constructor(state: State) {
    this.state = state;
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

    if (!sponsoredSpan || !DomClient.isElementSponsored(sponsoredSpan)) {
      return null;
    }

    return sponsoredSpan;
  }

  private flagSponsoredSpan(element: Element): void {
    element.classList.add('sponsored-label');
    DomClient.updateSponsoredTextSingle(element, this.state.language);
  }

  private flagSponsoredDiv(div: Element): void {
    div.classList.add('flagged-bought-together');
  }
}
