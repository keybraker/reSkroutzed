import { toggleContentVisibility } from './actions/visibility.action';
import { correctFinalPriceDecorator } from './decorators/correctFinalPrice.decorator';
import { PriceCheckerDecorator } from './decorators/PriceChecker.decorator';
import { Language } from './common/enums/Language.enum';
import { DarkModeHandler } from './handlers/darkMode.handler';
import { PromotionalVideoHandler } from './handlers/promotionalVideo.handler';
import { SponsoredFbtHandler } from './handlers/sponsoredFbt.handler';
import { SponsoredProductHandler } from './handlers/sponsoredProduct.handler';
import { SponsoredProductListHandler } from './handlers/sponsoredProductList.handler';
import { SponsoredShelfHandler } from './handlers/sponsoredShelf.handler';
import { SponsorshipHandler } from './handlers/sponsorship.handler';
import { UniversalToggleHandler } from './handlers/universalToggle.handler';
import { BrowserClient, StorageKey } from './clients/browser/client';
import { State } from './common/types/State.type';

const state: State = {
  hideProductAds: false,
  hideVideoAds: false,
  hideSponsorships: false,
  language: Language.GREEK,
  productAdCount: 0,
  ShelfAdCount: 0,
  videoAdCount: 0,
  darkMode: false,
  minimumPriceDifference: 0,
};

function loadStorage() {
  // Load language first since other translations may depend on it
  state.language = BrowserClient.getLanguage();

  // Load boolean settings with defaults
  state.hideProductAds = BrowserClient.getValue<boolean>(StorageKey.PRODUCT_AD_VISIBILITY);
  state.hideVideoAds = BrowserClient.getValue<boolean>(StorageKey.VIDEO_AD_VISIBILITY);
  state.hideSponsorships = BrowserClient.getValue<boolean>(StorageKey.SPONSORSHIP_VISIBILITY);

  // Load dark mode and apply it immediately if enabled
  state.darkMode = BrowserClient.getValue<boolean>(StorageKey.DARK_MODE);
  if (state.darkMode) {
    new DarkModeHandler(state).applyDarkMode();
  }

  // Load numeric settings
  state.minimumPriceDifference = BrowserClient.getValue<number>(
    StorageKey.MINIMUM_PRICE_DIFFERENCE,
  );
}

loadStorage();

const sponsoredShelfHandler = new SponsoredShelfHandler(state);
const promotionalVideoHandler = new PromotionalVideoHandler(state);
const sponsoredProductHandler = new SponsoredProductHandler(state);
const sponsoredProductListHandler = new SponsoredProductListHandler(state);
const sponsoredFbtHandler = new SponsoredFbtHandler(state);
const sponsorshipHandler = new SponsorshipHandler(state);
const priceCheckerIndicator = new PriceCheckerDecorator(state);
const universalToggleHandler = new UniversalToggleHandler(
  state,
  promotionalVideoHandler,
  sponsorshipHandler,
);

(function () {
  async function initializer() {
    await priceCheckerIndicator.start();
    document.body.appendChild(universalToggleHandler.createUniversalToggle());

    flagContent();
    toggleContentVisibility(state);
    correctFinalPriceDecorator(state.language);
  }

  function flagContent() {
    promotionalVideoHandler.flag();
    sponsoredShelfHandler.flag();
    sponsoredProductHandler.flag();
    sponsoredProductListHandler.flag();
    sponsoredFbtHandler.flag();
    sponsorshipHandler.flag();
  }

  function observeMutations() {
    const observer1 = new MutationObserver(() => flagContent());

    observer1.observe(document.body, { childList: true, subtree: true });
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
