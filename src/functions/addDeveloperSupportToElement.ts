import { Language } from "../enums/Language.enum";
import { appendLogoChild } from "./appendLogoChild";

export function addDeveloperSupportToElement(
  element: HTMLDivElement | HTMLButtonElement,
  language: Language
) {
  const brand = document.createElement("div");
  const brandLink = document.createElement("a");

  brand.classList.add("icon-border", "font-bold");

  brandLink.href = "https://paypal.me/tsiakkas";
  brandLink.target = "_blank"; // Open in new tab
  brandLink.rel = "noopener noreferrer"; // Security best practice for external links
  if (language === Language.GREEK) {
    brandLink.textContent = "υποστηρίξτε τον προγραμματιστή";
  } else {
    brandLink.textContent = "support the developer";
  }
  brandLink.classList.add("icon-border", "font-bold");

  brand.appendChild(brandLink);
  appendLogoChild(brand);

  element.appendChild(brand);
}
