let visible = localStorage.getItem("sponsoredVisibility") === "true";
let language = "EN";
let sponsoredCount = 0;
let sponsoredShelfCount = 0;
let promoCount = 0;

window.onload = function () {
  retrieveLanguage();
  videoFlagger();
  productFlagger();
  shelfFlagger();
  separatePromoListFlagger(visible);
  removeSponsoredContent(visible);
  addBlockedIndication();

  const observer = new MutationObserver(() => {
    productFlagger();
    videoFlagger();
  });
  observer.observe(document.body, { childList: true, subtree: true });
};

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "getCount") {
    sendResponse({ sponsoredCount, sponsoredShelfCount, promoCount });
  }
});
