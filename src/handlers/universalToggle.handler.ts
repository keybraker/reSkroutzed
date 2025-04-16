import { appendLogoChild } from "../functions/appendLogoChild";
import { State } from "../types/State.type";
import { DarkModeHandler } from "./darkMode.handler";
import { PromotionalVideoHandler } from "./promotionalVideo.handler";
import { SponsorshipHandler } from "./sponsorship.handler";
// import { PriceCheckerIndicator } from "../decorators/PriceCheckerIndicator.decorator";

export class UniversalToggleHandler {
  private state: State;
  private darkModeHandler: DarkModeHandler;
  private videoHandler: PromotionalVideoHandler;
  private sponsorshipHandler: SponsorshipHandler;
  // private priceChecker: PriceCheckerIndicator;
  private isMenuOpen: boolean = false;

  constructor(
    state: State,
    darkModeHandler: DarkModeHandler,
    videoHandler: PromotionalVideoHandler,
    sponsorshipHandler: SponsorshipHandler
  ) {
    this.state = state;
    this.darkModeHandler = darkModeHandler;
    this.videoHandler = videoHandler;
    this.sponsorshipHandler = sponsorshipHandler;
    // this.priceChecker = new PriceCheckerIndicator(state);
  }

  public createUniversalToggle(): HTMLDivElement {
    // Initialize PriceCheckerIndicator
    // this.priceChecker.start();

    // Create main container
    const container = document.createElement("div");
    container.classList.add("universal-toggle-container");

    // Create main toggle button
    const mainToggle = document.createElement("button");
    mainToggle.classList.add("universal-toggle-button");
    mainToggle.title = "ReSkroutzed Options";

    // Add ReSkroutzed logo
    const logoSvg = this.createLogoIcon();
    mainToggle.appendChild(logoSvg);
    appendLogoChild(mainToggle);

    // Create buttons container
    const buttonsContainer = document.createElement("div");
    buttonsContainer.classList.add("toggle-buttons-container");

    // Create individual toggle buttons
    const darkModeButton = this.createDarkModeToggleButton();
    const adToggleButton = this.createAdToggleButton();
    const videoToggleButton = this.createVideoToggleButton();
    // const sponsorshipToggleButton = this.createSponsorshipToggleButton();

    // Add buttons to container
    buttonsContainer.appendChild(darkModeButton);
    buttonsContainer.appendChild(adToggleButton);
    buttonsContainer.appendChild(videoToggleButton);
    // buttonsContainer.appendChild(sponsorshipToggleButton);

    // Add event listener for main toggle
    mainToggle.addEventListener("click", () => this.toggleMenu(container));

    // Add event listener for clicking outside
    document.addEventListener("click", (event) => {
      if (this.isMenuOpen && !container.contains(event.target as Node)) {
        this.closeMenu(container);
      }
    });

    // Add elements to container
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

    // Add animation classes to buttons
    const buttons = container.querySelectorAll(".toggle-option-button");
    buttons.forEach((button, index) => {
      setTimeout(() => {
        button.classList.add("button-active");
      }, 50 * (buttons.length - index));
    });
  }

  private closeMenu(container: HTMLElement): void {
    container.classList.remove("menu-open");
    this.isMenuOpen = false;

    // Remove animation classes from buttons
    const buttons = container.querySelectorAll(".toggle-option-button");
    buttons.forEach((button) => {
      button.classList.remove("button-active");
    });
  }

  private createLogoIcon(): SVGSVGElement {
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("viewBox", "0 0 24 24");
    svg.setAttribute("width", "20");
    svg.setAttribute("height", "20");

    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute(
      "d",
      "M14.5 2.5c0 1.5-1.5 2.5-2.5 2.5s-2.5-1-2.5-2.5S10.5 0 12 0s2.5 1 2.5 2.5zM0 14c1.5 0 4.5-3 7.5-3s4.5 3 7.5 3 4.5-3 7.5-3c0 0 1.5 0 1.5 2S20 17 18.5 17c-2 0-4.5-3-7.5-3s-4.5 3-7.5 3S0 14 0 14z"
    );
    path.setAttribute("fill", "currentColor");

    svg.appendChild(path);
    return svg;
  }

