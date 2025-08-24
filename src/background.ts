import { BrowserClient, StorageKey } from './clients/browser/client';
import { Language } from './common/enums/Language.enum';
import { State } from './common/types/State.type';
import { FinalPriceFixerDecorator } from './features/FinalPriceFixer.decorator';
import { LogoHatDecorator } from './features/LogoHat.decorator';
import { PriceCheckerDecorator } from './features/PriceChecker.decorator';
import { UniversalToggleDecorator } from './features/UniversalToggle.decorator';
import { themeSync } from './features/functions/themeSync';
import { CampaignAdHandler } from './handlers/Campaign.handler';
import { ListProductAdHandler } from './handlers/ListProductAd.handler';
import { ShelfProductAdHandler } from './handlers/ShelfProductAd.handler';
import { SponsorshipAdHandler } from './handlers/SponsorshipAd.handler';
import { VideoAdHandler } from './handlers/VideoAd.handler';

const state: State = {
  hideProductAds: false,
  hideVideoAds: false,
  hideSponsorships: false,
  hideShelfProductAds: false,
  hideAISlop: false,
  hideUniversalToggle: false,
  language: Language.GREEK,
  productAdCount: 0,
  ShelfAdCount: 0,
  videoAdCount: 0,
  sponsorshipAdCount: 0,
  darkMode: false,
  minimumPriceDifference: 0,
  isMobile: false,
};

function ensureAISlopStyleInjected(): void {
  if (document.getElementById('resk-ai-hide-style')) return;
  const style = document.createElement('style');
  style.id = 'resk-ai-hide-style';
  style.textContent = `.resk-hide-ai { display: none !important; }`;
  document.head.appendChild(style);
}

function queryAISlopNodes(): NodeListOf<HTMLElement> {
  const selector = [
    '[class*="sofos"]',
    '.sofos-entrypoint',
    '.sofos-listing-shelf',
    '.sofos-chat-button-wrapper',
    '.sofos-chat-button',
  ].join(',');
  return document.querySelectorAll(selector) as NodeListOf<HTMLElement>;
}

