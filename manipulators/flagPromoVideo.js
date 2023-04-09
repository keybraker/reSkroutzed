function flagPromoVideo() {
  const liElementsFlagged = document.querySelectorAll(
    "li.flagged-promo-product"
  );

  if (liElementsFlagged.length === 0) {
    promoCount = 0;
  }

  const liElements = document.querySelectorAll(
    "li:not(.flagged-promo-product)"
  );

  if (!liElements || liElements.length === 0) {
    return;
  }

  liElements.forEach((liElement) => {
    if (liElement.classList.contains("promo-video-card")) {
      promoCount++;

      liElement.classList.add("flagged-promo-product");

      visible
        ? liElement.classList.remove("display-none-promo-product")
        : liElement.classList.add("display-none-promo-product");
    }
  });
}
