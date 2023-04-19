let visible = true;
let language = "EN";

let sponsoredCount = 0;
let sponsoredShelfCount = 0;
let promoCount = 0;

window.onload = function () {
  retrieveVisibility(visible);
  retrieveLanguage();
  videoFlagger();
  productFlagger();
  shelfFlagger();
  separatePromoListFlagger(visible);
  removeSponsoredContent(visible);
  addBlockedIndication();
  buyThroughSkroutzIndicator();

  const observer1 = new MutationObserver(() => {
    productFlagger();
    shelfFlagger();
    videoFlagger();
  });

  const observer2 = new MutationObserver((mutationsList) => {
    for (const mutation of mutationsList) {
      if (mutation.type === "attributes" && mutation.attributeName === "id") {
        // productFlagger();
        // shelfFlagger();
        // videoFlagger();
        addBlockedIndication();
      }
    }
  });

  observer1.observe(document.body, { childList: true, subtree: true });
  observer2.observe(document.body, { attributes: true });
};

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "getCount") {
    sendResponse({ sponsoredCount, sponsoredShelfCount, promoCount });
  }
});
