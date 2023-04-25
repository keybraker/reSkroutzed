chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
  const sponsoredCount = document.getElementById("sponsoredCount");
  const sponsoredShelfCount = document.getElementById("sponsoredShelfCount");
  const promoCount = document.getElementById("promoCount");

  if (tabs && tabs.length) {
    chrome.tabs.sendMessage(tabs[0].id, { action: "getCount" }, (response) => {
      sponsoredCount.textContent =
        response && response.sponsoredCount ? response.sponsoredCount : 0;
      sponsoredShelfCount.textContent =
        response && response.sponsoredShelfCount
          ? response.sponsoredShelfCount
          : 0;
      promoCount.textContent =
        response && response.promoCount ? response.promoCount : 0;
    });
  } else {
    sponsoredCount.textContent = "0";
    sponsoredShelfCount.textContent = "0";
    promoCount.textContent = "0";
  }
});
