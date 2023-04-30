import { Language } from "./enums/Language";
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

let visible: boolean = true;
let language: Language = Language.EN;

let sponsoredCount: number = 0;
let sponsoredShelfCount: number = 0;
let videoCount: number = 0;

(function () {
  function init(): void {
    console.log('before visible :>> ', visible);
    retrieveVisibility(visible);
    console.log('after visible :>> ', visible);
    retrieveLanguage(language);

    flagContent();
    flagAdditionalContent();

    addBlockedIndication(visible, language, sponsoredCount);
  }

  function flagContent(): void {
    shelfFlagger(sponsoredShelfCount, visible, language, sponsoredCount);
    videoFlagger(visible, videoCount);
    productFlagger(visible, language, sponsoredCount);
    separatePromoListFlagger(visible, language);
    frequentlyBoughtTogetherFlagger(language, sponsoredCount);
  }

  function flagAdditionalContent(): void {
    toggleSponsoredContentVisibility(visible);
    buyThroughSkroutzIndicator(language);
  }

  function observeMutations(): void {
    const observer1 = new MutationObserver(() => flagContent());

    const observer2 = new MutationObserver((mutationsList: MutationRecord[]) => {
      for (const mutation of mutationsList) {
        if (mutation.type === "attributes" && mutation.attributeName === "id") {
          addBlockedIndication(visible, language, sponsoredCount);
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
    sendResponse({ sponsoredCount, sponsoredShelfCount, videoCount });
  }
});