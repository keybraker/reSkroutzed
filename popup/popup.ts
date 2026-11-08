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
 * The minimum difference threshold and its apply button only make sense while
 * the price checker is enabled, so mirror the toggle on those controls.
 */
function syncPriceRowState(isPriceCheckerEnabled: boolean): void {
  document.getElementById('priceRow')?.classList.toggle('is-disabled', !isPriceCheckerEnabled);
  getInput('priceDifference').disabled = !isPriceCheckerEnabled;
  getButton('updatePriceBtn').disabled = !isPriceCheckerEnabled;
}

function loadSettings(): void {
  getBool(StorageKey.DARK_MODE, false, (value) => {
    getInput('toggleDarkMode').checked = value;
  });

  getBool(StorageKey.WIDE_MODE, false, (value) => {
    getInput('toggleWideMode').checked = value;
  });

  getBool(StorageKey.CALM_MODE, false, (value) => {
    getInput('toggleCalmMode').checked = value;
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

  getBool(StorageKey.PRICE_CHECKER_ENABLED, true, (value) => {
    getInput('togglePriceChecker').checked = value;
    syncPriceRowState(value);
  });

  getNumber(StorageKey.MINIMUM_PRICE_DIFFERENCE, 0, (value) => {
    getInput('priceDifference').value = String(value);
  });

  getBool(StorageKey.BEST_PRICE_COMPARISON, true, (value) => {
    getInput('toggleBestPrice').checked = value;
  });

  getBool(StorageKey.SHOPFLIX_COMPARISON, true, (value) => {
    getInput('toggleShopflix').checked = value;
  });
}

function activateTab(tab: HTMLButtonElement): void {
  const tabName = tab.dataset.tab;

  document.querySelectorAll<HTMLButtonElement>('.tab-btn').forEach((otherTab) => {
    const isActive = otherTab === tab;
    otherTab.classList.toggle('active', isActive);
    otherTab.setAttribute('aria-selected', String(isActive));
    otherTab.tabIndex = isActive ? 0 : -1;
  });

  document.querySelectorAll<HTMLElement>('.tab-panel').forEach((panel) => {
    panel.classList.toggle('active', panel.dataset.panel === tabName);
  });
}

/**
 * Roving tabindex for the tab list: arrows move between tabs (wrapping at the
 * ends), Home/End jump to the first/last tab. Activation follows focus, which
 * is the recommended pattern for a small, static tab list.
 */
function setupTabKeyboardNavigation(): void {
  const tabs = Array.from(document.querySelectorAll<HTMLButtonElement>('.tab-btn'));

  tabs.forEach((tab, index) => {
    tab.addEventListener('keydown', (event) => {
      let nextIndex: number | undefined;

      if (event.key === 'ArrowRight') {
        nextIndex = (index + 1) % tabs.length;
      } else if (event.key === 'ArrowLeft') {
        nextIndex = (index - 1 + tabs.length) % tabs.length;
      } else if (event.key === 'Home') {
        nextIndex = 0;
      } else if (event.key === 'End') {
        nextIndex = tabs.length - 1;
      }

      if (nextIndex === undefined) {
        return;
      }

      event.preventDefault();
      tabs[nextIndex].focus();
      activateTab(tabs[nextIndex]);
    });
  });
}

function setupEventListeners(): void {
  document.querySelectorAll<HTMLButtonElement>('.tab-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      activateTab(btn);
    });
  });

  setupTabKeyboardNavigation();

  const darkModeToggle = getInput('toggleDarkMode');
  darkModeToggle.addEventListener('change', () => {
    const isDarkMode = darkModeToggle.checked;
    setStorageValue(StorageKey.DARK_MODE, isDarkMode);

    document.body.classList.toggle('light-popup', !isDarkMode);
  });

  const wideModeToggle = getInput('toggleWideMode');
  wideModeToggle.addEventListener('change', () => {
    const isWideMode = wideModeToggle.checked;
    setStorageValue(StorageKey.WIDE_MODE, isWideMode);
  });

  const calmModeToggle = getInput('toggleCalmMode');
  calmModeToggle.addEventListener('change', () => {
    const isCalmMode = calmModeToggle.checked;
    setStorageValue(StorageKey.CALM_MODE, isCalmMode);
  });

  const universalToggle = getInput('toggleUniversalToggle');
  universalToggle.addEventListener('change', () => {
    const showUniversal = universalToggle.checked;
    const hideUniversal = !showUniversal;
    setStorageValue(StorageKey.UNIVERSAL_TOGGLE_VISIBILITY, hideUniversal);
  });

  const adsToggle = getInput('toggleAds');
  adsToggle.addEventListener('change', () => {
    const hideAds = !adsToggle.checked;
    setStorageValue(StorageKey.PRODUCT_AD_VISIBILITY, hideAds);
  });

  const videosToggle = getInput('toggleVideos');
  videosToggle.addEventListener('change', () => {
    const hideVideos = !videosToggle.checked;
    setStorageValue(StorageKey.VIDEO_AD_VISIBILITY, hideVideos);
  });

  const shelvesToggle = getInput('toggleShelves');
  shelvesToggle.addEventListener('change', () => {
    const hideShelves = !shelvesToggle.checked;
    setStorageValue(StorageKey.SHELF_PRODUCT_AD_VISIBILITY, hideShelves);
  });

  const recommendationsToggle = getInput('toggleRecommendations');
  recommendationsToggle.addEventListener('change', () => {
    const hideRecommendations = !recommendationsToggle.checked;
    setStorageValue(StorageKey.RECOMMENDATION_AD_VISIBILITY, hideRecommendations);
  });

  const skoopToggle = getInput('toggleSkoop');
  skoopToggle.addEventListener('change', () => {
    const hideSkoop = !skoopToggle.checked;
    setStorageValue(StorageKey.SKOOP_AD_VISIBILITY, hideSkoop);
  });

  const aiSlopToggle = getInput('toggleAISlop');
  aiSlopToggle.addEventListener('change', () => {
    const hideAISlop = aiSlopToggle.checked;
    setStorageValue(StorageKey.AI_SLOP_VISIBILITY, hideAISlop);
  });

  const sponsorshipsToggle = getInput('toggleSponsorships');
  sponsorshipsToggle.addEventListener('change', () => {
    const hideSponsorships = !sponsorshipsToggle.checked;
    setStorageValue(StorageKey.SPONSORSHIP_VISIBILITY, hideSponsorships);
  });

  const priceCheckerToggle = getInput('togglePriceChecker');
  priceCheckerToggle.addEventListener('change', () => {
    const isPriceCheckerEnabled = priceCheckerToggle.checked;
    setStorageValue(StorageKey.PRICE_CHECKER_ENABLED, isPriceCheckerEnabled);
    syncPriceRowState(isPriceCheckerEnabled);
  });

  const bestPriceToggle = getInput('toggleBestPrice');
  bestPriceToggle.addEventListener('change', () => {
    const showBestPrice = bestPriceToggle.checked;
    setStorageValue(StorageKey.BEST_PRICE_COMPARISON, showBestPrice);
  });

  const shopflixToggle = getInput('toggleShopflix');
  shopflixToggle.addEventListener('change', () => {
    const showShopflix = shopflixToggle.checked;
    setStorageValue(StorageKey.SHOPFLIX_COMPARISON, showShopflix);
  });

  const priceInput = getInput('priceDifference');
  getButton('updatePriceBtn').addEventListener('click', () => {
    const priceDifference = parseFloat(priceInput.value);
    if (isNaN(priceDifference) || priceDifference < 0) {
      return;
    }

    setStorageValue(StorageKey.MINIMUM_PRICE_DIFFERENCE, priceDifference);

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
