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

  const observer1 = new MutationObserver(flagPromoVideo);
  observer1.observe(document.body, { childList: true, subtree: true });

  const observer2 = new MutationObserver(flagSponsoredContent);
  observer2.observe(document.body, { childList: true, subtree: true });

  addBlockedIndication(sponsoredCount);
};

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "getCount") {
    sendResponse({ sponsoredCount, promoCount });
  }
});
