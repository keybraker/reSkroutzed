import { Language } from "../enums/Language";

export function retrieveLanguage(language: Language): void {
  const languageElement = document.querySelector("a[title='language'], a[title='Γλώσσα']");

  if (languageElement && languageElement.textContent) {
    language = languageElement.textContent.trim() as Language;
  }
}
