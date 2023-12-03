function updateCounts(sponsored, sponsoredShelf, video) {
    document.getElementById("sponsoredCount").textContent = sponsored || 0;
    document.getElementById("sponsoredShelfCount").textContent = sponsoredShelf || 0;
    document.getElementById("videoCount").textContent = video || 0;
}

function changeState() {
    document.getElementById('sponsored-flagger-button')
        .addEventListener('click', function() {
            chrome.runtime.sendMessage({action: "toggleVisibility"});
        });
}

chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (!tabs || tabs.length === 0) {
        updateCounts();
        changeState();

        return;
    }

    chrome.tabs.sendMessage(
        tabs[0].id,
        { action: "getCount" },
        ({ sponsoredCount, sponsoredShelfCount, videoCount } = {}) => {
            updateCounts(sponsoredCount, sponsoredShelfCount, videoCount);
        }
    );
});


