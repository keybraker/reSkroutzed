import { State } from "../types/State";

export class PromotionalVideoFlagger {
  private state: State;

  constructor(state: State) {
    this.state = state;
  }

  public flag(): void {
    const liElementsFlagged = document.querySelectorAll("li.flagged-video");
    this.state.videoCount = liElementsFlagged?.length ?? 0;

    const liElements = document.querySelectorAll("li:not(.flagged-video)");
    liElements?.forEach((element) =>
      this.updateVideoCountAndVisibility(element)
    );
  }

  private updateVideoCountAndVisibility(liElement: Element): void {
    if (liElement?.classList.contains("promo-video-card")) {
      this.state.videoCount++;

      liElement.classList.add("flagged-video");

      if (this.state) {
        this.state.visible
          ? liElement.classList.remove("display-none-promo-product")
          : liElement.classList.add("display-none-promo-product");
      }
    }
  }
}
