import { Language } from "../enums/Language.enum";

export function correctFinalPriceDecorator(language: Language) {
  const finalPriceLabel = document.querySelector("label.toggle-switch-label");

  if (!finalPriceLabel) {
    return;
  }

  finalPriceLabel.textContent +=
    language === Language.ENGLISH
      ? " (with cash on delivery)"
      : " (με αντικαταβολή)";
}
