let visible = true;
let language = "EN";

let sponsoredCount = 0;
let sponsoredShelfCount = 0;
let videoCount = 0;

(function () {
  function init() {
    retrieveVisibility();
    retrieveLanguage();

    flagContent();
    flagAdditionalContent();

    addBlockedIndication();
  }

  function flagContent() {
    shelfFlagger(sponsoredShelfCount);
    videoFlagger();
    productFlagger();
    separatePromoListFlagger();
    frequentlyBoughtTogetherFlagger();
  }

  function flagAdditionalContent() {
    toggleSponsoredContentVisibility();
    buyThroughSkroutzIndicator();
  }

  function observeMutations() {
    const observer1 = new MutationObserver(() => flagContent());

    const observer2 = new MutationObserver((mutationsList) => {
      for (const mutation of mutationsList) {
        if (mutation.type === "attributes" && mutation.attributeName === "id") {
          addBlockedIndication();
        }
      }
    });

    observer1.observe(document.body, { childList: true, subtree: true });
    observer2.observe(document.body, { attributes: true });
  }

  window.onload = function () {
    init();
    observeMutations();
  };
})();

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "getCount") {
    sendResponse({ sponsoredCount, sponsoredShelfCount, videoCount });
  }
});
