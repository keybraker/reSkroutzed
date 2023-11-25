import { Language } from "../enums/Language";

export function retrieveLanguage(): Language {
    const languageElement = document.querySelector("a[title='language'], a[title='Language'], a[title='γλώσσα'], a[title='Γλώσσα']");
    return languageElement?.textContent ? languageElement.textContent.trim() as Language : Language.EN;
}