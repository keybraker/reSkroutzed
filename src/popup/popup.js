function updateCounts(sponsored, sponsoredShelf, video) {
    document.getElementById('sponsoredCount').textContent = sponsored || 0;
    document.getElementById('sponsoredShelfCount').textContent =
    sponsoredShelf || 0;
    document.getElementById('videoCount').textContent = video || 0;
}

chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (!tabs || tabs.length === 0) {
        updateCounts();

        return;
    }

    chrome.tabs.sendMessage(
        tabs[0].id,
        { action: 'getCount' },
        ({ sponsoredCount, sponsoredShelfCount, videoCount } = {}) => {
            updateCounts(sponsoredCount, sponsoredShelfCount, videoCount);
        }
    );
});
