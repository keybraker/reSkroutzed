import { StorageKey } from '../src/clients/browser/client';

function getBool(key: StorageKey, defaultValue: boolean, callback: (value: boolean) => void): void {
  chrome.storage.local.get([key], (result) => {
    const value = result[key];
    callback(value === undefined ? defaultValue : value === true);
  });
}

function getNumber(key: StorageKey, defaultValue: number, callback: (value: number) => void): void {
  chrome.storage.local.get([key], (result) => {
    const value = result[key];
    callback(value === undefined ? defaultValue : Number(value));
  });
}

function setStorageValue(key: StorageKey, value: boolean | number): void {
  chrome.storage.local.set({ [key]: value });
}

function getInput(id: string): HTMLInputElement {
  const element = document.getElementById(id);
  if (!(element instanceof HTMLInputElement)) {
    throw new Error(`Popup input #${id} is missing`);
  }
  return element;
}

function getButton(id: string): HTMLButtonElement {
  const element = document.getElementById(id);
  if (!(element instanceof HTMLButtonElement)) {
    throw new Error(`Popup button #${id} is missing`);
  }
  return element;
}

/**
 * Send a toggle message to the active tab. Silently ignores tabs that do not
 * have the content script injected (e.g. non-Skroutz pages).
 */
function sendMessageToActiveTab(action: string, value: boolean | number): void {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const tabId = tabs[0]?.id;
    if (tabId === undefined) {
      return;
    }

    chrome.tabs.sendMessage(tabId, { action, value }, () => {
      void chrome.runtime.lastError;
    });
  });
}

function loadSettings(): void {
  getBool(StorageKey.DARK_MODE, false, (value) => {
    getInput('toggleDarkMode').checked = value;
  });

  getBool(StorageKey.WIDE_MODE, false, (value) => {
    getInput('toggleWideMode').checked = value;
  });

  getBool(StorageKey.PRODUCT_AD_VISIBILITY, true, (value) => {
    getInput('toggleAds').checked = !value;
  });

  getBool(StorageKey.UNIVERSAL_TOGGLE_VISIBILITY, false, (value) => {
    getInput('toggleUniversalToggle').checked = !value;
  });

  getBool(StorageKey.VIDEO_AD_VISIBILITY, true, (value) => {
    getInput('toggleVideos').checked = !value;
  });

  getBool(StorageKey.SHELF_PRODUCT_AD_VISIBILITY, true, (value) => {
    getInput('toggleShelves').checked = !value;
  });

  getBool(StorageKey.AI_SLOP_VISIBILITY, false, (value) => {
    getInput('toggleAISlop').checked = value;
  });

  getBool(StorageKey.RECOMMENDATION_AD_VISIBILITY, true, (value) => {
    getInput('toggleRecommendations').checked = !value;
  });

  getBool(StorageKey.SKOOP_AD_VISIBILITY, true, (value) => {
    getInput('toggleSkoop').checked = !value;
  });

  getBool(StorageKey.SPONSORSHIP_VISIBILITY, true, (value) => {
    getInput('toggleSponsorships').checked = !value;
  });

  getNumber(StorageKey.MINIMUM_PRICE_DIFFERENCE, 0, (value) => {
    getInput('priceDifference').value = String(value);
  });
}

