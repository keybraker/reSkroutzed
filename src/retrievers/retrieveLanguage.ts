import { Language } from "../enums/Language";
import { State } from "../types/State";

export function retrieveLanguage(state: State): void {
  const languageElement = document.querySelector("a[title='language'], a[title='Γλώσσα']");

  if (languageElement && languageElement.textContent) {
    state.language = languageElement.textContent.trim() as Language;
  }
}
