function updatePromoCountAndVisibility(liElement) {
  if (liElement.classList.contains("promo-video-card")) {
    promoCount++;

    liElement.classList.add("flagged-video");

    const displayClass = "display-none-promo-product";
    visible
      ? liElement.classList.remove(displayClass)
      : liElement.classList.add(displayClass);
  }
}

function videoFlagger() {
  const liElementsFlagged = document.querySelectorAll("li.flagged-video");

  promoCount = liElementsFlagged && liElementsFlagged.length ? liElementsFlagged.length : 0;

  const liElements = document.querySelectorAll("li:not(.flagged-video)");

  if (!liElements || liElements.length === 0) {
    return;
  }

  liElements.forEach(updatePromoCountAndVisibility);
}
