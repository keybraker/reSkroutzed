import { toggleContentVisibility } from "./actions/visibility.action";
import { CorrectFinalPrice } from "./decorators/CorrectFinalPrice.decorator";
import { PriceCheckerIndicator } from "./decorators/PriceCheckerIndicator.decorator";
import { Language } from "./enums/Language.enum";
import { DarkModeHandler } from "./handlers/darkMode.handler";
import { PromotionalVideoHandler } from "./handlers/promotionalVideo.handler";
import { SponsoredFbtHandler } from "./handlers/sponsoredFbt.handler";
import { SponsoredProductHandler } from "./handlers/sponsoredProduct.handler";
import { SponsoredProductListHandler } from "./handlers/sponsoredProductList.handler";
import { SponsoredShelfHandler } from "./handlers/sponsoredShelf.handler";
import { SponsorshipHandler } from "./handlers/sponsorship.handler";
import { UniversalToggleHandler } from "./handlers/universalToggle.handler";
import { DarkModeStorageAdapter } from "./storageRetrievers/darkMode.storage.handler";
import { LanguageStorageAdapter } from "./storageRetrievers/Language.storage.handler";
import { MinimumPriceDifferenceStorageAdapter } from "./storageRetrievers/MinimumPriceDifference.storage.handler";
import { ProductAdVisibilityStorageAdapter } from "./storageRetrievers/ProductAdVisibility.storage.handler";
import { SponsorshipVisibilityStorageAdapter } from "./storageRetrievers/SponsorshipVisibility.storage.handler";
import { VideoAdVisibilityStorageAdapter } from "./storageRetrievers/VideoAdVisibility.storage.handler";
import { State } from "./types/State.type";

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
  const productAdVisibilityStorageAdapter =
    new ProductAdVisibilityStorageAdapter();
  const videoAdVisibilityStorageAdapter = new VideoAdVisibilityStorageAdapter();
  const sponsorshipVisibilityStorageAdapter =
    new SponsorshipVisibilityStorageAdapter();
  const darkModeStorageAdapter = new DarkModeStorageAdapter();
  const languageStorageAdapter = new LanguageStorageAdapter();
  const minimumPriceDifferenceStorageAdapter =
    new MinimumPriceDifferenceStorageAdapter();

  state.language = languageStorageAdapter.getValue();

  const hideProductAds = productAdVisibilityStorageAdapter.getValue();
  if (hideProductAds === null) {
    productAdVisibilityStorageAdapter.setValue(false);
    state.hideProductAds = false;
  } else {
    state.hideProductAds = hideProductAds;
  }

  const hideVideoAds = videoAdVisibilityStorageAdapter.getValue();
  if (hideVideoAds === null) {
    videoAdVisibilityStorageAdapter.setValue(false);
    state.hideVideoAds = false;
  } else {
    state.hideVideoAds = hideVideoAds;
  }

  const hideSponsorships = sponsorshipVisibilityStorageAdapter.getValue();
  if (hideSponsorships === null) {
    sponsorshipVisibilityStorageAdapter.setValue(false);
    state.hideSponsorships = false;
  } else {
    state.hideSponsorships = hideSponsorships;
  }

  const darkMode = darkModeStorageAdapter.getValue();
  if (darkMode === null) {
    darkModeStorageAdapter.setValue(false);
    state.darkMode = false;
  } else {
    state.darkMode = darkMode;
    new DarkModeHandler(state).applyDarkMode();
  }

  const minimumPriceDifference =
    minimumPriceDifferenceStorageAdapter.getValue();
  if (minimumPriceDifference === null) {
    minimumPriceDifferenceStorageAdapter.setValue(0);
    state.minimumPriceDifference = 0;
  } else {
    state.minimumPriceDifference = minimumPriceDifference;
  }

  state.language = languageStorageAdapter.getValue();
}

loadStorage();

const sponsoredShelfHandler = new SponsoredShelfHandler(state);
const promotionalVideoHandler = new PromotionalVideoHandler(state);
const sponsoredProductHandler = new SponsoredProductHandler(state);
const sponsoredProductListHandler = new SponsoredProductListHandler(state);
const sponsoredFbtHandler = new SponsoredFbtHandler(state);
const sponsorshipHandler = new SponsorshipHandler(state);
const priceCheckerIndicator = new PriceCheckerIndicator(state);
const correctFinalPrice = new CorrectFinalPrice(state);
const universalToggleHandler = new UniversalToggleHandler(
  state,
  promotionalVideoHandler,
  sponsorshipHandler
);

(function () {
  async function initializer() {
    await priceCheckerIndicator.start();
    document.body.appendChild(universalToggleHandler.createUniversalToggle());

    flagContent();
    toggleContentVisibility(state);

    await correctFinalPrice.start();
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
    }) => void
  ) => {
    if (request.action === "getCount") {
      sendResponse({
        sponsoredCount: state.productAdCount,
        sponsoredShelfCount: state.ShelfAdCount,
        videoCount: state.videoAdCount,
      });
    }
  }
);
