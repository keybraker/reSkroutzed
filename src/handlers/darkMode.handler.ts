import { appendLogoChild } from "../functions/appendLogoChild";
import { StorageService, StorageKey } from "../services/storage.service";
import { State } from "../types/State.type";

export class DarkModeHandler {
  private state: State;

  constructor(state: State) {
    this.state = state;
  }

  public applyDarkMode(): void {
    if (this.state.darkMode) {
      document.body.classList.add("dark-mode");
    } else {
      document.body.classList.remove("dark-mode");
    }
  }

  public toggleDarkMode(): void {
    this.state.darkMode = !this.state.darkMode;

    StorageService.setValue(StorageKey.DARK_MODE, this.state.darkMode);

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
    svg.setAttribute("width", "24");
    svg.setAttribute("height", "24");
    svg.setAttribute("viewBox", "0 0 24 24");
    svg.setAttribute("fill", "none");
    svg.setAttribute("stroke", "currentColor");
    svg.setAttribute("stroke-width", "2");
    svg.setAttribute("stroke-linecap", "round");
    svg.setAttribute("stroke-linejoin", "round");
    
    if (this.state.darkMode) {
      // Sun icon when in dark mode
      const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
      circle.setAttribute("cx", "12");
      circle.setAttribute("cy", "12");
      circle.setAttribute("r", "5");
      
      const line1 = document.createElementNS("http://www.w3.org/2000/svg", "line");
      line1.setAttribute("x1", "12");
      line1.setAttribute("y1", "1");
      line1.setAttribute("x2", "12");
      line1.setAttribute("y2", "3");
      
      const line2 = document.createElementNS("http://www.w3.org/2000/svg", "line");
      line2.setAttribute("x1", "12");
      line2.setAttribute("y1", "21");
      line2.setAttribute("x2", "12");
      line2.setAttribute("y2", "23");
      
      const line3 = document.createElementNS("http://www.w3.org/2000/svg", "line");
      line3.setAttribute("x1", "4.22");
      line3.setAttribute("y1", "4.22");
      line3.setAttribute("x2", "5.64");
      line3.setAttribute("y2", "5.64");
      
      const line4 = document.createElementNS("http://www.w3.org/2000/svg", "line");
      line4.setAttribute("x1", "18.36");
      line4.setAttribute("y1", "18.36");
      line4.setAttribute("x2", "19.78");
      line4.setAttribute("y2", "19.78");
      
      const line5 = document.createElementNS("http://www.w3.org/2000/svg", "line");
      line5.setAttribute("x1", "1");
      line5.setAttribute("y1", "12");
      line5.setAttribute("x2", "3");
      line5.setAttribute("y2", "12");
      
      const line6 = document.createElementNS("http://www.w3.org/2000/svg", "line");
      line6.setAttribute("x1", "21");
      line6.setAttribute("y1", "12");
      line6.setAttribute("x2", "23");
      line6.setAttribute("y2", "12");
      
      const line7 = document.createElementNS("http://www.w3.org/2000/svg", "line");
      line7.setAttribute("x1", "4.22");
      line7.setAttribute("y1", "19.78");
      line7.setAttribute("x2", "5.64");
      line7.setAttribute("y2", "18.36");
      
      const line8 = document.createElementNS("http://www.w3.org/2000/svg", "line");
      line8.setAttribute("x1", "18.36");
      line8.setAttribute("y1", "5.64");
      line8.setAttribute("x2", "19.78");
      line8.setAttribute("y2", "4.22");
      
      svg.appendChild(circle);
      svg.appendChild(line1);
      svg.appendChild(line2);
      svg.appendChild(line3);
      svg.appendChild(line4);
      svg.appendChild(line5);
      svg.appendChild(line6);
      svg.appendChild(line7);
      svg.appendChild(line8);
    } else {
      // Moon icon when in light mode
      const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
      path.setAttribute("d", "M21 12.79A9 9 0 1 1 11.21 3 A7 7 0 0 0 21 12.79z");
      svg.appendChild(path);
    }
    
    return svg;
  }
}
