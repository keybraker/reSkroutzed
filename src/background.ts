import { toggleContentVisibility } from "./actions/visibilityAction";
import { BlockIndicator } from "./decorators/BlockIndicator";
import { CorrectFinalPrice } from "./decorators/CorrectFinalPrice";
import { PriceCheckerIndicator } from "./decorators/PriceCheckerIndicator";
import { Language } from "./enums/Language";
import { DarkModeHandler } from "./handlers/darkModeHandler";
import { PromotionalVideoHandler } from "./handlers/promotionalVideoHandler";
import { SponsoredFbtHandler } from "./handlers/sponsoredFbtHandler";
import { SponsoredProductHandler } from "./handlers/sponsoredProductHandler";
import { SponsoredProductListHandler } from "./handlers/sponsoredProductListHandler";
import { SponsoredShelfHandler } from "./handlers/sponsoredShelfHandler";
import { retrieveLanguage } from "./retrievers/languageRetriever";
import { retrieveVisibility } from "./retrievers/visibilityRetriever";
import { State } from "./types/State";

const state: State = {
  visible: true,
  language: Language.ENGLISH,
  sponsoredCount: 0,
  sponsoredShelfCount: 0,
  videoCount: 0,
  darkMode: false,
};

const sponsoredShelfHandler = new SponsoredShelfHandler(state);
const promotionalVideoHandler = new PromotionalVideoHandler(state);
const sponsoredProductHandler = new SponsoredProductHandler(state);
const sponsoredProductListHandler = new SponsoredProductListHandler(state);
const sponsoredFbtHandler = new SponsoredFbtHandler(state);
const darkModeHandler = new DarkModeHandler(state);

const blockIndicator = new BlockIndicator(state);
const btsIndicator = new PriceCheckerIndicator(state);
const correctFinalPrice = new CorrectFinalPrice(state);

(function () {
  async function initializer() {
    state.visible = retrieveVisibility();
    state.language = retrieveLanguage();

    document.body.appendChild(darkModeHandler.createDarkModeToggle());

    flagContent();
    await flagAdditionalContent();

    blockIndicator.addOrUpdate();
  }

  function flagContent() {
    promotionalVideoHandler.flag();
    sponsoredShelfHandler.flag();
    sponsoredProductHandler.flag();
    sponsoredProductListHandler.flag();
    sponsoredFbtHandler.flag();
  }

  async function flagAdditionalContent() {
    toggleContentVisibility(state);
    await btsIndicator.start();
    await correctFinalPrice.start();
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
