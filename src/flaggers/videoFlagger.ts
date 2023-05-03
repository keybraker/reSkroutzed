import { State } from "../types/State";

export function videoFlagger(state: State): void {
  const liElementsFlagged = document.querySelectorAll("li.flagged-video");
  state.videoCount = liElementsFlagged?.length ?? 0;

  const liElements = document.querySelectorAll("li:not(.flagged-video)");
  liElements?.forEach(element => updateVideoCountAndVisibility(element, state));
}

function updateVideoCountAndVisibility(liElement: Element, state: State): void {
  if (liElement?.classList.contains("promo-video-card")) {
    state.videoCount++;

    liElement.classList.add("flagged-video");

    if (state) {
      state.visible
        ? liElement.classList.remove("display-none-promo-product")
        : liElement.classList.add("display-none-promo-product");
    }
  }
}
