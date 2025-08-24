const STORAGE_KEY_PREFIX = 'RESKROUTZED';
const StorageKey = {
  DARK_MODE: STORAGE_KEY_PREFIX + '-dark-mode',
  PRODUCT_AD_VISIBILITY: STORAGE_KEY_PREFIX + '-product-ad-visibility',
  VIDEO_AD_VISIBILITY: STORAGE_KEY_PREFIX + '-video-ad-visibility',
  SHELF_PRODUCT_AD_VISIBILITY: STORAGE_KEY_PREFIX + '-shelf-product-ad-visibility',
  SPONSORSHIP_VISIBILITY: STORAGE_KEY_PREFIX + '-sponsorship-visibility',
  AI_SLOP_VISIBILITY: STORAGE_KEY_PREFIX + '-ai-slop-visibility',
  UNIVERSAL_TOGGLE_VISIBILITY: STORAGE_KEY_PREFIX + '-universal-toggle-visibility',
  MINIMUM_PRICE_DIFFERENCE: STORAGE_KEY_PREFIX + '-minimum-difference',
  TOTAL_ADS_BLOCKED: STORAGE_KEY_PREFIX + '-total-ads-blocked',
  TOTAL_SHELVES_BLOCKED: STORAGE_KEY_PREFIX + '-total-shelves-blocked',
  TOTAL_VIDEOS_BLOCKED: STORAGE_KEY_PREFIX + '-total-videos-blocked'
};

function getStorageValue(key, defaultValue, callback) {
  chrome.storage.local.get(key, (result) => {
    const value = result[key];
    if (value === undefined) {
      callback(defaultValue);
    } else {
      callback(value);
    }
  });
}

function setStorageValue(key, value) {
  const data = {};
  data[key] = value;
  chrome.storage.local.set(data);
}

function initializeStatsCounters() {
  getStorageValue(StorageKey.TOTAL_ADS_BLOCKED, 0, (totalAds) => {
    getStorageValue(StorageKey.TOTAL_SHELVES_BLOCKED, 0, (totalShelves) => {
      getStorageValue(StorageKey.TOTAL_VIDEOS_BLOCKED, 0, (totalVideos) => {
        updateStatsDisplay(totalAds, totalShelves, totalVideos);
      });
    });
  });
}

function updateStatsDisplay(adsBlocked, shelvesBlocked, videosBlocked) {
  document.getElementById('totalAdsBlocked').textContent = adsBlocked;
  document.getElementById('totalShelvesBlocked').textContent = shelvesBlocked;
  document.getElementById('totalVideosBlocked').textContent = videosBlocked;
}

function loadSettings() {
  const darkModeToggle = document.getElementById('toggleDarkMode');
  getStorageValue(StorageKey.DARK_MODE, false, (value) => {
    darkModeToggle.checked = value;
  });

  const adsToggle = document.getElementById('toggleAds');
  getStorageValue(StorageKey.PRODUCT_AD_VISIBILITY, true, (value) => {
    adsToggle.checked = !value;
  });

  const universalToggle = document.getElementById('toggleUniversalToggle');
  getStorageValue(StorageKey.UNIVERSAL_TOGGLE_VISIBILITY, false, (value) => {
    // storage value means hide flag; checkbox checked means show
    universalToggle.checked = !value;
  });

  const videosToggle = document.getElementById('toggleVideos');
  getStorageValue(StorageKey.VIDEO_AD_VISIBILITY, true, (value) => {
    videosToggle.checked = !value;
  });

  const shelvesToggle = document.getElementById('toggleShelves');
  getStorageValue(StorageKey.SHELF_PRODUCT_AD_VISIBILITY, true, (value) => {
    shelvesToggle.checked = !value;
  });

  const aiSlopToggle = document.getElementById('toggleAISlop');
  getStorageValue(StorageKey.AI_SLOP_VISIBILITY, false, (value) => {
    aiSlopToggle.checked = !value;
  });

  const sponsorshipsToggle = document.getElementById('toggleSponsorships');
  getStorageValue(StorageKey.SPONSORSHIP_VISIBILITY, true, (value) => {
    sponsorshipsToggle.checked = !value;
  });

  const priceDifference = document.getElementById('priceDifference');
  getStorageValue(StorageKey.MINIMUM_PRICE_DIFFERENCE, 0, (value) => {
    priceDifference.value = value;
  });
}

function updateCounts(sponsored, sponsoredShelf, video) {
  getStorageValue(StorageKey.TOTAL_ADS_BLOCKED, 0, (totalAds) => {
    getStorageValue(StorageKey.TOTAL_SHELVES_BLOCKED, 0, (totalShelves) => {
      getStorageValue(StorageKey.TOTAL_VIDEOS_BLOCKED, 0, (totalVideos) => {
        if (sponsored !== undefined) totalAds += sponsored;
        if (sponsoredShelf !== undefined) totalShelves += sponsoredShelf;
        if (video !== undefined) totalVideos += video;

        setStorageValue(StorageKey.TOTAL_ADS_BLOCKED, totalAds);
        setStorageValue(StorageKey.TOTAL_SHELVES_BLOCKED, totalShelves);
        setStorageValue(StorageKey.TOTAL_VIDEOS_BLOCKED, totalVideos);

        updateStatsDisplay(totalAds, totalShelves, totalVideos);
      });
    });
  });
}

