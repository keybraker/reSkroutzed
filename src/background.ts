import { BrowserClient, StorageKey } from './clients/browser/client';
import { Language } from './common/enums/Language.enum';
import { State } from './common/types/State.type';
import { FinalPriceFixerDecorator } from './features/FinalPriceFixer.decorator';
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
  darkMode: false,
  minimumPriceDifference: 0,
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

(function () {
  async function initializer(): Promise<void> {
    await priceCheckerIndicator.execute();
    finalPriceFixerDecorator.execute();
    universalToggleDecorator.execute();

    flagContent();
    toggleVisibility();
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
  };
})();

chrome.runtime.onMessage.addListener(
  (
    request: { action: string },
    sender: chrome.runtime.MessageSender,
    sendResponse: (response: {
      sponsoredCount: number;
      sponsoredShelfCount: number;
      videoCount: number;
    }) => void,
  ) => {
    if (request.action === 'getCount') {
      sendResponse({
        sponsoredCount: state.productAdCount,
        sponsoredShelfCount: state.ShelfAdCount,
        videoCount: state.videoAdCount,
      });
    }
  },
);
