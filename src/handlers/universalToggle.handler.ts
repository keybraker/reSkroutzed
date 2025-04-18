import { Language } from "../enums/Language.enum";
import { appendLogoChild } from "../functions/appendLogoChild";
import { StorageService, StorageKey } from "../services/storage.service";
import { State } from "../types/State.type";
import { DarkModeHandler } from "./darkMode.handler";
import { PromotionalVideoHandler } from "./promotionalVideo.handler";
import { SponsorshipHandler } from "./sponsorship.handler";

export class UniversalToggleHandler {
  private state: State;
  private videoHandler: PromotionalVideoHandler;
  private sponsorshipHandler: SponsorshipHandler;
  private isMenuOpen: boolean = false;

  constructor(
    state: State,
    videoHandler: PromotionalVideoHandler,
    sponsorshipHandler: SponsorshipHandler
  ) {
    this.state = state;
    this.videoHandler = videoHandler;
    this.sponsorshipHandler = sponsorshipHandler;
  }

  public createUniversalToggle(): HTMLDivElement {
    const container = document.createElement("div");
    container.classList.add("universal-toggle-container");

    const mainToggle = document.createElement("button");
    mainToggle.classList.add("universal-toggle-button");
    mainToggle.title = "ReSkroutzed Options";

    appendLogoChild(mainToggle);

    const buttonsContainer = document.createElement("div");
    buttonsContainer.classList.add("toggle-buttons-container");

    const priceDifferenceButton = this.createPriceDifferenceOption();
    const darkModeButton = this.createDarkModeToggleButton();
    const adToggleButton = this.createAdToggleButton();
    const videoToggleButton = this.createVideoToggleButton();
    const sponsorshipToggleButton = this.createSponsorshipToggleButton();

    buttonsContainer.appendChild(priceDifferenceButton);
    buttonsContainer.appendChild(darkModeButton);
    buttonsContainer.appendChild(adToggleButton);
    buttonsContainer.appendChild(videoToggleButton);
    buttonsContainer.appendChild(sponsorshipToggleButton);

    mainToggle.addEventListener("click", () => this.toggleMenu(container));

    document.addEventListener("click", (event) => {
      if (this.isMenuOpen && !container.contains(event.target as Node)) {
        this.closeMenu(container);
      }
    });

    container.appendChild(buttonsContainer);
    container.appendChild(mainToggle);

    return container;
  }

  private toggleMenu(container: HTMLElement): void {
    if (this.isMenuOpen) {
      this.closeMenu(container);
    } else {
      this.openMenu(container);
    }
  }

  private openMenu(container: HTMLElement): void {
    container.classList.add("menu-open");
    this.isMenuOpen = true;

    const buttons = container.querySelectorAll(".toggle-option-button");
    buttons.forEach((button, index) => {
      setTimeout(() => {
        button.classList.add("button-active");
      }, 80 * index); // More pronounced staggering (start from first button)
    });
  }

  private closeMenu(container: HTMLElement): void {
    this.isMenuOpen = false;

    const buttons = container.querySelectorAll(".toggle-option-button");
    buttons.forEach((button, index) => {
      setTimeout(() => {
        button.classList.remove("button-active");
      }, 50 * index);
    });

    setTimeout(() => {
      container.classList.remove("menu-open");
    }, 50 * buttons.length + 100);
  }