function setupEventListeners(): void {
  document.querySelectorAll<HTMLButtonElement>('.tab-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const tabName = btn.dataset.tab;

      document.querySelectorAll<HTMLButtonElement>('.tab-btn').forEach((b) => {
        b.classList.remove('active');
        b.setAttribute('aria-selected', 'false');
      });
      btn.classList.add('active');
      btn.setAttribute('aria-selected', 'true');

      document.querySelectorAll<HTMLElement>('.tab-panel').forEach((panel) => {
        panel.classList.toggle('active', panel.dataset.panel === tabName);
      });
    });
  });

  const darkModeToggle = getInput('toggleDarkMode');
  darkModeToggle.addEventListener('change', () => {
    const isDarkMode = darkModeToggle.checked;
    setStorageValue(StorageKey.DARK_MODE, isDarkMode);
    sendMessageToActiveTab('toggleDarkMode', isDarkMode);

    document.body.classList.toggle('light-popup', !isDarkMode);
  });

  const wideModeToggle = getInput('toggleWideMode');
  wideModeToggle.addEventListener('change', () => {
    const isWideMode = wideModeToggle.checked;
    setStorageValue(StorageKey.WIDE_MODE, isWideMode);
    sendMessageToActiveTab('toggleWideMode', isWideMode);
  });

  const universalToggle = getInput('toggleUniversalToggle');
  universalToggle.addEventListener('change', () => {
    const showUniversal = universalToggle.checked;
    const hideUniversal = !showUniversal;
    setStorageValue(StorageKey.UNIVERSAL_TOGGLE_VISIBILITY, hideUniversal);
    sendMessageToActiveTab('toggleUniversalToggle', hideUniversal);
  });

  const adsToggle = getInput('toggleAds');
  adsToggle.addEventListener('change', () => {
    const hideAds = !adsToggle.checked;
    setStorageValue(StorageKey.PRODUCT_AD_VISIBILITY, hideAds);
    sendMessageToActiveTab('toggleProductAds', hideAds);
  });

  const videosToggle = getInput('toggleVideos');
  videosToggle.addEventListener('change', () => {
    const hideVideos = !videosToggle.checked;
    setStorageValue(StorageKey.VIDEO_AD_VISIBILITY, hideVideos);
    sendMessageToActiveTab('toggleVideoAds', hideVideos);
  });

  const shelvesToggle = getInput('toggleShelves');
  shelvesToggle.addEventListener('change', () => {
    const hideShelves = !shelvesToggle.checked;
    setStorageValue(StorageKey.SHELF_PRODUCT_AD_VISIBILITY, hideShelves);
    sendMessageToActiveTab('toggleShelfProductAds', hideShelves);
  });

  const recommendationsToggle = getInput('toggleRecommendations');
  recommendationsToggle.addEventListener('change', () => {
    const hideRecommendations = !recommendationsToggle.checked;
    setStorageValue(StorageKey.RECOMMENDATION_AD_VISIBILITY, hideRecommendations);
    sendMessageToActiveTab('toggleRecommendationAds', hideRecommendations);
  });

  const skoopToggle = getInput('toggleSkoop');
  skoopToggle.addEventListener('change', () => {
    const hideSkoop = !skoopToggle.checked;
    setStorageValue(StorageKey.SKOOP_AD_VISIBILITY, hideSkoop);
    sendMessageToActiveTab('toggleSkoopAds', hideSkoop);
  });

  const aiSlopToggle = getInput('toggleAISlop');
  aiSlopToggle.addEventListener('change', () => {
    const hideAISlop = aiSlopToggle.checked;
    setStorageValue(StorageKey.AI_SLOP_VISIBILITY, hideAISlop);
    sendMessageToActiveTab('toggleAISlop', hideAISlop);
  });

  const sponsorshipsToggle = getInput('toggleSponsorships');
  sponsorshipsToggle.addEventListener('change', () => {
    const hideSponsorships = !sponsorshipsToggle.checked;
    setStorageValue(StorageKey.SPONSORSHIP_VISIBILITY, hideSponsorships);
    sendMessageToActiveTab('toggleSponsorships', hideSponsorships);
  });

  const priceInput = getInput('priceDifference');
  getButton('updatePriceBtn').addEventListener('click', () => {
    const priceDifference = parseFloat(priceInput.value);
    if (isNaN(priceDifference) || priceDifference < 0) {
      return;
    }

    setStorageValue(StorageKey.MINIMUM_PRICE_DIFFERENCE, priceDifference);
    sendMessageToActiveTab('updatePriceDifference', priceDifference);

    const button = getButton('updatePriceBtn');
    const originalText = button.textContent;
    button.textContent = 'Updated!';
    button.classList.add('btn-success');

    setTimeout(() => {
      button.textContent = originalText;
      button.classList.remove('btn-success');
    }, 1500);
  });
}

document.addEventListener('DOMContentLoaded', () => {
  loadSettings();
  setupEventListeners();

  getBool(StorageKey.DARK_MODE, false, (value) => {
    if (!value) {
      document.body.classList.add('light-popup');
    }
  });
});
