import { appendLogoChild } from "../functions/appendLogoChild";
import { State } from "../types/State";

export class DarkModeHandler {
  private state: State;
  private darkModeKey = "ssf-dark-mode";

  constructor(state: State) {
    this.state = state;
    this.initializeDarkMode();
  }

  private initializeDarkMode(): void {
    const darkMode = localStorage.getItem(this.darkModeKey) === "true";
    this.state.darkMode = darkMode;
    this.applyDarkMode();
  }

  private applyDarkMode(): void {
    if (this.state.darkMode) {
      document.body.classList.add("dark-mode");
    } else {
      document.body.classList.remove("dark-mode");
    }
  }

  public toggleDarkMode(): void {
    this.state.darkMode = !this.state.darkMode;
    localStorage.setItem(this.darkModeKey, String(this.state.darkMode));
    this.applyDarkMode();
  }

  public createDarkModeToggle(): HTMLDivElement {
    const button = document.createElement("button");
    const colFlex = document.createElement("div");

    button.classList.add("dark-mode-toggle");
    colFlex.classList.add("inline-flex-col");

    const icon = this.createDarkModeIcon();
    button.appendChild(icon);
    appendLogoChild(button);

    button.addEventListener("click", () => this.toggleDarkMode());

    // Add hover event listeners
    button.addEventListener("mouseover", () =>
      document.body.classList.add("dark-mode-hover")
    );
    button.addEventListener("mouseout", () =>
      document.body.classList.remove("dark-mode-hover")
    );

    colFlex.appendChild(button);

    return colFlex;
  }

  private createDarkModeIcon(): SVGSVGElement {
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("viewBox", "0 0 24 24");
    svg.setAttribute("width", "16");
    svg.setAttribute("height", "16");

    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute(
      "d",
      "M12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9 9-4.03 9-9c0-.46-.04-.92-.1-1.36-.98 1.37-2.58 2.26-4.4 2.26-3.03 0-5.5-2.47-5.5-5.5 0-1.82.89-3.42 2.26-4.4-.44-.06-.9-.1-1.36-.1z"
    );
    path.setAttribute("fill", "currentColor");

    svg.appendChild(path);
    return svg;
  }
}
