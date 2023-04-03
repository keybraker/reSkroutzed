let counter = 0;

function blockSponsoredContent() {
  const liElements = document.querySelectorAll("li");
  liElements.forEach((liElement) => {
    const labelElement = liElement.querySelector(".label-text");
    if (labelElement && labelElement.textContent === "Sponsored") {
      counter++;

      liElement.style.border = "1px solid red";
      liElement.style.boxShadow = "0px 0px 5px 0px red";

      labelElement.style.border = "1px solid red";
      labelElement.style.borderRadius = "5px";
      labelElement.style.padding = "1px 4px";
      labelElement.style.fontWeight = "bold";
      labelElement.style.color = "red";
    }
  });
}

const observer = new MutationObserver(blockSponsoredContent);
observer.observe(document.body, { childList: true, subtree: true });

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log(`request received: `, chrome.runtime.id);

  if (request.action === "getCount") {
    sendResponse({ count: counter });
  }
  return true;
});
