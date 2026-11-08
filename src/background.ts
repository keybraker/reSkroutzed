import { BrowserClient, StorageKey, StorageValueType } from './clients/browser/client';
import { Language } from './common/enums/Language.enum';
import {
  AI_HIDE_CLASS,
  ensureAISlopStyleInjected,
  queryAISlopNodes,
} from './common/functions/aiSlop';
import { onBodyMutations } from './common/functions/bodyMutationObserver';
import { State } from './common/types/State.type';
import { FinalPriceFixerDecorator } from './features/FinalPriceFixer.decorator';
import { LogoHatDecorator } from './features/LogoHat.decorator';
import { PriceCheckerDecorator } from './features/PriceChecker.decorator';
import { UniversalToggleDecorator } from './features/UniversalToggle.decorator';
import { WideModeDecorator } from './features/WideMode.decorator';
import { themeSync } from './features/functions/themeSync';
import { CampaignAdHandler } from './handlers/Campaign.handler';
import { ListProductAdHandler } from './handlers/ListProductAd.handler';
import { RecommendationAdHandler } from './handlers/RecommendationAd.handler';
import { ShelfProductAdHandler } from './handlers/ShelfProductAd.handler';
import { SkoopHandler } from './handlers/Skoop.handler';
import { SponsorshipAdHandler } from './handlers/SponsorshipAd.handler';
import { VideoAdHandler } from './handlers/VideoAd.handler';

const state: State = {
  hideProductAds: false,
  hideVideoAds: false,
  hideSponsorships: false,
  hideShelfProductAds: false,
  hideRecommendationAds: false,
  hideSkoopAds: false,
  hideAISlop: false,
  hideUniversalToggle: false,
  language: Language.GREEK,
  productAdCount: 0,
  shelfAdCount: 0,
  recommendationAdCount: 0,
  skoopAdCount: 0,
  videoAdCount: 0,
  sponsorshipAdCount: 0,
  darkMode: false,
  wideMode: false,
  priceCheckerEnabled: true,
  minimumPriceDifference: 0,
  showBestPrice: true,
  showShopflix: true,
  isMobile: false,
};

function applyAISlopVisibility(): void {
  ensureAISlopStyleInjected();
  const nodes = queryAISlopNodes();
  nodes.forEach((element) => {
    if (state.hideAISlop) {
      element.classList.add(AI_HIDE_CLASS);
    } else {
      element.classList.remove(AI_HIDE_CLASS);
      if (element.style.display === 'none') {
        element.style.display = '';
      }
    }
  });
}

function loadStorage(): void {
  state.language = BrowserClient.getLanguage();
  state.hideProductAds = BrowserClient.getValue<boolean>(StorageKey.PRODUCT_AD_VISIBILITY);
  state.hideVideoAds = BrowserClient.getValue<boolean>(StorageKey.VIDEO_AD_VISIBILITY);
  state.hideSponsorships = BrowserClient.getValue<boolean>(StorageKey.SPONSORSHIP_VISIBILITY);
  state.hideShelfProductAds = BrowserClient.getValue<boolean>(
    StorageKey.SHELF_PRODUCT_AD_VISIBILITY,
  );
  state.hideRecommendationAds = BrowserClient.getValue<boolean>(
    StorageKey.RECOMMENDATION_AD_VISIBILITY,
  );
  state.hideSkoopAds = BrowserClient.getValue<boolean>(StorageKey.SKOOP_AD_VISIBILITY);
  state.darkMode = BrowserClient.getValue<boolean>(StorageKey.DARK_MODE);
  state.priceCheckerEnabled = BrowserClient.getValue<boolean>(StorageKey.PRICE_CHECKER_ENABLED);
  state.minimumPriceDifference = BrowserClient.getValue<number>(
    StorageKey.MINIMUM_PRICE_DIFFERENCE,
  );
  state.showBestPrice = BrowserClient.getValue<boolean>(StorageKey.BEST_PRICE_COMPARISON);
  state.showShopflix = BrowserClient.getValue<boolean>(StorageKey.SHOPFLIX_COMPARISON);
  state.hideUniversalToggle = BrowserClient.getValue<boolean>(
    StorageKey.UNIVERSAL_TOGGLE_VISIBILITY,
  );
  state.hideAISlop = BrowserClient.getValue<boolean>(StorageKey.AI_SLOP_VISIBILITY);
  state.wideMode = BrowserClient.getValue<boolean>(StorageKey.WIDE_MODE);
  state.isMobile = BrowserClient.detectMobile();
}

loadStorage();
themeSync(state);