function setupEventListeners() {
  document.getElementById('toggleDarkMode').addEventListener('change', (e) => {
    const isDarkMode = e.target.checked;
    setStorageValue(StorageKey.DARK_MODE, isDarkMode);

    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs && tabs.length > 0) {
        chrome.tabs.sendMessage(tabs[0].id, {
          action: 'toggleDarkMode',
          value: isDarkMode
        }, function (response) {
          console.log('Dark mode response:', response);
        });
      }
    });

    if (isDarkMode) {
      document.body.classList.add('dark-popup');
    } else {
      document.body.classList.remove('dark-popup');
    }
  });

  document.getElementById('toggleUniversalToggle').addEventListener('change', (e) => {
    const showUniversal = e.target.checked;
    const hideUniversal = !showUniversal;
    setStorageValue(StorageKey.UNIVERSAL_TOGGLE_VISIBILITY, hideUniversal);

    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs && tabs.length > 0) {
        chrome.tabs.sendMessage(tabs[0].id, {
          action: 'toggleUniversalToggle',
          value: hideUniversal
        }, function (response) {
          console.log('Universal toggle visibility response:', response);
        });
      }
    });
  });

  document.getElementById('toggleAds').addEventListener('change', (e) => {
    const hideAds = !e.target.checked;
    setStorageValue(StorageKey.PRODUCT_AD_VISIBILITY, hideAds);

    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs && tabs.length > 0) {
        chrome.tabs.sendMessage(tabs[0].id, {
          action: 'toggleProductAds',
          value: hideAds
        }, function (response) {
          console.log('Product ads response:', response);
        });
      }
    });
  });

  document.getElementById('toggleVideos').addEventListener('change', (e) => {
    const hideVideos = !e.target.checked;
    setStorageValue(StorageKey.VIDEO_AD_VISIBILITY, hideVideos);

    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs && tabs.length > 0) {
        chrome.tabs.sendMessage(tabs[0].id, {
          action: 'toggleVideoAds',
          value: hideVideos
        }, function (response) {
          console.log('Video ads response:', response);
        });
      }
    });
  });

  document.getElementById('toggleShelves').addEventListener('change', (e) => {
    const hideShelves = !e.target.checked;
    setStorageValue(StorageKey.SHELF_PRODUCT_AD_VISIBILITY, hideShelves);

    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs && tabs.length > 0) {
        chrome.tabs.sendMessage(tabs[0].id, {
          action: 'toggleShelfProductAds',
          value: hideShelves
        }, function (response) {
          console.log('Shelf ads response:', response);
        });
      }
    });
  });

  document.getElementById('toggleAISlop').addEventListener('change', (e) => {
    const hideAISlop = !e.target.checked;
    setStorageValue(StorageKey.AI_SLOP_VISIBILITY, hideAISlop);

    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs && tabs.length > 0) {
        chrome.tabs.sendMessage(
          tabs[0].id,
          {
            action: 'toggleAISlop',
            value: hideAISlop,
          },
          function (response) {
            console.log('AI slop response:', response);
          }
        );
      }
    });
  });

  document.getElementById('toggleSponsorships').addEventListener('change', (e) => {
    const hideSponsorships = !e.target.checked;
    setStorageValue(StorageKey.SPONSORSHIP_VISIBILITY, hideSponsorships);

    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs && tabs.length > 0) {
        chrome.tabs.sendMessage(tabs[0].id, {
          action: 'toggleSponsorships',
          value: hideSponsorships
        }, function (response) {
          console.log('Sponsorships response:', response);
        });
      }
    });
  });

  document.getElementById('updatePriceBtn').addEventListener('click', () => {
    const priceDifference = parseFloat(document.getElementById('priceDifference').value);
    if (!isNaN(priceDifference) && priceDifference >= 0) {
      setStorageValue(StorageKey.MINIMUM_PRICE_DIFFERENCE, priceDifference);

      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs && tabs.length > 0) {
          chrome.tabs.sendMessage(tabs[0].id, {
            action: 'updatePriceDifference',
            value: priceDifference
          }, function (response) {
            console.log('Price difference response:', response);
          });
        }
      });

      const button = document.getElementById('updatePriceBtn');
      const originalText = button.textContent;
      button.textContent = "Updated!";
      button.classList.add('action-success');

      setTimeout(() => {
        button.textContent = originalText;
        button.classList.remove('action-success');
      }, 1500);
    }
  });
}

function getCurrentPageCounts() {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (!tabs || tabs.length === 0) {
      return;
    }

    chrome.tabs.sendMessage(tabs[0].id, { action: 'getCount' }, (response) => {
      if (chrome.runtime.lastError) {
        console.log('Communication error:', chrome.runtime.lastError.message);
        return;
      }

      if (response) {
        const { sponsoredCount, sponsoredShelfCount, videoCount } = response;

        updateCounts(sponsoredCount, sponsoredShelfCount, videoCount);
      }
    });
  });
}

document.addEventListener('DOMContentLoaded', () => {
  initializeStatsCounters();
  loadSettings();
  setupEventListeners();
  getCurrentPageCounts();

  getStorageValue(StorageKey.DARK_MODE, false, (value) => {
    if (value) {
      document.body.classList.add('dark-popup');
    }
  });
});
