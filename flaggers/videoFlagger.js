function updatePromoCountAndVisibility(liElement) {
  if (liElement.classList.contains("promo-video-card")) {
    promoCount++;

    liElement.classList.add("flagged-video");

    visible
      ? liElement.classList.remove("display-none-promo-product")
      : liElement.classList.add("display-none-promo-product");
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
