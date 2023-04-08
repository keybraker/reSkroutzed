chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
  const sponsoredCount = document.getElementById("sponsoredCount");
  const promoCount = document.getElementById("promoCount");
  if (tabs && tabs.length) {
    chrome.tabs.sendMessage(tabs[0].id, { action: "getCount" }, (response) => {
      sponsoredCount.textContent =
        response && response.sponsoredCount ? response.sponsoredCount : 0;
      promoCount.textContent =
        response && response.promoCount ? response.promoCount : 0;
    });
  } else {
    sponsoredCount.textContent = "0";
    promoCount.textContent = "0";
  }
});
