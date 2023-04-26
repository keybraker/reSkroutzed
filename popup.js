chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
  const sponsoredCount = document.getElementById("sponsoredCount");
  const sponsoredShelfCount = document.getElementById("sponsoredShelfCount");
  const promoCount = document.getElementById("promoCount");

  if (tabs?.length) {
    chrome.tabs.sendMessage(tabs[0].id, { action: "getCount" }, (response) => {
      sponsoredCount.textContent = response?.sponsoredCount
        ? response.sponsoredCount
        : 0;
      sponsoredShelfCount.textContent = response?.sponsoredShelfCount
        ? response.sponsoredShelfCount
        : 0;
      promoCount.textContent = response?.promoCount ? response.promoCount : 0;
    });
  } else {
    sponsoredCount.textContent = "0";
    sponsoredShelfCount.textContent = "0";
    promoCount.textContent = "0";
  }
});
