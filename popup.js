console.log("popup");

chrome.runtime.sendMessage({ action: "getCount" }, function (response) {
  console.log("Message received in background.js:", response);
  if (response && response.count) {
    const countElement = document.getElementById("count");
    countElement.textContent = response.count;
  }
});
