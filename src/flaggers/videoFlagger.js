function updateVideoCountAndVisibility(liElement) {
  if (liElement.classList.contains("promo-video-card")) {
    videoCount++;

    liElement.classList.add("flagged-video");

    visible
      ? liElement.classList.remove("display-none-promo-product")
      : liElement.classList.add("display-none-promo-product");
  }
}

function videoFlagger() {
  const liElementsFlagged = document.querySelectorAll("li.flagged-video");
  videoCount = liElementsFlagged?.length ?? 0;

  const liElements = document.querySelectorAll("li:not(.flagged-video)");
  liElements.forEach(updateVideoCountAndVisibility);
}