  private createDarkModeToggleButton(): HTMLButtonElement {
    const button = document.createElement("button");
    button.classList.add("toggle-option-button", "dark-mode-option");
    button.title = this.state.darkMode
      ? "Switch to Light Mode"
      : "Switch to Dark Mode";

    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("viewBox", "0 0 24 24");
    svg.setAttribute("width", "16");
    svg.setAttribute("height", "16");

    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");

    if (this.state.darkMode) {
      // Moon icon
      path.setAttribute(
        "d",
        "M12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9 9-4.03 9-9c0-.46-.04-.92-.1-1.36-.98 1.37-2.58 2.26-4.4 2.26-3.03 0-5.5-2.47-5.5-5.5 0-1.82.89-3.42 2.26-4.4-.44-.06-.9-.1-1.36-.1z"
      );
    } else {
      // Sun icon
      path.setAttribute(
        "d",
        "M12 7c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zM2 13h2c.55 0 1-.45 1-1s-.45-1-1-1H2c-.55 0-1 .45-1 1s.45 1 1 1zm18 0h2c.55 0 1-.45 1-1s-.45-1-1-1h-2c-.55 0-1 .45-1 1s.45 1 1 1zM11 2v2c0 .55.45 1 1 1s1-.45 1-1V2c0-.55-.45-1-1-1s-1 .45-1 1zm0 18v2c0 .55.45 1 1 1s1-.45 1-1v-2c0-.55-.45-1-1-1s-1 .45-1 1zM5.99 4.58c-.39-.39-1.03-.39-1.41 0-.39.39-.39 1.03 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0 .39-.39.39-1.03 0-1.41L5.99 4.58zm12.37 12.37c-.39-.39-1.03-.39-1.41 0-.39.39-.39 1.03 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0 .39-.39.39-1.03 0-1.41l-1.06-1.06zm1.06-10.96c.39-.39.39-1.03 0-1.41-.39-.39-1.03-.39-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41.39.39 1.03.39 1.41 0l1.06-1.06zM7.05 18.36c.39-.39.39-1.03 0-1.41-.39-.39-1.03-.39-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41.39.39 1.03.39 1.41 0l1.06-1.06z"
      );
    }

    path.setAttribute("fill", "currentColor");

    svg.appendChild(path);
    button.appendChild(svg);

    if (this.state.darkMode) {
      button.classList.add("active");
    }

    button.addEventListener("click", (e) => {
      e.stopPropagation();
      new DarkModeHandler(this.state).toggleDarkMode();
      button.classList.toggle("active");

      const newPath = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "path"
      );
      if (this.state.darkMode) {
        // Moon icon
        newPath.setAttribute(
          "d",
          "M12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9 9-4.03 9-9c0-.46-.04-.92-.1-1.36-.98 1.37-2.58 2.26-4.4 2.26-3.03 0-5.5-2.47-5.5-5.5 0-1.82.89-3.42 2.26-4.4-.44-.06-.9-.1-1.36-.1z"
        );
      } else {
        // Sun icon
        newPath.setAttribute(
          "d",
          "M12 7c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zM2 13h2c.55 0 1-.45 1-1s-.45-1-1-1H2c-.55 0-1 .45-1 1s.45 1 1 1zm18 0h2c.55 0 1-.45 1-1s-.45-1-1-1h-2c-.55 0-1 .45-1 1s.45 1 1 1zM11 2v2c0 .55.45 1 1 1s1-.45 1-1V2c0-.55-.45-1-1-1s-1 .45-1 1zm0 18v2c0 .55.45 1 1 1s1-.45 1-1v-2c0-.55-.45-1-1-1s-1 .45-1 1zM5.99 4.58c-.39-.39-1.03-.39-1.41 0-.39.39-.39 1.03 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0 .39-.39.39-1.03 0-1.41L5.99 4.58zm12.37 12.37c-.39-.39-1.03-.39-1.41 0-.39.39-.39 1.03 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0 .39-.39.39-1.03 0-1.41l-1.06-1.06zm1.06-10.96c.39-.39.39-1.03 0-1.41-.39-.39-1.03-.39-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41.39.39 1.03.39 1.41 0l1.06-1.06zM7.05 18.36c.39-.39.39-1.03 0-1.41-.39-.39-1.03-.39-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41.39.39 1.03.39 1.41 0l1.06-1.06z"
        );
      }
      newPath.setAttribute("fill", "currentColor");

      const oldPath = svg.querySelector("path");
      if (oldPath) {
        svg.removeChild(oldPath);
      }
      svg.appendChild(newPath);

      button.title = this.state.darkMode
        ? "Switch to Light Mode"
        : "Switch to Dark Mode";
    });

