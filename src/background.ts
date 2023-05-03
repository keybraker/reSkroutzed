import { Language } from "./enums/Language";
import { State } from "./types/State";
import { frequentlyBoughtTogetherFlagger } from "./flaggers/frequentlyBoughtTogetherFlagger";
import { productFlagger } from "./flaggers/productFlagger";
import { separatePromoListFlagger } from "./flaggers/separatePromoListFlagger";
import { shelfFlagger } from "./flaggers/shelfFlagger";
import { videoFlagger } from "./flaggers/videoFlagger";
import { addBlockedIndication } from "./manipulators/addBlockedIndication";
import { buyThroughSkroutzIndicator } from "./manipulators/buyThroughSkroutzIndicator";
import { toggleSponsoredContentVisibility } from "./manipulators/toggleSponsoredContentVisibility";
import { retrieveLanguage } from "./retrievers/retrieveLanguage";
import { retrieveVisibility } from "./retrievers/retrieveVisibility";

const state: State = {
  visible: true,
  language: Language.EN,
  sponsoredCount: 0,
  sponsoredShelfCount: 0,
  videoCount: 0,
};

(function () {
  function init(): void {
    state.visible = retrieveVisibility();
    state.language = retrieveLanguage();

    flagContent();
    flagAdditionalContent();

    addBlockedIndication(state);
  }

  function flagContent(): void {
    shelfFlagger(state);
    videoFlagger(state);
    productFlagger(state);
    separatePromoListFlagger(state);
    frequentlyBoughtTogetherFlagger(state);
  }

  function flagAdditionalContent(): void {
    toggleSponsoredContentVisibility(state);
    buyThroughSkroutzIndicator(state);
  }

  function observeMutations(): void {
    const observer1 = new MutationObserver(() => flagContent());

    const observer2 = new MutationObserver((mutationsList: MutationRecord[]) => {
      for (const mutation of mutationsList) {
        if (mutation.type === "attributes" && mutation.attributeName === "id") {
          addBlockedIndication(state);
        }
      }
    });

    observer1.observe(document.body, { childList: true, subtree: true });
    observer2.observe(document.body, { attributes: true });
  }

  window.onload = function () {
    init();
    observeMutations();
  };
})();

chrome.runtime.onMessage.addListener((request: { action: string }, sender: chrome.runtime.MessageSender, sendResponse: (response: { sponsoredCount: number, sponsoredShelfCount: number, videoCount: number }) => void) => {
  if (request.action === "getCount") {
    sendResponse({ sponsoredCount: state.sponsoredCount, sponsoredShelfCount: state.sponsoredShelfCount, videoCount: state.videoCount });
  }
});