  private createDarkModeToggleButton(): HTMLButtonElement {
    const button = document.createElement("button");
    button.classList.add("toggle-option-button", "dark-mode-option");
    button.title = this.state.darkMode
      ? "Switch to Light Mode"
      : "Switch to Dark Mode";

    // Create icon
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("viewBox", "0 0 24 24");
    svg.setAttribute("width", "16");
    svg.setAttribute("height", "16");

    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");

    // Use moon icon for dark mode, sun icon for light mode
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

    // Add active class if dark mode is enabled
    if (this.state.darkMode) {
      button.classList.add("active");
    }

    // Add click event
    button.addEventListener("click", (e) => {
      e.stopPropagation();
      this.darkModeHandler.toggleDarkMode();
      button.classList.toggle("active");

      // Update icon based on current mode
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

      // Replace the path in the SVG
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

    // Create text-based AD icon instead of eye icon
    const adTextSpan = document.createElement("span");
    adTextSpan.classList.add("ad-text-icon");
    adTextSpan.textContent = "AD";

    // Apply line-through if ads are hidden
    if (!this.state.hideProductAds) {
      adTextSpan.classList.add("ad-text-disabled");
      // Add active class if ads are hidden (button should be orange when ads are hidden)
      button.classList.add("active");
    }

    button.appendChild(adTextSpan);

    // Add notification bubble with ad count
    const notificationBubble = document.createElement("div");
    notificationBubble.classList.add("notification-bubble");
    notificationBubble.textContent = `${this.state.productAdCount}`;
    button.appendChild(notificationBubble);

    // Update notification count when it changes - only query the actual DOM elements once
    // rather than relying on state.sponsoredCount which might increase incorrectly
    const updateNotificationCount = () => {
      // Count all flagged product elements in the DOM to show an accurate count
      const flaggedElements = document.querySelectorAll(
        "li.flagged-product, div.flagged-bought-together, .card.flagged-product, .card.tracking-img-container.flagged-product"
      );

      // Only update state if there's a mismatch to avoid incrementing repeatedly
      if (flaggedElements.length !== this.state.productAdCount) {
        this.state.productAdCount = flaggedElements.length;
      }

      notificationBubble.textContent = `${this.state.productAdCount}`;

      // Hide bubble if count is zero
      if (this.state.productAdCount === 0) {
        notificationBubble.style.display = "none";
      } else {
        notificationBubble.style.display = "flex";
      }
    };

    // Initial update
    updateNotificationCount();

    // Set up an observer to watch for changes to sponsored count
    setInterval(() => {
      updateNotificationCount();
    }, 2000);

    // Add click event
    button.addEventListener("click", (e) => {
      e.stopPropagation();
      this.state.hideProductAds = !this.state.hideProductAds;
      localStorage.setItem(
        "reSkroutzed-sponsored-visibility",
        `${this.state.hideProductAds}`
      );

      // Update the text icon appearance
      const adText = button.querySelector(".ad-text-icon");
      if (adText) {
        if (this.state.hideProductAds) {
          adText.classList.remove("ad-text-disabled");
        } else {
          adText.classList.add("ad-text-disabled");
        }
      }

      // Instead of directly calling the private method, let's update the sponsored-flagger-button
      // and trigger UI updates through the DOM
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

      // Use our own content visibility toggle method
      this.toggleContentVisibility();
      button.classList.toggle("active");

      button.title = this.state.hideProductAds ? "Hide Ads" : "Show Ads";
    });

    return button;
  }

  private createVideoToggleButton(): HTMLButtonElement {
    const button = document.createElement("button");
    button.classList.add("toggle-option-button", "video-toggle-option");
    button.title = this.state.hideVideoAds ? "Hide Videos" : "Show Videos";

    // Create icon
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

    // Add notification bubble with video count
    const videoNotificationBubble = document.createElement("div");
    videoNotificationBubble.classList.add(
      "notification-bubble",
      "video-notification"
    );
    videoNotificationBubble.textContent = `${this.state.videoAdCount}`;
    button.appendChild(videoNotificationBubble);

    // Update notification count when it changes
    const updateVideoNotificationCount = () => {
      videoNotificationBubble.textContent = `${this.state.videoAdCount}`;
      // Hide bubble if count is zero
      if (this.state.videoAdCount === 0) {
        videoNotificationBubble.style.display = "none";
      } else {
        videoNotificationBubble.style.display = "flex";
      }
    };

    // Initial update
    updateVideoNotificationCount();

    // Set up an observer to watch for changes to video count
    setInterval(() => {
      updateVideoNotificationCount();
    }, 2000);

    if (!this.state.hideVideoAds) {
      button.classList.add("active");
    }

    // Add click event
    button.addEventListener("click", (e) => {
      e.stopPropagation();
      this.state.hideVideoAds = !this.state.hideVideoAds;
      localStorage.setItem(
        "reSkroutzed-video-visibility",
        `${this.state.hideVideoAds}`
      );
      this.videoHandler.toggleVideoVisibility();
      button.classList.toggle("active");

      // Update icon based on visibility state
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
          "M0 1a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H1a1 1 0 0 1-1-1V1zm4 0v6h8V1H4zm8 8H4v6h8V9zM1 1v2h2V1H1zm2 3H1v2h2V4zM1 7v2h2V7H1zm2 3H1v2h2v-2zm-2 3v2h2v-2H1zM15 1h-2v2h2V1zm-2 3v2h2V4h-2zm2 3h-2v2h2V7zm-2 3v2h2v-2h-2zm2 3h-2v2h2v-2z M10.707 5.293a1 1 0 0 0-1.414 0L7 7.586 5.707 6.293a1 1 0 0 0-1.414 1.414L5.586 9 4.293 10.293a1 1 0 1 0 1.414 1.414L7 10.414l1.293 1.293a1 1 0 0 0 1.414-1.414L8.414 9l1.293-1.293a1 1 0 0 0 0-1.414z"
        );
      }
      newPath.setAttribute("fill", "currentColor");

      // Replace the path in the SVG
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
    button.title = this.state.hideProductAds
      ? "Hide Sponsorships"
      : "Show Sponsorships";

    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("viewBox", "0 0 16 16");
    svg.setAttribute("width", "16");
    svg.setAttribute("height", "16");

    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    if (this.state.hideProductAds) {
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

    // Add notification bubble with sponsorship count
    const notificationBubble = document.createElement("div");
    notificationBubble.classList.add(
      "notification-bubble",
      "sponsorship-notification"
    );
    notificationBubble.textContent = "0";
    button.appendChild(notificationBubble);

    // Update notification count when it changes
    const updateNotificationCount = () => {
      const sponsorshipElements = document.querySelectorAll(
        "div#sponsorship.flagged-sponsorship"
      );
      notificationBubble.textContent = `${sponsorshipElements.length}`;
      // Hide bubble if count is zero
      notificationBubble.style.display =
        sponsorshipElements.length === 0 ? "none" : "flex";
    };

    // Initial update
    updateNotificationCount();

    // Set up an observer to watch for changes to sponsorship count
    setInterval(updateNotificationCount, 2000);

    // Add active class if sponsorships are hidden
    if (!this.state.hideProductAds) {
      button.classList.add("active");
    }

    // Add click event
    button.addEventListener("click", (e) => {
      e.stopPropagation();
      this.sponsorshipHandler.toggleSponsorship();
      button.classList.toggle("active");

      // Update icon based on visibility state
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

      // Replace the path in the SVG
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
      // Removed div.flagged-sponsorship since it's handled by sponsorship button
    ];

    selectors.forEach((selector) => {
      const elements = document.querySelectorAll(selector);
      elements?.forEach((element) => {
        this.state.hideProductAds
          ? element.classList.remove("display-none")
          : element.classList.add("display-none");
      });
    });

    // Special handling for card tracking-img-container elements with shop-promoter
    document
      .querySelectorAll(".card.tracking-img-container")
      .forEach((card) => {
        if (card.querySelector(".shop-promoter")) {
          // If this card hasn't been flagged yet, mark it and count it
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
