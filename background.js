let visible = localStorage.getItem("sponsoredVisibility") === "true";
let language = "EN";
let sponsoredCount = 0;
let promoCount = 0;

window.onload = function () {
  retrieveLanguage();
  flagPromoVideo();
  flagSponsoredContent();
  flagPromotedContent(visible);
  removeSponsoredContent(visible);
  addBlockedIndication();

  const observer = new MutationObserver(() => {
    flagSponsoredContent();
    flagPromoVideo();
  });
  observer.observe(document.body, { childList: true, subtree: true });
};

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "getCount") {
    sendResponse({ sponsoredCount, promoCount });
  }
});
