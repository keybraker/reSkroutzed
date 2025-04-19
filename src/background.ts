import { BrowserClient, StorageKey } from './clients/browser/client';
import { DomClient } from './clients/dom/client';
import { Language } from './common/enums/Language.enum';
import { State } from './common/types/State.type';
import { DarkModeHandler } from './handlers/darkMode.handler';
import { PromotionalVideoHandler } from './handlers/promotionalVideo.handler';
import { SponsoredFbtHandler } from './handlers/sponsoredFbt.handler';
import { SponsoredProductHandler } from './handlers/sponsoredProduct.handler';
import { SponsoredProductListHandler } from './handlers/sponsoredProductList.handler';
import { SponsoredShelfHandler } from './handlers/sponsoredShelf.handler';
import { SponsorshipHandler } from './handlers/sponsorship.handler';
import { FinalPriceFixer } from './ui/FinalPriceFixer.decorator';
import { PriceCheckerDecorator } from './ui/PriceChecker.decorator';
import { UniversalToggleDecorator } from './ui/UniversalToggle.decorator';

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

function loadStorage(): void {
  state.language = BrowserClient.getLanguage();

  state.hideProductAds = BrowserClient.getValue<boolean>(StorageKey.PRODUCT_AD_VISIBILITY);
  state.hideVideoAds = BrowserClient.getValue<boolean>(StorageKey.VIDEO_AD_VISIBILITY);
  state.hideSponsorships = BrowserClient.getValue<boolean>(StorageKey.SPONSORSHIP_VISIBILITY);

  state.darkMode = BrowserClient.getValue<boolean>(StorageKey.DARK_MODE);
  if (state.darkMode) {
    new DarkModeHandler(state).applyDarkMode();
  }

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
// Decorators
const priceCheckerIndicator = new PriceCheckerDecorator(state);
const finalPriceFixer = new FinalPriceFixer(state);
const universalToggleHandler = new UniversalToggleDecorator(
  state,
  promotionalVideoHandler,
  sponsorshipHandler,
);

(function () {
  async function initializer(): Promise<void> {
    await priceCheckerIndicator.execute();
    finalPriceFixer.execute();
    document.body.appendChild(universalToggleHandler.createUniversalToggle());

    flagContent();

    toggleVisibilityByClass('li.flagged-product', state);
    toggleVisibilityByClass('div.flagged-shelf', state);
    toggleVisibilityByClass('div.selected-product-cards', state);
    toggleVisibilityByClass('div.flagged-bought-together', state);
    toggleVisibilityByClass('div.flagged-sponsorship', state);
  }

  function toggleVisibilityByClass(selector: string, state: State): void {
    const elements = document.querySelectorAll(selector);
    elements?.forEach((element) => DomClient.toggleElementVisibility(element, state));
  }

  function flagContent(): void {
    promotionalVideoHandler.flag();
    sponsoredShelfHandler.flag();
    sponsoredProductHandler.flag();
    sponsoredProductListHandler.flag();
    sponsoredFbtHandler.flag();
    sponsorshipHandler.flag();
  }

  function observeMutations(): void {
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
