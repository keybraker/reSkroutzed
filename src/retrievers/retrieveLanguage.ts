import { Language } from "../enums/Language";

export function retrieveLanguage(): Language {
  const languageElement = document.querySelector("a[title='language'], a[title='Γλώσσα']");

  if (languageElement && languageElement.textContent) {
    return languageElement.textContent.trim() as Language;
  }

  return Language.EN;
}