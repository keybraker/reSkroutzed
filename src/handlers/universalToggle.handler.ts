import { appendLogoChild } from "../functions/appendLogoChild";
import { State } from "../types/State.type";
import { DarkModeHandler } from "./darkMode.handler";
import { PromotionalVideoHandler } from "./promotionalVideo.handler";
import { BlockIndicator } from "../decorators/BlockIndicator.decorator";

export class UniversalToggleHandler {
  private state: State;
  private darkModeHandler: DarkModeHandler;
  private videoHandler: PromotionalVideoHandler;
  private blockIndicator: BlockIndicator;
  private isMenuOpen: boolean = false;

  constructor(
    state: State,
    darkModeHandler: DarkModeHandler,
    videoHandler: PromotionalVideoHandler,
    blockIndicator: BlockIndicator
  ) {
    this.state = state;
    this.darkModeHandler = darkModeHandler;
    this.videoHandler = videoHandler;
    this.blockIndicator = blockIndicator;
  }

  public createUniversalToggle(): HTMLDivElement {
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

    // Add buttons to container
    buttonsContainer.appendChild(darkModeButton);
    buttonsContainer.appendChild(adToggleButton);
    buttonsContainer.appendChild(videoToggleButton);

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
    button.title = this.state.visible ? "Hide Ads" : "Show Ads";

    // Create icon
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("viewBox", "0 0 16 16");
    svg.setAttribute("width", "16");
    svg.setAttribute("height", "16");

    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    if (this.state.visible) {
      path.setAttribute(
        "d",
        "M16 8s-3-5.5-8-5.5S0 8 0 8s3 5.5 8 5.5S16 8 16 8zM1.173 8a13.133 13.133 0 0 1 1.66-2.043C4.12 4.668 5.88 3.5 8 3.5c2.12 0 3.879 1.168 5.168 2.457A13.133 13.133 0 0 1 14.828 8c-.058.087-.122.183-.195.288-.335.48-.83 1.12-1.465 1.755C11.879 11.332 10.119 12.5 8 12.5c-2.12 0-3.879-1.168-5.168-2.457A13.134 13.134 0 0 1 1.172 8z"
      );
    } else {
      path.setAttribute(
        "d",
        "M13.359 11.238C15.06 9.72 16 8 16 8s-3-5.5-8-5.5a7.028 7.028 0 0 0-2.79.588l.77.771A5.944 5.944 0 0 1 8 3.5c2.12 0 3.879 1.168 5.168 2.457A13.134 13.134 0 0 1 14.828 8c-.058.087-.122.183-.195.288-.335.48-.83 1.12-1.465 1.755-.165.165-.337.328-.517.486l.708.709z M11.297 9.176a3.5 3.5 0 0 0-4.474-4.474l.823.823a2.5 2.5 0 0 1 2.829 2.829l.822.822zm-2.943 1.299.822.822a3.5 3.5 0 0 1-4.474-4.474l.823.823a2.5 2.5 0 0 0 2.829 2.829z M3.35 5.47c-.18.16-.353.322-.518.487A13.134 13.134 0 0 0 1.172 8l.195.288c.335.48.83 1.12 1.465 1.755C4.121 11.332 5.881 12.5 8 12.5c.716 0 1.39-.133 2.02-.36l.77.772A7.029 7.029 0 0 1 8 13.5C3 13.5 0 8 0 8s.939-1.721 2.641-3.238l.708.709zm10.296 8.884-12-12 .708-.708 12 12-.708.708z"
      );
    }
    path.setAttribute("fill", "currentColor");

    svg.appendChild(path);
    button.appendChild(svg);

    // Add notification bubble with ad count
    const notificationBubble = document.createElement("div");
    notificationBubble.classList.add("notification-bubble");
    notificationBubble.textContent = `${this.state.sponsoredCount}`;
    button.appendChild(notificationBubble);

    // Update notification count when it changes
    const updateNotificationCount = () => {
      notificationBubble.textContent = `${this.state.sponsoredCount}`;
      // Hide bubble if count is zero
      if (this.state.sponsoredCount === 0) {
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

    // Add active class if ads are hidden
    if (!this.state.visible) {
      button.classList.add("active");
    }

    // Add click event
    button.addEventListener("click", (e) => {
      e.stopPropagation();
      this.state.visible = !this.state.visible;
      localStorage.setItem("ssf-sponsored-visibility", `${this.state.visible}`);

      // Instead of directly calling the private method, let's update the sponsored-flagger-button
      // and trigger UI updates through the DOM
      const sponsoredFlagButton = document.getElementById(
        "sponsored-flagger-button"
      );
      if (sponsoredFlagButton) {
        // We'll toggle the class that would be toggled by BlockIndicator
        const activeButtonClass = "flagger-toggle-product-active";
        if (this.state.visible) {
          sponsoredFlagButton.classList.remove(activeButtonClass);
        } else {
          sponsoredFlagButton.classList.add(activeButtonClass);
        }
      }

      // Use our own content visibility toggle method
      this.toggleContentVisibility();
      button.classList.toggle("active");

      // Update icon based on visibility state
      const newPath = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "path"
      );
      if (this.state.visible) {
        newPath.setAttribute(
          "d",
          "M16 8s-3-5.5-8-5.5S0 8 0 8s3 5.5 8 5.5S16 8 16 8zM1.173 8a13.133 13.133 0 0 1 1.66-2.043C4.12 4.668 5.88 3.5 8 3.5c2.12 0 3.879 1.168 5.168 2.457A13.133 13.133 0 0 1 14.828 8c-.058.087-.122.183-.195.288-.335.48-.83 1.12-1.465 1.755C11.879 11.332 10.119 12.5 8 12.5c-2.12 0-3.879-1.168-5.168-2.457A13.134 13.134 0 0 1 1.172 8z"
        );
      } else {
        newPath.setAttribute(
          "d",
          "M13.359 11.238C15.06 9.72 16 8 16 8s-3-5.5-8-5.5a7.028 7.028 0 0 0-2.79.588l.77.771A5.944 5.944 0 0 1 8 3.5c2.12 0 3.879 1.168 5.168 2.457A13.134 13.134 0 0 1 14.828 8c-.058.087-.122.183-.195.288-.335.48-.83 1.12-1.465 1.755-.165.165-.337.328-.517.486l.708.709z M11.297 9.176a3.5 3.5 0 0 0-4.474-4.474l.823.823a2.5 2.5 0 0 1 2.829 2.829l.822.822zm-2.943 1.299.822.822a3.5 3.5 0 0 1-4.474-4.474l.823.823a2.5 2.5 0 0 0 2.829 2.829z M3.35 5.47c-.18.16-.353.322-.518.487A13.134 13.134 0 0 0 1.172 8l.195.288c.335.48.83 1.12 1.465 1.755C4.121 11.332 5.881 12.5 8 12.5c.716 0 1.39-.133 2.02-.36l.77.772A7.029 7.029 0 0 1 8 13.5C3 13.5 0 8 0 8s.939-1.721 2.641-3.238l.708.709zm10.296 8.884-12-12 .708-.708 12 12-.708.708z"
        );
      }
      newPath.setAttribute("fill", "currentColor");

      // Replace the path in the SVG
      const oldPath = svg.querySelector("path");
      if (oldPath) {
        svg.removeChild(oldPath);
      }
      svg.appendChild(newPath);

      button.title = this.state.visible ? "Hide Ads" : "Show Ads";
    });

    return button;
  }

  private createVideoToggleButton(): HTMLButtonElement {
    const button = document.createElement("button");
    button.classList.add("toggle-option-button", "video-toggle-option");
    button.title = this.state.videoVisible ? "Hide Videos" : "Show Videos";

    // Create icon
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("viewBox", "0 0 16 16");
    svg.setAttribute("width", "16");
    svg.setAttribute("height", "16");

    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    if (this.state.videoVisible) {
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

    // Add active class if videos are hidden
    if (!this.state.videoVisible) {
      button.classList.add("active");
    }

    // Add click event
    button.addEventListener("click", (e) => {
      e.stopPropagation();
      this.state.videoVisible = !this.state.videoVisible;
      localStorage.setItem(
        "ssf-video-visibility",
        `${this.state.videoVisible}`
      );
      this.videoHandler.toggleVideoVisibility();
      button.classList.toggle("active");

      // Update icon based on visibility state
      const newPath = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "path"
      );
      if (this.state.videoVisible) {
        newPath.setAttribute(
          "d",
          "M0 1a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H1a1 1 0 0 1-1-1V1zm4 0v6h8V1H4zm8 8H4v6h8V9zM1 1v2h2V1H1zm2 3H1v2h2V4zM1 7v2h2V7H1zm2 3H1v2h2v-2zm-2 3v2h2v-2H1zM15 1h-2v2h2V1zm-2 3v2h2V4h-2zm2 3h-2v2h2V7zm-2 3v2h2v-2h-2zm2 3h-2v2h2v-2z"
        );
      } else {
        newPath.setAttribute(
          "d",
          "M0 1a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1v14a1 1 0 0 1 1 1H1a1 1 0 0 1-1-1V1zm4 0v6h8V1H4zm8 8H4v6h8V9zM1 1v2h2V1H1zm2 3H1v2h2V4zM1 7v2h2V7H1zm2 3H1v2h2v-2zm-2 3v2h2v-2H1zM15 1h-2v2h2V1zm-2 3v2h2V4h-2zm2 3h-2v2h2V7zm-2 3v2h2v-2h-2zm2 3h-2v2h2V7zm2 3h-2v2h2v-2z M10.707 5.293a1 1 0 0 0-1.414 0L7 7.586 5.707 6.293a1 1 0 0 0-1.414 1.414L5.586 9 4.293 10.293a1 1 0 1 0 1.414 1.414L7 10.414l1.293 1.293a1 1 0 0 0 1.414-1.414L8.414 9l1.293-1.293a1 1 0 0 0 0-1.414z"
        );
      }
      newPath.setAttribute("fill", "currentColor");

      // Replace the path in the SVG
      const oldPath = svg.querySelector("path");
      if (oldPath) {
        svg.removeChild(oldPath);
      }
      svg.appendChild(newPath);

      button.title = this.state.videoVisible ? "Hide Videos" : "Show Videos";
    });

    return button;
  }

  private toggleContentVisibility(): void {
    const selectors = [
      "li.flagged-product",
      "div.flagged-shelf",
      "div.selected-product-cards",
      "div.flagged-bought-together",
    ];

    selectors.forEach((selector) => {
      const elements = document.querySelectorAll(selector);
      elements?.forEach((element) => {
        this.state.visible
          ? element.classList.remove("display-none")
          : element.classList.add("display-none");
      });
    });
  }
}
