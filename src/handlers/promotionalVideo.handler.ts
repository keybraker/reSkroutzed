import { State } from "../types/State.type";

export class PromotionalVideoHandler {
  private state: State;

  constructor(state: State) {
    this.state = state;
  }

  public flag(): void {
    const liElementsFlagged = document.querySelectorAll("li.flagged-video");
    this.state.videoCount = liElementsFlagged?.length ?? 0;

    // Target regular video elements
    const liElements = document.querySelectorAll("li:not(.flagged-video)");
    liElements?.forEach((element) =>
      this.updateVideoCountAndVisibility(element)
    );

    // Target the listing-reels-shelf elements (video reels)
    const reelsShelfElements = document.querySelectorAll(
      ".listing-reels-shelf:not(.flagged-video)"
    );
    reelsShelfElements?.forEach((element) => {
      this.state.videoCount++;
      element.classList.add("flagged-video", "promo-video-card");

      if (this.state) {
        this.state.videoVisible
          ? element.classList.remove("display-none-promo-product")
          : element.classList.add("display-none-promo-product");
      }
    });

    // Target standalone video-promo elements (YouTube embedded ads)
    const videoPromoElements = document.querySelectorAll(
      ".video-promo:not(.flagged-video)"
    );
    videoPromoElements?.forEach((element) => {
      this.state.videoCount++;
      element.classList.add("flagged-video", "promo-video-card");

      if (this.state) {
        this.state.videoVisible
          ? element.classList.remove("display-none-promo-product")
          : element.classList.add("display-none-promo-product");
      }
    });
  }

  private updateVideoCountAndVisibility(liElement: Element): void {
    if (
      liElement?.classList.contains("promo-video-card") ||
      liElement?.classList.contains("video-promo")
    ) {
      this.state.videoCount++;

      liElement.classList.add("flagged-video");

      if (this.state) {
        this.state.videoVisible
          ? liElement.classList.remove("display-none-promo-product")
          : liElement.classList.add("display-none-promo-product");
      }
    }
  }

  public createVideoToggleButton(): HTMLButtonElement {
    const videoButtonToggle = document.createElement("button");
    videoButtonToggle.classList.add("flagger-toggle-product");
    videoButtonToggle.setAttribute("id", "video-flagger-button");

    this.updateVideoButtonText(videoButtonToggle);

    videoButtonToggle.addEventListener("click", () => {
      this.state.videoVisible = !this.state.videoVisible;
      localStorage.setItem(
        "ssf-video-visibility",
        `${this.state.videoVisible}`
      );
      this.updateVideoButtonText(videoButtonToggle);
      this.toggleVideoVisibility();
    });

    videoButtonToggle.setAttribute("type", "button");

    return videoButtonToggle;
  }

  private updateVideoButtonText(videoButtonToggle: HTMLElement): void {
    const activeButtonClass = "flagger-toggle-product-active";
    const text =
      this.state.language === 0 ? "Videos for you" : "Videos για σένα";

    const eyeOpenSvg = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "svg"
    );
    eyeOpenSvg.setAttribute("viewBox", "0 0 16 16");
    eyeOpenSvg.setAttribute("width", "16");
    eyeOpenSvg.setAttribute("height", "16");
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");

    if (this.state.videoVisible) {
      path.setAttribute(
        "d",
        "M16 8s-3-5.5-8-5.5S0 8 0 8s3 5.5 8 5.5S16 8 16 8zM1.173 8a13.133 13.133 0 0 1 1.66-2.043C4.12 4.668 5.88 3.5 8 3.5c2.12 0 3.879 1.168 5.168 2.457A13.133 13.133 0 0 1 14.828 8c-.058.087-.122.183-.195.288-.335.48-.83 1.12-1.465 1.755C11.879 11.332 10.119 12.5 8 12.5c-2.12 0-3.879-1.168-5.168-2.457A13.134 13.134 0 0 1 1.172 8z"
      );
      videoButtonToggle.classList.remove(activeButtonClass);
    } else {
      path.setAttribute(
        "d",
        "M13.359 11.238C15.06 9.72 16 8 16 8s-3-5.5-8-5.5a7.028 7.028 0 0 0-2.79.588l.77.771A5.944 5.944 0 0 1 8 3.5c2.12 0 3.879 1.168 5.168 2.457A13.134 13.134 0 0 1 14.828 8c-.058.087-.122.183-.195.288-.335.48-.83 1.12-1.465 1.755-.165.165-.337.328-.517.486l.708.709z M11.297 9.176a3.5 3.5 0 0 0-4.474-4.474l.823.823a2.5 2.5 0 0 1 2.829 2.829l.822.822zm-2.943 1.299.822.822a3.5 3.5 0 0 1-4.474-4.474l.823.823a2.5 2.5 0 0 0 2.829 2.829z M3.35 5.47c-.18.16-.353.322-.518.487A13.134 13.134 0 0 0 1.172 8l.195.288c.335.48.83 1.12 1.465 1.755C4.121 11.332 5.881 12.5 8 12.5c.716 0 1.39-.133 2.02-.36l.77.772A7.029 7.029 0 0 1 8 13.5C3 13.5 0 8 0 8s.939-1.721 2.641-3.238l.708.709zm10.296 8.884-12-12 .708-.708 12 12-.708.708z"
      );
      videoButtonToggle.classList.add(activeButtonClass);
    }

    eyeOpenSvg.appendChild(path);

    videoButtonToggle.textContent = "";
    videoButtonToggle.appendChild(eyeOpenSvg);

    const gap = document.createElement("span");
    gap.style.marginRight = "6px";
    videoButtonToggle.appendChild(gap);

    const countSpan = document.createElement("span");
    countSpan.textContent = `${text} (${this.state.videoCount})`;
    videoButtonToggle.appendChild(countSpan);
  }

  public toggleVideoVisibility(): void {
    // Handle all elements with flagged-video class including standalone video promos
    const videoElements = document.querySelectorAll(
      "li.flagged-video, .listing-reels-shelf.flagged-video, .video-promo.flagged-video"
    );
    videoElements?.forEach((element) => {
      this.state.videoVisible
        ? element.classList.remove("display-none-promo-product")
        : element.classList.add("display-none-promo-product");
    });
  }
}
