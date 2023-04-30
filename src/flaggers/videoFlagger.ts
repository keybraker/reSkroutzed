export function videoFlagger(visible: boolean, videoCount: number): void {
  const liElementsFlagged = document.querySelectorAll("li.flagged-video");
  videoCount = liElementsFlagged?.length ?? 0;

  const liElements = document.querySelectorAll("li:not(.flagged-video)");
  liElements.forEach(element => updateVideoCountAndVisibility(element, visible, videoCount));
}

function updateVideoCountAndVisibility(liElement: Element, visible: boolean, videoCount: number): void {
  if (liElement.classList.contains("promo-video-card")) {
    videoCount++;

    liElement.classList.add("flagged-video");

    visible
      ? liElement.classList.remove("display-none-promo-product")
      : liElement.classList.add("display-none-promo-product");
  }
}
