let counter = 0;

function blockSponsoredContent() {
  const liElements = document.querySelectorAll(
    "li:not(.flagged-sponsored-product)"
  );

  if (!liElements || liElements.length === 0) {
    return;
  }

  liElements.forEach((liElement) => {
    const labelElement = liElement.querySelector(".label-text");
    if (labelElement && labelElement.textContent === "Sponsored") {
      counter++;

      liElement.classList.add("flagged-sponsored-product");
      labelElement.classList.add("flagged-sponsored-product-label");
    }
  });
}

const observer = new MutationObserver(blockSponsoredContent);
observer.observe(document.body, { childList: true, subtree: true });

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "getCount") {
    counter = counter / 3;
    sendResponse({ count: counter });
  }
  return true;
});
