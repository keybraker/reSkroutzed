import { Language } from "./enums/Language";
import { PromotionalVideoHandler } from "./handlers/promotionalVideoHandler";
import { SponsoredFrequentlyBoughtTogetherHandler } from "./handlers/sponsoredFrequentlyBoughtTogetherHandler";
import { SponsoredProductHandler } from "./handlers/sponsoredProductHandler";
import { SponsoredSeparatePromoListHandler } from "./handlers/sponsoredProductListHandler";
import { SponsoredShelfHandler } from "./handlers/sponsoredShelfHandler";
import { addBlockedIndication } from "./helpers/addBlockedIndication";
import { buyThroughSkroutzIndicator } from "./helpers/buyThroughSkroutzIndicator";
import { toggleSponsoredContentVisibility } from "./helpers/toggleSponsoredContentVisibility";
import { retrieveLanguage } from "./retrievers/languageRetriever";
import { retrieveVisibility } from "./retrievers/visibilityRetriever";
import { State } from "./types/State";

const state: State = {
  visible: true,
  language: Language.EN,
  sponsoredCount: 0,
  sponsoredShelfCount: 0,
  videoCount: 0,
};

const sponsoredShelfHandler = new SponsoredShelfHandler(state);
const promotionalVideoHandler = new PromotionalVideoHandler(state);
const sponsoredProductHandler = new SponsoredProductHandler(state);
const sponsoredSeparatePromoListHandler = new SponsoredSeparatePromoListHandler(
  state
);
const sponsoredFrequentlyBoughtTogetherHandler =
  new SponsoredFrequentlyBoughtTogetherHandler(state);

(function () {
  function init(): void {
    state.visible = retrieveVisibility();
    state.language = retrieveLanguage();

    flagContent();
    flagAdditionalContent();

    addBlockedIndication(state);
  }

  function flagContent(): void {
    sponsoredShelfHandler.flag();
    promotionalVideoHandler.flag();
    sponsoredProductHandler.flag();
    sponsoredSeparatePromoListHandler.flag();
    sponsoredFrequentlyBoughtTogetherHandler.flag();
  }

  function flagAdditionalContent(): void {
    toggleSponsoredContentVisibility(state);
    buyThroughSkroutzIndicator(state);
  }

  function observeMutations(): void {
    const observer1 = new MutationObserver(() => flagContent());
    const observer2 = new MutationObserver(
      (mutationsList: MutationRecord[]) => {
        for (const mutation of mutationsList) {
          if (
            mutation.type === "attributes" &&
            mutation.attributeName === "id"
          ) {
            addBlockedIndication(state);
          }
        }
      }
    );

    observer1.observe(document.body, { childList: true, subtree: true });
    observer2.observe(document.body, { attributes: true });
  }

  window.onload = function () {
    init();
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
        sponsoredCount: state.sponsoredCount,
        sponsoredShelfCount: state.sponsoredShelfCount,
        videoCount: state.videoCount,
      });
    }
  }
);
