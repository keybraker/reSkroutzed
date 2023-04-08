chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
  if (tabs && tabs.length) {
    chrome.tabs.sendMessage(tabs[0].id, { action: "getCount" }, (response) => {
      const countDisplay = document.getElementById("countDisplay");
      if (response && response.count) {
        countDisplay.textContent = response.count;
      } else {
        countDisplay.textContent = 0;
      }
    });
  } else {
    const countDisplay = document.getElementById("countDisplay");
    countDisplay.textContent = "No active tab";
  }
});
