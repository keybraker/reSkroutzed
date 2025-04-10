import { Language } from "../enums/Language.enum";

export function retrieveLanguage(): Language {
  const languageAttribute = document.documentElement.lang;

  if (languageAttribute === "el") {
    return Language.GREEK;
  } else {
    return Language.ENGLISH;
  }
}