    return button;
  }

  private createAdToggleButton(): HTMLButtonElement {
    const button = document.createElement("button");
    button.classList.add("toggle-option-button", "ad-toggle-option");
    button.title = this.state.hideProductAds ? "Hide Ads" : "Show Ads";

    const adTextSpan = document.createElement("span");
    adTextSpan.classList.add("ad-text-icon");
    adTextSpan.textContent = "AD";

    if (!this.state.hideProductAds) {
      adTextSpan.classList.add("ad-text-disabled");
      button.classList.add("active");
    }

    button.appendChild(adTextSpan);

    const notificationBubble = document.createElement("div");
    notificationBubble.classList.add("notification-bubble");
    notificationBubble.textContent = `${this.state.productAdCount}`;
    button.appendChild(notificationBubble);

    const updateNotificationCount = () => {
      const flaggedElements = document.querySelectorAll(
        "li.flagged-product, div.flagged-bought-together, .card.flagged-product, .card.tracking-img-container.flagged-product"
      );

      if (flaggedElements.length !== this.state.productAdCount) {
        this.state.productAdCount = flaggedElements.length;
      }

      notificationBubble.textContent = `${this.state.productAdCount}`;

      if (this.state.productAdCount === 0) {
        notificationBubble.style.display = "none";
      } else {
        notificationBubble.style.display = "flex";
      }
    };

    updateNotificationCount();

    setInterval(() => {
      updateNotificationCount();
    }, 2000);

    button.addEventListener("click", (e) => {
      e.stopPropagation();
      this.state.hideProductAds = !this.state.hideProductAds;

      StorageService.setValue(StorageKey.PRODUCT_AD_VISIBILITY, this.state.hideProductAds);

      const adText = button.querySelector(".ad-text-icon");
      if (adText) {
        if (this.state.hideProductAds) {
          adText.classList.remove("ad-text-disabled");
        } else {
          adText.classList.add("ad-text-disabled");
        }
      }

      const sponsoredFlagButton = document.getElementById(
        "sponsored-flagger-button"
      );
      if (sponsoredFlagButton) {
        const activeButtonClass = "flagger-toggle-product-active";
        if (this.state.hideProductAds) {
          sponsoredFlagButton.classList.remove(activeButtonClass);
        } else {
          sponsoredFlagButton.classList.add(activeButtonClass);
        }
      }

      this.toggleContentVisibility();
      button.classList.toggle("active");

      button.title = this.state.hideProductAds ? "Hide Ads" : "Show Ads";
    });

    return button;
  }

  private createPriceDifferenceOption(): HTMLButtonElement {
    const button = document.createElement("button");
    button.classList.add("toggle-option-button", "price-difference-option");

    const titleText =
      this.state.language === Language.GREEK
        ? `Ελάχιστη διαφορά τιμής: ${this.state.minimumPriceDifference}€`
        : `Minimum Price Difference: ${this.state.minimumPriceDifference}€`;
    button.title = titleText;

    const flexContainer = document.createElement("div");
    flexContainer.style.display = "flex";
    flexContainer.style.alignItems = "center";
    flexContainer.style.justifyContent = "center";

    const valueDisplay = document.createElement("span");
    valueDisplay.textContent = this.state.minimumPriceDifference.toString();
    flexContainer.appendChild(valueDisplay);

    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("viewBox", "0 0 16 16");
    svg.setAttribute("width", "16");
    svg.setAttribute("height", "16");
    svg.style.marginLeft = "5px";

    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute(
      "d",
      "M4 9.42h1.063C5.4 12.323 7.317 14 10.34 14c.622 0 1.167-.068 1.659-.185v-1.3c-.484.119-1.045.17-1.659.17-2.1 0-3.455-1.198-3.775-3.264h4.017v-.928H6.497v-.936c0-.11 0-.219.008-.329h4.078v-.927H6.618c.388-1.898 1.719-2.985 3.723-2.985.614 0 1.175.05 1.659.177V2.194A6.617 6.617 0 0 0 10.341 2c-2.928 0-4.82 1.569-5.244 4.3H4v.928h1.01v1.265H4v.928z"
    );
    path.setAttribute("fill", "currentColor");
    svg.appendChild(path);
    flexContainer.appendChild(svg);

    button.appendChild(flexContainer);

    button.addEventListener("click", (e) => {
      e.stopPropagation();

      const popup = document.createElement("div");
      popup.classList.add("price-difference-popup");

      const label = document.createElement("label");
      label.textContent =
        this.state.language === Language.GREEK
          ? "Ελάχιστη διαφορά τιμής (€):"
          : "Minimum price difference (€):";

      const input = document.createElement("input");
      input.type = "number";
      input.min = "0";
      input.step = "0.5";
      input.value = this.state.minimumPriceDifference.toString();

      const saveValue = () => {
        const newValue = parseFloat(input.value);
        if (!isNaN(newValue) && newValue >= 0) {
          this.state.minimumPriceDifference = newValue;
          valueDisplay.textContent = newValue.toString();

          const updatedTitle =
            this.state.language === Language.GREEK
              ? `Ελάχιστη διαφορά τιμής: ${newValue}€`
              : `Minimum Price Difference: ${newValue}€`;
          button.title = updatedTitle;

          StorageService.setValue(StorageKey.MINIMUM_PRICE_DIFFERENCE, newValue);

          const productPage = document.querySelector("article.offering-card");
          if (productPage) {
            const event = new Event("priceThresholdChange");
            document.dispatchEvent(event);
          }
        }
        popup.remove();
      };

      input.addEventListener("blur", saveValue);
      input.addEventListener("keyup", (event) => {
        if (event.key === "Enter") {
          saveValue();
        }
      });

      popup.appendChild(label);
      popup.appendChild(input);
      button.appendChild(popup);
      input.focus();

      const closePopupHandler = (event: MouseEvent) => {
        if (!popup.contains(event.target as Node) && event.target !== button) {
          saveValue();
          document.removeEventListener("click", closePopupHandler);
        }
      };

      setTimeout(() => {
        document.addEventListener("click", closePopupHandler);
      }, 100);
    });

    return button;
  }

  private createVideoToggleButton(): HTMLButtonElement {
    const button = document.createElement("button");
    button.classList.add("toggle-option-button", "video-toggle-option");
    button.title = this.state.hideVideoAds ? "Hide Videos" : "Show Videos";

    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("viewBox", "0 0 16 16");
    svg.setAttribute("width", "16");
    svg.setAttribute("height", "16");

    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    if (this.state.hideVideoAds) {
      path.setAttribute(
        "d",
        "M0 1a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H1a1 1 0 0 1-1-1V1zm4 0v6h8V1H4zm8 8H4v6h8V9zM1 1v2h2V1H1zm2 3H1v2h2V4zM1 7v2h2V7H1zm2 3H1v2h2v-2zm-2 3v2h2v-2H1zM15 1h-2v2h2V1zm-2 3v2h2V4h-2zm2 3h-2v2h2V7zm-2 3v2h2v-2h-2zm2 3h-2v2h2v-2z"
      );
    } else {
      path.setAttribute(
        "d",
        "M0 1a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H1a1 1 0 0 1-1-1V1zm4 0v6h8V1H4zm8 8H4v6h8V9zM1 1v2h2V1H1zm2 3H1v2h2V4zM1 7v2h2V7H1zm2 3H1v2h2v-2zm-2 3v2h2v-2H1zM15 1h-2v2h2V1zm-2 3v2h2V4h-2zm2 3h-2v2h2V7zm-2 3v2h2v-2h-2zm2 3h-2v2h2v-2z M10.707 5.293a1 1 0 0 0-1.414 0L7 7.586 5.707 6.293a1 1 0 0 0-1.414 1.414L5.586 9 4.293 10.293a1 1 0 1 0 1.414 1.414L7 10.414l1.293 1.293a1 1 0 0 0 1.414-1.414L8.414 9l1.293-1.293a1 1 0 0 0 0-1.414z"
      );
    }
    path.setAttribute("fill", "currentColor");
    svg.appendChild(path);
    button.appendChild(svg);

    const videoNotificationBubble = document.createElement("div");
    videoNotificationBubble.classList.add(
      "notification-bubble",
      "video-notification"
    );
    videoNotificationBubble.textContent = `${this.state.videoAdCount}`;
    button.appendChild(videoNotificationBubble);

    const updateVideoNotificationCount = () => {
      videoNotificationBubble.textContent = `${this.state.videoAdCount}`;
      if (this.state.videoAdCount === 0) {
        videoNotificationBubble.style.display = "none";
      } else {
        videoNotificationBubble.style.display = "flex";
      }
    };

    updateVideoNotificationCount();

    setInterval(() => {
      updateVideoNotificationCount();
    }, 2000);

    if (!this.state.hideVideoAds) {
      button.classList.add("active");
    }

    button.addEventListener("click", (e) => {
      e.stopPropagation();
      this.state.hideVideoAds = !this.state.hideVideoAds;

      // Add this line to persist the video visibility setting to storage
      StorageService.setValue(StorageKey.VIDEO_AD_VISIBILITY, this.state.hideVideoAds);

      this.videoHandler.toggleVideoVisibility();
      button.classList.toggle("active");

      const newPath = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "path"
      );
      if (this.state.hideVideoAds) {
        newPath.setAttribute(
          "d",
          "M0 1a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H1a1 1 0 0 1-1-1V1zm4 0v6h8V1H4zm8 8H4v6h8V9zM1 1v2h2V1H1zm2 3H1v2h2V4zM1 7v2h2V7H1zm2 3H1v2h2v-2zm-2 3v2h2v-2H1zM15 1h-2v2h2V1zm-2 3v2h2V4h-2zm2 3h-2v2h2V7zm-2 3v2h2v-2h-2zm2 3h-2v2h2v-2z"
        );
      } else {
        newPath.setAttribute(
          "d",
          "M0 1a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H1a1 1 0 0 1-1-1V1zm4 0v6h8V1H4zm8 8H4v6h8V9zM1 1v2h2V1H1zm2 3H1v2h2V4zM1 7v2h2V7H1zm2 3H1v2h2v-2zm-2 3v2h2v-2H1zM15 1h-2v2h2V1zm-2 3v2h2V4h-2zm2 3h-2v2h2V7zm-2 3v2h2v-2h-2zm2 3h-2v2h2V7zm-2 3h-2v2h2v-2z M10.707 5.293a1 1 0 0 0-1.414 0L7 7.586 5.707 6.293a1 1 0 0 0-1.414 1.414L5.586 9 4.293 10.293a1 1 0 1 0 1.414 1.414L7 10.414l1.293 1.293a1 1 0 0 0 1.414-1.414L8.414 9l1.293-1.293a1 1 0 0 0 0-1.414z"
        );
      }
      newPath.setAttribute("fill", "currentColor");

      const oldPath = svg.querySelector("path");
      if (oldPath) {
        svg.removeChild(oldPath);
      }
      svg.appendChild(newPath);

      button.title = this.state.hideVideoAds ? "Hide Videos" : "Show Videos";
    });

    return button;
  }

  private createSponsorshipToggleButton(): HTMLButtonElement {
    const button = document.createElement("button");
    button.classList.add("toggle-option-button", "sponsorship-toggle-option");
    button.title = this.state.hideSponsorships
      ? "Hide Sponsorships"
      : "Show Sponsorships";

    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("viewBox", "0 0 16 16");
    svg.setAttribute("width", "16");
    svg.setAttribute("height", "16");

    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    if (this.state.hideSponsorships) {
      // Megaphone icon for visible state
      path.setAttribute(
        "d",
        "M12 1a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1h8zM4 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2H4z M4 2.5a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-.5.5h-7a.5.5 0 0 1-.5-.5v-2zm0 4a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-.5.5h-7a.5.5 0 0 1-.5-.5v-2zm0 4a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-.5.5h-7a.5.5 0 0 1-.5-.5v-2z"
      );
    } else {
      // Blocked megaphone icon for hidden state
      path.setAttribute(
        "d",
        "M12 1a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1h8zM4 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2H4z M4 2.5a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-.5.5h-7a.5.5 0 0 1-.5-.5v-2zm0 4a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-.5.5h-7a.5.5 0 0 1-.5-.5v-2zm0 4a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-.5.5h-7a.5.5 0 0 1-.5-.5v-2z M13.354 3.354a.5.5 0 0 0-.708-.708L2.646 12.646a.5.5 0 0 0 .708.708L13.354 3.354z"
      );
    }
    path.setAttribute("fill", "currentColor");

    svg.appendChild(path);
    button.appendChild(svg);

    const notificationBubble = document.createElement("div");
    notificationBubble.classList.add(
      "notification-bubble",
      "sponsorship-notification"
    );
    notificationBubble.textContent = "0";
    button.appendChild(notificationBubble);

    const updateNotificationCount = () => {
      const sponsorshipElements = document.querySelectorAll(
        "div#sponsorship.flagged-sponsorship"
      );
      notificationBubble.textContent = `${sponsorshipElements.length}`;
      notificationBubble.style.display =
        sponsorshipElements.length === 0 ? "none" : "flex";
    };

    updateNotificationCount();

    setInterval(updateNotificationCount, 2000);

    if (!this.state.hideSponsorships) {
      button.classList.add("active");
    }

    button.addEventListener("click", (e) => {
      e.stopPropagation();
      this.sponsorshipHandler.toggleSponsorship();
      button.classList.toggle("active");

      const newPath = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "path"
      );
      if (!button.classList.contains("active")) {
        // Megaphone icon for visible state
        newPath.setAttribute(
          "d",
          "M12 1a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1h8zM4 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2H4z M4 2.5a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-.5.5h-7a.5.5 0 0 1-.5-.5v-2zm0 4a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-.5.5h-7a.5.5 0 0 1-.5-.5v-2zm0 4a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-.5.5h-7a.5.5 0 0 1-.5-.5v-2z"
        );
      } else {
        // Blocked megaphone icon for hidden state
        newPath.setAttribute(
          "d",
          "M12 1a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1h8zM4 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2H4z M4 2.5a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-.5.5h-7a.5.5 0 0 1-.5-.5v-2zm0 4a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-.5.5h-7a.5.5 0 0 1-.5-.5v-2zm0 4a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-.5.5h-7a.5.5 0 0 1-.5-.5v-2z M13.354 3.354a.5.5 0 0 0-.708-.708L2.646 12.646a.5.5 0 0 0 .708.708L13.354 3.354z"
        );
      }
      newPath.setAttribute("fill", "currentColor");

      const oldPath = svg.querySelector("path");
      if (oldPath) {
        svg.removeChild(oldPath);
      }
      svg.appendChild(newPath);

      button.title = button.classList.contains("active")
        ? "Show Sponsorships"
        : "Hide Sponsorships";
    });

    return button;
  }

  private toggleContentVisibility(): void {
    const selectors = [
      "li.flagged-product",
      "div.flagged-shelf",
      "div.selected-product-cards",
      "div.flagged-bought-together",
      ".card.tracking-img-container.flagged-product",
      ".card.flagged-product",
    ];

    selectors.forEach((selector) => {
      const elements = document.querySelectorAll(selector);
      elements?.forEach((element) => {
        this.state.hideProductAds
          ? element.classList.remove("display-none")
          : element.classList.add("display-none");
      });
    });

    document
      .querySelectorAll(".card.tracking-img-container")
      .forEach((card) => {
        if (card.querySelector(".shop-promoter")) {
          if (!card.classList.contains("flagged-product")) {
            card.classList.add("flagged-product");
            this.state.productAdCount++;
          }

          this.state.hideProductAds
            ? card.classList.remove("display-none")
            : card.classList.add("display-none");
        }
      });
  }
}
