import { Language } from "./enums/Language";
import { PromotionalVideoFlagger } from "./flaggers/promotionalVideoFlagger";
import { SponsoredFrequentlyBoughtTogetherFlagger } from "./flaggers/sponsoredFrequentlyBoughtTogether";
import { SponsoredProductFlagger } from "./flaggers/sponsoredProductFlagger";
import { SponsoredSeparatePromoListFlagger } from "./flaggers/sponsoredProductListFlagger";
import { SponsoredShelfFlagger } from "./flaggers/sponsoredShelfFlagger";
import { addBlockedIndication } from "./manipulators/addBlockedIndication";
import { buyThroughSkroutzIndicator } from "./manipulators/buyThroughSkroutzIndicator";
import { toggleSponsoredContentVisibility } from "./manipulators/toggleSponsoredContentVisibility";
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

const sponsoredShelfFlagger = new SponsoredShelfFlagger(state);
const promotionalVideoFlagger = new PromotionalVideoFlagger(state);
const sponsoredProductFlagger = new SponsoredProductFlagger(state);
const sponsoredSeparatePromoListFlagger = new SponsoredSeparatePromoListFlagger(
  state
);
const sponsoredFrequentlyBoughtTogetherFlagger =
  new SponsoredFrequentlyBoughtTogetherFlagger(state);

(function () {
  function init(): void {
    state.visible = retrieveVisibility();
    state.language = retrieveLanguage();

    flagContent();
    flagAdditionalContent();

    addBlockedIndication(state);
  }

  function flagContent(): void {
    sponsoredShelfFlagger.flag();
    promotionalVideoFlagger.flag();
    sponsoredProductFlagger.flag();
    sponsoredSeparatePromoListFlagger.flag();
    sponsoredFrequentlyBoughtTogetherFlagger.flag();
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
