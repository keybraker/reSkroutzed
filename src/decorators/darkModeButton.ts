import { State } from "../types/State";

const darkModeIcon = {
    viewBox: "0 0 16 16",
    path: "M16 8s-3-5.5-8-5.5S0 8 0 8s3 5.5 8 5.5S16 8 16 8zM1.173 8a13.133 13.133 0 0 1 1.66-2.043C4.12 4.668 5.88 3.5 8 3.5c2.12 0 3.879 1.168 5.168 2.457A13.133 13.133 0 0 1 14.828 8c-.058.087-.122.183-.195.288-.335.48-.83 1.12-1.465 1.755C11.879 11.332 10.119 12.5 8 12.5c-2.12 0-3.879-1.168-5.168-2.457A13.134 13.134 0 0 1 1.172 8z M8 5.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5zM4.5 8a3.5 3.5 0 1 1 7 0 3.5 3.5 0 0 1-7 0z",
};

export class DarkModeButton {
    state: State;

    constructor(state: State) {
        this.state = state;
    }

    public add(): void {
        this.addButtonToFiltersDesktop();
    }

    private createSvgIcon(icon: {
        viewBox: string;
        path: string;
    }): SVGSVGElement {
        const svgElement = document.createElementNS(
            "http://www.w3.org/2000/svg",
            "svg"
        );
        svgElement.setAttribute("width", "16");
        svgElement.setAttribute("height", "16");
        svgElement.setAttribute("viewBox", icon.viewBox);
        svgElement.classList.add("bi");
        const pathElement = document.createElementNS(
            "http://www.w3.org/2000/svg",
            "path"
        );
        pathElement.setAttribute("d", icon.path);
        pathElement.setAttribute("fill", "currentColor");
        svgElement.appendChild(pathElement);

        return svgElement;
    }

    private createDarkModeButton(isProduct: boolean = true): HTMLButtonElement {
        const darkModeButton = document.createElement("button");
        const buttonClass = isProduct ? "flagger-toggle-product" : "flagger-toggle-list";

        darkModeButton.classList.add(buttonClass);
        darkModeButton.setAttribute("id", "sponsored-flagger-button");
        darkModeButton.appendChild(this.createSvgIcon(darkModeIcon));

        darkModeButton.setAttribute("type", "button");

        return darkModeButton;
    }

    private insertElement(parentElement: Node,newElement: Node,referenceElement: Node | null): void {
        parentElement.insertBefore(newElement, referenceElement);
    }

    private addButtonToFiltersDesktop(existingButton?: HTMLButtonElement): void {
        const settingsButton = document.querySelector("li.settings");
        if (settingsButton) {
            this.insertElement(
        settingsButton.parentNode as Node,
        existingButton ?? this.createDarkModeButton(true),
        settingsButton
            );
        }
    }
}