const videoAdHandler = new VideoAdHandler(state);
const listProductAdHandler = new ListProductAdHandler(state);
const shelfProductAdHandler = new ShelfProductAdHandler(state);
const recommendationAdHandler = new RecommendationAdHandler(state);
const skoopHandler = new SkoopHandler(state);
const sponsorshipAdHandler = new SponsorshipAdHandler(state);
const campaignAdHandler = new CampaignAdHandler(state);
// Decorators
const priceCheckerIndicator = new PriceCheckerDecorator(state);
const finalPriceFixerDecorator = new FinalPriceFixerDecorator(state);
const universalToggleDecorator = new UniversalToggleDecorator(state);
const logoHatDecorator = new LogoHatDecorator();
const wideModeDecorator = new WideModeDecorator(state);

/** Guards against starting the price checker twice when hydrate lands early. */
let priceCheckerStarted = false;

function startPriceChecker(): void {
  if (priceCheckerStarted) {
    return;
  }

  priceCheckerStarted = true;
  void priceCheckerIndicator.execute();
}

(function () {
  function initializer(): void {
    // The price checker talks to the network, so it runs alongside the rest of
    // the work instead of blocking ad flagging and visibility behind it.
    startPriceChecker();

    finalPriceFixerDecorator.execute();
    if (!state.hideUniversalToggle) {
      universalToggleDecorator.execute();
    }
    logoHatDecorator.execute();
    wideModeDecorator.sync();

    flagContent();
    toggleVisibility();

    if (state.isMobile) {
      applyMobileOptimizations();
    }
  }

  function flagContent(): void {
    videoAdHandler.flag();
    listProductAdHandler.flag();
    shelfProductAdHandler.flag();
    recommendationAdHandler.flag();
    skoopHandler.flag();
    sponsorshipAdHandler.flag();
    campaignAdHandler.flag();
  }

  function toggleVisibility(): void {
    videoAdHandler.visibilityUpdate();
    listProductAdHandler.visibilityUpdate();
    shelfProductAdHandler.visibilityUpdate();
    recommendationAdHandler.visibilityUpdate();
    skoopHandler.visibilityUpdate();
    sponsorshipAdHandler.visibilityUpdate();
    campaignAdHandler.visibilityUpdate();
    applyAISlopVisibility();
  }

  function applyMobileOptimizations(): void {
    if (document.getElementById('resk-mobile-style')) return;
    const style = document.createElement('style');
    style.id = 'resk-mobile-style';
    style.textContent = `
      /* Mobile optimizations for Skroutz */
      .reskroutzed-tag {
        padding: 4px 6px !important;
        font-size: 10px !important;
      }

      /* Ensure toggles have proper tap targets on mobile */
      .reskroutzed-toggle-container {
        transform: scale(1.2);
        margin: 8px;
      }
    `;
    document.head.appendChild(style);
  }

  function observeMutations(): void {
    onBodyMutations((mutations) => {
      const hasAddedElements = mutations.some((mutation) =>
        Array.from(mutation.addedNodes).some((node) => node.nodeType === Node.ELEMENT_NODE),
      );

      // Ignore text/attribute churn; only re-flag when new elements arrive.
      if (!hasAddedElements) {
        return;
      }

      flagContent();
      applyAISlopVisibility();
    });

    // Initial apply for any existing nodes
    applyAISlopVisibility();
  }

  function start(): void {
    initializer();
    observeMutations();

    if (state.isMobile) {
      window.addEventListener('orientationchange', () => {
        setTimeout(() => {
          flagContent();
          toggleVisibility();
        }, 300);
      });
    }
  }

  // Start as soon as the DOM is parsed. Waiting for `window.onload` instead
  // would hold every feature back until the last image of the page finished
  // downloading, which on a slow connection is several seconds.
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start, { once: true });
  } else {
    start();
  }

  /**
   * Reconcile the localStorage mirror with chrome.storage.local and re-apply
   * whatever changed.
   *
   * This runs off the critical path: the page already has a usable state from
   * the synchronous mirror, this only corrects it when chrome.storage
   * disagrees (e.g. a setting changed from the popup on another tab).
   */
  void BrowserClient.hydrate().then(() => {
    reconcileAfterHydrate();
  });
})();

const STORAGE_KEY_SET = new Set<string>(Object.values(StorageKey));

function isStorageKey(key: string): key is StorageKey {
  return STORAGE_KEY_SET.has(key);
}

function applyUniversalToggleVisibility(): void {
  const existing = document.querySelector('.universal-toggle-container');

  if (state.hideUniversalToggle) {
    if (existing?.parentElement) {
      existing.parentElement.removeChild(existing);
    }
    return;
  }

  if (!existing) {
    new UniversalToggleDecorator(state).execute();
  }
}

function refreshPriceChecker(): void {
  priceCheckerIndicator.destroy();
  priceCheckerStarted = false;
  startPriceChecker();
}

/**
 * Which storage key each state field is loaded from.
 *
 * Used to work out what changed after a bulk reload (`hydrate()`) and re-apply
 * only the affected features instead of restarting everything.
 */
