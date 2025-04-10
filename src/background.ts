import { toggleContentVisibility } from "./actions/visibility.action";
import { BlockIndicator } from "./decorators/BlockIndicator.decorator";
import { CorrectFinalPrice } from "./decorators/CorrectFinalPrice.decorator";
import { PriceCheckerIndicator } from "./decorators/PriceCheckerIndicator.decorator";
import { Language } from "./enums/Language.enum";
import { DarkModeHandler } from "./handlers/darkMode.handler";
import { PromotionalVideoHandler } from "./handlers/promotionalVideo.handler";
import { SponsoredFbtHandler } from "./handlers/sponsoredFbt.handler";
import { SponsoredProductHandler } from "./handlers/sponsoredProduct.handler";
import { SponsoredProductListHandler } from "./handlers/sponsoredProductList.handler";
import { SponsoredShelfHandler } from "./handlers/sponsoredShelf.handler";
import { retrieveLanguage } from "./retrievers/language.retriever";
import { retrieveVisibility } from "./retrievers/visibility.retriever";
import { State } from "./types/State.type";

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
