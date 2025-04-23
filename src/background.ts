import { BrowserClient, StorageKey } from './clients/browser/client';
import { Language } from './common/enums/Language.enum';
import { State } from './common/types/State.type';
import { FinalPriceFixerDecorator } from './features/FinalPriceFixer.decorator';
import { LogoHatDecorator } from './features/LogoHat.decorator';
import { PriceCheckerDecorator } from './features/PriceChecker.decorator';
import { UniversalToggleDecorator } from './features/UniversalToggle.decorator';
import { themeSync } from './features/functions/themeSync';
import { ListProductAdHandler } from './handlers/ListProductAd.handler';
import { ShelfProductAdHandler } from './handlers/ShelfProductAd.handler';
import { SponsorshipAdHandler } from './handlers/SponsorshipAd.handler';
import { VideoAdHandler } from './handlers/VideoAd.handler';

const state: State = {
  hideProductAds: false,
  hideVideoAds: false,
  hideSponsorships: false,
  hideShelfProductAds: false,
  language: Language.GREEK,
  productAdCount: 0,
  ShelfAdCount: 0,
  videoAdCount: 0,
  sponsorshipAdCount: 0,
  darkMode: false,
  minimumPriceDifference: 0,
  isMobile: false,
};

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
// Decorators
const priceCheckerIndicator = new PriceCheckerDecorator(state);
const finalPriceFixerDecorator = new FinalPriceFixerDecorator(state);
const universalToggleDecorator = new UniversalToggleDecorator(state);
const logoHatDecorator = new LogoHatDecorator();

(function () {
  async function initializer(): Promise<void> {
    await priceCheckerIndicator.execute();
    finalPriceFixerDecorator.execute();
    universalToggleDecorator.execute();
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
  }

  function toggleVisibility(): void {
    videoAdHandler.visibilityUpdate();
    listProductAdHandler.visibilityUpdate();
    shelfProductAdHandler.visibilityUpdate();
    sponsorshipAdHandler.visibilityUpdate();
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
    const observer = new MutationObserver(() => flagContent());
    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
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
      sendResponse({ success: true });
    } else if (request.action === 'updatePriceDifference' && request.value !== undefined) {
      state.minimumPriceDifference = request.value as number;
      BrowserClient.setValue(StorageKey.MINIMUM_PRICE_DIFFERENCE, state.minimumPriceDifference);
      // Trigger price difference update if on a product page
      const event = new Event('priceThresholdChange');
      document.dispatchEvent(event);
      sendResponse({ success: true });
    }
    return true; // Keep the message channel open for asynchronous responses
  },
);