const STATE_FIELD_STORAGE_KEYS: Partial<Record<keyof State, StorageKey>> = {
  hideProductAds: StorageKey.PRODUCT_AD_VISIBILITY,
  hideVideoAds: StorageKey.VIDEO_AD_VISIBILITY,
  hideSponsorships: StorageKey.SPONSORSHIP_VISIBILITY,
  hideShelfProductAds: StorageKey.SHELF_PRODUCT_AD_VISIBILITY,
  hideRecommendationAds: StorageKey.RECOMMENDATION_AD_VISIBILITY,
  hideSkoopAds: StorageKey.SKOOP_AD_VISIBILITY,
  hideAISlop: StorageKey.AI_SLOP_VISIBILITY,
  hideUniversalToggle: StorageKey.UNIVERSAL_TOGGLE_VISIBILITY,
  darkMode: StorageKey.DARK_MODE,
  wideMode: StorageKey.WIDE_MODE,
  priceCheckerEnabled: StorageKey.PRICE_CHECKER_ENABLED,
  minimumPriceDifference: StorageKey.MINIMUM_PRICE_DIFFERENCE,
  showBestPrice: StorageKey.BEST_PRICE_COMPARISON,
  showShopflix: StorageKey.SHOPFLIX_COMPARISON,
};

/**
 * Re-load `state` from the freshly hydrated mirror and re-apply every feature
 * whose setting actually changed.
 *
 * The initial paint uses whatever the synchronous mirror holds, so hydrate has
 * to reconcile the same set of features a live storage change would: dark mode,
 * ad/AI-slop visibility, wide mode, the universal toggle and the price checker.
 */
function reconcileAfterHydrate(): void {
  const previous = { ...state };

  loadStorage();

  (Object.keys(STATE_FIELD_STORAGE_KEYS) as (keyof State)[]).forEach((field) => {
    if (previous[field] === state[field]) {
      return;
    }

    const key = STATE_FIELD_STORAGE_KEYS[field];
    if (key) {
      STORAGE_CHANGE_HANDLERS[key]?.();
    }
  });
}

/**
 * What each setting needs re-applied after it changes. The value lives in
 * `state` by then, so handlers only have to re-read it.
 */
const STORAGE_CHANGE_HANDLERS: Partial<Record<StorageKey, () => void>> = {
  [StorageKey.DARK_MODE]: () => themeSync(state),
  [StorageKey.WIDE_MODE]: () => wideModeDecorator.sync(),
  [StorageKey.UNIVERSAL_TOGGLE_VISIBILITY]: applyUniversalToggleVisibility,
  [StorageKey.PRODUCT_AD_VISIBILITY]: () => listProductAdHandler.visibilityUpdate(),
  [StorageKey.VIDEO_AD_VISIBILITY]: () => videoAdHandler.visibilityUpdate(),
  [StorageKey.SHELF_PRODUCT_AD_VISIBILITY]: () => shelfProductAdHandler.visibilityUpdate(),
  [StorageKey.RECOMMENDATION_AD_VISIBILITY]: () => recommendationAdHandler.visibilityUpdate(),
  [StorageKey.SKOOP_AD_VISIBILITY]: () => skoopHandler.visibilityUpdate(),
  [StorageKey.SPONSORSHIP_VISIBILITY]: () => {
    sponsorshipAdHandler.visibilityUpdate();
    campaignAdHandler.visibilityUpdate();
  },
  [StorageKey.AI_SLOP_VISIBILITY]: () => {
    // Apply immediately, then again to catch late inserts.
    applyAISlopVisibility();
    setTimeout(applyAISlopVisibility, 300);
  },
  [StorageKey.PRICE_CHECKER_ENABLED]: refreshPriceChecker,
  [StorageKey.BEST_PRICE_COMPARISON]: refreshPriceChecker,
  [StorageKey.SHOPFLIX_COMPARISON]: refreshPriceChecker,
  [StorageKey.MINIMUM_PRICE_DIFFERENCE]: refreshPriceChecker,
};

chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName !== 'local') {
    return;
  }

  const changedKeys = Object.keys(changes).filter(isStorageKey);

  if (changedKeys.length === 0) {
    return;
  }

  // Keep the synchronous localStorage mirror fresh, so later reads (and the
  // dark-mode boot script on the next page load) see the new value.
  changedKeys.forEach((key) => {
    const newValue = changes[key].newValue;
    if (newValue !== undefined) {
      BrowserClient.syncMirror(key, newValue as StorageValueType);
    }
  });

  // Reload every setting in one pass so the handlers below read a consistent
  // state rather than a half-updated one.
  loadStorage();

  changedKeys.forEach((key) => {
    STORAGE_CHANGE_HANDLERS[key]?.();
  });
});
