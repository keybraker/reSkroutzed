function separatePromoListFlagger() {
  const promotedBoxes = document.querySelectorAll(
    "h2:not(.flagged-list-title)"
  );

  [...promotedBoxes].filter(isSponsored).forEach(flagPromotedBox);
}

function flagPromotedBox(promotedBox) {
  promotedBox.classList.add("flagged-list-title");
  updateSponsoredText(promotedBox, true);
  toggleVisibility(promotedBox);
}
