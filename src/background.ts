import { Language } from "./enums/Language";
import { PromotionalVideoHandler } from "./handlers/promotionalVideoHandler";
import { SponsoredFBTHandler } from "./handlers/sponsoredFBTHandler";
import { SponsoredProductHandler } from "./handlers/sponsoredProductHandler";
import { SponsoredProductListHandler } from "./handlers/sponsoredProductListHandler";
import { SponsoredShelfHandler } from "./handlers/sponsoredShelfHandler";
import { toggleContentVisibility } from "./actions/visibilityAction";
import { retrieveLanguage } from "./retrievers/languageRetriever";
import { retrieveVisibility } from "./retrievers/visibilityRetriever";
import { State } from "./types/State";
import { BlockIndicator } from "./decorators/BlockIndicator";
import { BTSIndicator } from "./decorators/BTSIndicator";

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
const sponsoredProductListHandler = new SponsoredProductListHandler(state);
const sponsoredFBTHandler = new SponsoredFBTHandler(state);

const blockIndicator = new BlockIndicator(state);
const btsIndicator = new BTSIndicator(state);

(function () {
  async function initializer() {
    state.visible = retrieveVisibility();
    state.language = retrieveLanguage();
  }

  function flagContent() {
    promotionalVideoHandler.flag();
    sponsoredShelfHandler.flag();
    sponsoredProductHandler.flag();
    sponsoredProductListHandler.flag();
    sponsoredFBTHandler.flag();
  }

  function observeMutations() {
    const observer1 = new MutationObserver(() => flagContent());
    const observer2 = new MutationObserver(
      (mutationsList: MutationRecord[]) => {
        for (const mutation of mutationsList) {
          if (
            mutation.type === "attributes" &&
            mutation.attributeName === "id"
          ) {
            blockIndicator.addOrUpdate();
          }
        }
      }
    );

    observer1.observe(document.body, { childList: true, subtree: true });
    observer2.observe(document.body, { attributes: true });
  }

  window.onload = async function () {
    await initializer();

    flagContent();

    toggleContentVisibility(state);

    blockIndicator.addOrUpdate();
    await btsIndicator.start();

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
