function updateCounts(sponsored = 0, sponsoredShelf = 0, video = 0) {
  document.getElementById("sponsoredCount").textContent = sponsored;
  document.getElementById("sponsoredShelfCount").textContent = sponsoredShelf;
  document.getElementById("videoCount").textContent = video;
}

chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
  if (tabs?.length) {
    chrome.tabs.sendMessage(tabs[0].id, { action: "getCount" }, (response) => {
      if (response) {
        updateCounts(
          response.sponsoredCount,
          response.sponsoredShelfCount,
          response.videoCount
        );
      } else {
        updateCounts();
      }
    });
  } else {
    updateCounts();
  }
});