function applyAISlopVisibility(): void {
  ensureAISlopStyleInjected();
  const nodes = queryAISlopNodes();
  nodes.forEach((element) => {
    if (state.hideAISlop) {
      element.classList.add('resk-hide-ai');
    } else {
      element.classList.remove('resk-hide-ai');
      if ((element as HTMLElement).style && (element as HTMLElement).style.display === 'none') {
        (element as HTMLElement).style.display = '';
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
  state.darkMode = BrowserClient.getValue<boolean>(StorageKey.DARK_MODE);
  state.minimumPriceDifference = BrowserClient.getValue<number>(
    StorageKey.MINIMUM_PRICE_DIFFERENCE,
  );
  state.hideUniversalToggle = BrowserClient.getValue<boolean>(
    StorageKey.UNIVERSAL_TOGGLE_VISIBILITY,
  );
  state.hideAISlop = BrowserClient.getValue<boolean>(StorageKey.AI_SLOP_VISIBILITY);
  state.isMobile = BrowserClient.detectMobile();

  if (state.darkMode) {
    themeSync(state);
  }
}

loadStorage();

const videoAdHandler = new VideoAdHandler(state);
const listProductAdHandler = new ListProductAdHandler(state);
const shelfProductAdHandler = new ShelfProductAdHandler(state);
const sponsorshipAdHandler = new SponsorshipAdHandler(state);
const campaignAdHandler = new CampaignAdHandler(state);
// Decorators
const priceCheckerIndicator = new PriceCheckerDecorator(state);
const finalPriceFixerDecorator = new FinalPriceFixerDecorator(state);
const universalToggleDecorator = new UniversalToggleDecorator(state);
const logoHatDecorator = new LogoHatDecorator();

(function () {
  async function initializer(): Promise<void> {
    await priceCheckerIndicator.execute();
    finalPriceFixerDecorator.execute();
    if (!state.hideUniversalToggle) {
      universalToggleDecorator.execute();
    }
    logoHatDecorator.execute();

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
    sponsorshipAdHandler.flag();
    campaignAdHandler.flag();
  }

  function toggleVisibility(): void {
    videoAdHandler.visibilityUpdate();
    listProductAdHandler.visibilityUpdate();
    shelfProductAdHandler.visibilityUpdate();
    sponsorshipAdHandler.visibilityUpdate();
    campaignAdHandler.visibilityUpdate();
    applyAISlopVisibility();
  }

  function applyMobileOptimizations(): void {
    const style = document.createElement('style');
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
    const observer = new MutationObserver(() => {
      flagContent();
      applyAISlopVisibility();
    });
    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
    // Initial apply for any existing nodes
    applyAISlopVisibility();
  }

  window.onload = async function () {
    await initializer();
    observeMutations();

    if (state.isMobile) {
      window.addEventListener('orientationchange', () => {
        setTimeout(() => {
          flagContent();
          toggleVisibility();
        }, 300);
      });
    }
  };
})();

chrome.runtime.onMessage.addListener(
  (
    request: { action: string; value?: boolean | number },
    sender: chrome.runtime.MessageSender,
    sendResponse: (
      response:
        | {
            sponsoredCount: number;
            sponsoredShelfCount: number;
            videoCount: number;
            isMobile?: boolean;
          }
        | { success: boolean },
    ) => void,
  ) => {
    if (request.action === 'getCount') {
      sendResponse({
        sponsoredCount: state.productAdCount,
        sponsoredShelfCount: state.ShelfAdCount,
        videoCount: state.videoAdCount,
        isMobile: state.isMobile,
      });
    } else if (request.action === 'toggleDarkMode' && request.value !== undefined) {
      state.darkMode = request.value as boolean;
      BrowserClient.setValue(StorageKey.DARK_MODE, state.darkMode);
      themeSync(state);
      sendResponse({ success: true });
    } else if (request.action === 'toggleProductAds' && request.value !== undefined) {
      state.hideProductAds = request.value as boolean;
      BrowserClient.setValue(StorageKey.PRODUCT_AD_VISIBILITY, state.hideProductAds);
      listProductAdHandler.visibilityUpdate();
      sendResponse({ success: true });
    } else if (request.action === 'toggleVideoAds' && request.value !== undefined) {
      state.hideVideoAds = request.value as boolean;
      BrowserClient.setValue(StorageKey.VIDEO_AD_VISIBILITY, state.hideVideoAds);
      videoAdHandler.visibilityUpdate();
      sendResponse({ success: true });
    } else if (request.action === 'toggleShelfProductAds' && request.value !== undefined) {
      state.hideShelfProductAds = request.value as boolean;
      BrowserClient.setValue(StorageKey.SHELF_PRODUCT_AD_VISIBILITY, state.hideShelfProductAds);
      shelfProductAdHandler.visibilityUpdate();
      sendResponse({ success: true });
    } else if (request.action === 'toggleSponsorships' && request.value !== undefined) {
      state.hideSponsorships = request.value as boolean;
      BrowserClient.setValue(StorageKey.SPONSORSHIP_VISIBILITY, state.hideSponsorships);
      sponsorshipAdHandler.visibilityUpdate();
      campaignAdHandler.visibilityUpdate();
      sendResponse({ success: true });
    } else if (request.action === 'updatePriceDifference' && request.value !== undefined) {
      state.minimumPriceDifference = request.value as number;
      BrowserClient.setValue(StorageKey.MINIMUM_PRICE_DIFFERENCE, state.minimumPriceDifference);
      const event = new Event('priceThresholdChange');
      document.dispatchEvent(event);
      sendResponse({ success: true });
    } else if (request.action === 'toggleUniversalToggle' && request.value !== undefined) {
      state.hideUniversalToggle = request.value as boolean;
      BrowserClient.setValue(StorageKey.UNIVERSAL_TOGGLE_VISIBILITY, state.hideUniversalToggle);

      // Hide/show the toggle widget
      const existing = document.querySelector('.universal-toggle-container');
      if (state.hideUniversalToggle) {
        if (existing && existing.parentElement) {
          existing.parentElement.removeChild(existing);
        }
      } else {
        if (!existing) {
          const universalToggleDecorator = new UniversalToggleDecorator(state);
          universalToggleDecorator.execute();
        }
      }
      sendResponse({ success: true });
    } else if (request.action === 'toggleAISlop' && request.value !== undefined) {
      state.hideAISlop = request.value as boolean;
      BrowserClient.setValue(StorageKey.AI_SLOP_VISIBILITY, state.hideAISlop);
      // Apply immediately
      (function runTwice() {
        applyAISlopVisibility();
        // Schedule a follow-up to catch late inserts
        setTimeout(applyAISlopVisibility, 300);
      })();
      sendResponse({ success: true });
    }

    return true;
  },
);
