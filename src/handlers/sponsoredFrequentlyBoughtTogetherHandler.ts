import {
  isSponsored,
  updateSponsoredTextSingle,
} from "../utilities/sponsoredUtil";
import { State } from "../types/State";

export class SponsoredFrequentlyBoughtTogetherHandler {
  private state: State;

  constructor(state: State) {
    this.state = state;
  }

  public flag(): void {
    const divElements = this.getDivElements();

    divElements?.forEach((div: Element) => {
      const sponsoredSpan = this.getSponsoredSpan(div);

      if (sponsoredSpan) {
        this.state.sponsoredCount++;
        this.flagSponsoredSpan(sponsoredSpan);
        this.flagSponsoredDiv(div);
      }
    });
  }

  private getDivElements(): Element[] {
    const divElements = document.querySelectorAll(
      "div.fbt-content:not(.flagged-bought-together)"
    );
    return [...divElements];
  }

  private getSponsoredSpan(div: Element): Element | null {
    const sponsoredSpan = div.querySelector("span.sp-tag");
    return isSponsored(sponsoredSpan) ? sponsoredSpan : null;
  }

  private flagSponsoredSpan(spanElement: Element): void {
    spanElement.classList.add("sponsored-label");
    updateSponsoredTextSingle(spanElement, this.state.language);
  }

  private flagSponsoredDiv(div: Element): void {
    div.classList.add("flagged-bought-together");
  }
}
