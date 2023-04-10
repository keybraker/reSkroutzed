function flagPromoVideo() {
  const liElementsFlagged = document.querySelectorAll(
    "li.promoted-flagged-product"
  );

  if (liElementsFlagged.length === 0) {
    promoCount = 0;
  }

  //

  const liElements = document.querySelectorAll(
    "li:not(.promoted-flagged-product)"
  );

  if (!liElements || liElements.length === 0) {
    return;
  }

  liElements.forEach((liElement) => {
    if (liElement.classList.contains("promo-video-card")) {
      promoCount++;

      liElement.classList.add("promoted-flagged-product");

      visible
        ? liElement.classList.remove("display-none-promo-product")
        : liElement.classList.add("display-none-promo-product");
    }
  });
}
