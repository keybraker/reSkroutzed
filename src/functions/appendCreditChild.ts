import { appendLogoChild } from "./appendLogoChild";

export function appendCreditChild(element: HTMLDivElement | HTMLButtonElement) {
  const brand = document.createElement("div");
  const brandLink = document.createElement("a");

  brand.classList.add("icon-border", "font-bold");

  brandLink.href = "https://paypal.me/tsiakkas";
  brandLink.textContent = "by reSkroutzed";
  brandLink.classList.add("icon-border", "font-bold");

  brand.appendChild(brandLink);
  appendLogoChild(brand);

  element.appendChild(brand);
}
