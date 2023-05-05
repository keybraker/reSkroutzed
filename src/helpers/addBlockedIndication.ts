import { State } from "../types/State";
import { sponsoredText } from "./sponsoredUtil";
import { toggleSponsoredContentVisibility } from "./toggleSponsoredContentVisibility";

const icons = {
  eyeOpenIcon: {
    viewBox: "0 0 16 16",
    path: "M16 8s-3-5.5-8-5.5S0 8 0 8s3 5.5 8 5.5S16 8 16 8zM1.173 8a13.133 13.133 0 0 1 1.66-2.043C4.12 4.668 5.88 3.5 8 3.5c2.12 0 3.879 1.168 5.168 2.457A13.133 13.133 0 0 1 14.828 8c-.058.087-.122.183-.195.288-.335.48-.83 1.12-1.465 1.755C11.879 11.332 10.119 12.5 8 12.5c-2.12 0-3.879-1.168-5.168-2.457A13.134 13.134 0 0 1 1.172 8z M8 5.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5zM4.5 8a3.5 3.5 0 1 1 7 0 3.5 3.5 0 0 1-7 0z",
  },
  eyeSlashedIcon: {
    viewBox: "0 0 16 16",
    path: "M13.359 11.238C15.06 9.72 16 8 16 8s-3-5.5-8-5.5a7.028 7.028 0 0 0-2.79.588l.77.771A5.944 5.944 0 0 1 8 3.5c2.12 0 3.879 1.168 5.168 2.457A13.134 13.134 0 0 1 14.828 8c-.058.087-.122.183-.195.288-.335.48-.83 1.12-1.465 1.755-.165.165-.337.328-.517.486l.708.709z M11.297 9.176a3.5 3.5 0 0 0-4.474-4.474l.823.823a2.5 2.5 0 0 1 2.829 2.829l.822.822zm-2.943 1.299.822.822a3.5 3.5 0 0 1-4.474-4.474l.823.823a2.5 2.5 0 0 0 2.829 2.829z M3.35 5.47c-.18.16-.353.322-.518.487A13.134 13.134 0 0 0 1.172 8l.195.288c.335.48.83 1.12 1.465 1.755C4.121 11.332 5.881 12.5 8 12.5c.716 0 1.39-.133 2.02-.36l.77.772A7.029 7.029 0 0 1 8 13.5C3 13.5 0 8 0 8s.939-1.721 2.641-3.238l.708.709zm10.296 8.884-12-12 .708-.708 12 12-.708.708z",
  },
} as IconSet;

export function addBlockedIndication(state: State): void {
  const existingBlockIndicationButton = document.getElementById(
    "sponsored-flagger-button"
  ) as HTMLButtonElement | null;

  if (existingBlockIndicationButton) {
    updateDisplayText(existingBlockIndicationButton, false, state);
    return;
  }

  addButtonToFilters(state);
  addButtonToOrderOptions(state);
}

function createSvgIcon(icon: { viewBox: string; path: string }): SVGSVGElement {
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

function updateDisplayText(
  sponsoredButtonToggle: HTMLElement,
  isProduct: boolean = true,
  state: State
): void {
  const activeButtonClass = isProduct
    ? "flagger-toggle-product-active"
    : "flagger-toggle-list-active";

  const text = sponsoredText(true, state.language);
  const icon = state.visible ? icons.eyeOpenIcon : icons.eyeSlashedIcon;

  state.visible
    ? sponsoredButtonToggle.classList.remove(activeButtonClass)
    : sponsoredButtonToggle.classList.add(activeButtonClass);

  sponsoredButtonToggle.textContent = "";
  sponsoredButtonToggle.appendChild(createSvgIcon(icon));

  const gap = document.createElement("span");
  gap.style.marginRight = "6px";
  sponsoredButtonToggle.appendChild(gap);

  const countSpan = document.createElement("span");
  countSpan.textContent = `${text} (${state.sponsoredCount})`;
  sponsoredButtonToggle.appendChild(countSpan);
}

function createSponsoredIndicatorButton(
  isProduct: boolean = true,
  state: State
): HTMLButtonElement {
  const sponsoredButtonToggle = document.createElement("button");
  const buttonClass = isProduct
    ? "flagger-toggle-product"
    : "flagger-toggle-list";

  sponsoredButtonToggle.classList.add(buttonClass);
  sponsoredButtonToggle.setAttribute("id", "sponsored-flagger-button");

  updateDisplayText(sponsoredButtonToggle, isProduct, state);

  sponsoredButtonToggle.addEventListener("click", () => {
    state.visible = !state.visible;
    localStorage.setItem("ssf-sponsored-visibility", `${state.visible}`);
    updateDisplayText(sponsoredButtonToggle, isProduct, state);
    toggleSponsoredContentVisibility(state);
  });

  sponsoredButtonToggle.setAttribute("type", "button");

  return sponsoredButtonToggle;
}

function insertElement(
  parentElement: Node,
  newElement: Node,
  referenceElement: Node | null
): void {
  parentElement.insertBefore(newElement, referenceElement);
}

function addButtonToFilters(
  state: State,
  existingButton?: HTMLButtonElement
): void {
  const liOfferElements = document.querySelector("li.sku-offers");
  if (liOfferElements) {
    insertElement(
      liOfferElements.parentNode as Node,
      existingButton ?? createSponsoredIndicatorButton(true, state),
      liOfferElements
    );
  }
}

function addButtonToOrderOptions(
  state: State,
  existingButton?: HTMLButtonElement
): void {
  const orderOptionsDiv = document.getElementById("order-options");
  if (orderOptionsDiv) {
    insertElement(
      orderOptionsDiv.parentNode as Node,
      existingButton ?? createSponsoredIndicatorButton(false, state),
      orderOptionsDiv.nextSibling
    );
  }
}
