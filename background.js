let visible = true;
let sponsoredCount = 0;

window.onload = function () {
  flagSponsoredContent();
  const observer1 = new MutationObserver(flagSponsoredContent);
  observer1.observe(document.body, { childList: true, subtree: true });

  addBlockedIndication(sponsoredCount);
};

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "getCount") {
    sendResponse({ count: sponsoredCount });
  }
});
