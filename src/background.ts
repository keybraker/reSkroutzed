import { Language } from "./enums/Language";
import { FrequentlyBoughtTogetherFlagger } from "./flaggers/frequentlyBoughtTogetherFlagger";
import { ProductFlagger } from "./flaggers/productFlagger";
import { SeparatePromoListFlagger } from "./flaggers/separatePromoListFlagger";
import { ShelfFlagger } from "./flaggers/shelfFlagger";
import { VideoFlagger } from "./flaggers/videoFlagger";
import { addBlockedIndication } from "./manipulators/addBlockedIndication";
import { buyThroughSkroutzIndicator } from "./manipulators/buyThroughSkroutzIndicator";
import { toggleSponsoredContentVisibility } from "./manipulators/toggleSponsoredContentVisibility";
import { retrieveLanguage } from "./retrievers/retrieveLanguage";
import { retrieveVisibility } from "./retrievers/retrieveVisibility";
import { State } from "./types/State";

const state: State = {
  visible: true,
  language: Language.EN,
  sponsoredCount: 0,
  sponsoredShelfCount: 0,
  videoCount: 0,
};

const shelfFlagger = new ShelfFlagger(state);
const videoFlagger = new VideoFlagger(state);
const productFlagger = new ProductFlagger(state);
const separatePromoListFlagger = new SeparatePromoListFlagger(state);
const frequentlyBoughtTogetherFlagger = new FrequentlyBoughtTogetherFlagger(
  state
);

(function () {
  function init(): void {
    state.visible = retrieveVisibility();
    state.language = retrieveLanguage();

    flagContent();
    flagAdditionalContent();

    addBlockedIndication(state);
  }

  function flagContent(): void {
    shelfFlagger.flag();
    videoFlagger.flag();
    productFlagger.flag();
    separatePromoListFlagger.flag();
    frequentlyBoughtTogetherFlagger.flag();
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
