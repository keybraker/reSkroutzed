function updateCounts(sponsored, sponsoredShelf, video) {
  document.getElementById("sponsoredCount").textContent = sponsored || 0;
  document.getElementById("sponsoredShelfCount").textContent =
    sponsoredShelf || 0;
  document.getElementById("videoCount").textContent = video || 0;
}

chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
  if (!tabs || tabs.length === 0) {
    updateCounts();
    return;
  }

  chrome.tabs.sendMessage(tabs[0].id, { action: "getCount" }, (response) => {
    if (chrome.runtime.lastError) {
      console.log("Communication error:", chrome.runtime.lastError.message);
      updateCounts();
      return;
    }

    if (response) {
      const { sponsoredCount, sponsoredShelfCount, videoCount } = response;
      updateCounts(sponsoredCount, sponsoredShelfCount, videoCount);
    } else {
      updateCounts();
    }
  });
});
