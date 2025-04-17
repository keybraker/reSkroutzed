import { Language } from "../enums/Language.enum";
import { IStorageRetrieverAdapter } from "./interfaces/IStorageRetriever.adapter";

export class LanguageStorageAdapter
  implements IStorageRetrieverAdapter<Language>
{
  public getValue(): Language {
    const languageAttribute = document.documentElement.lang;

    if (languageAttribute === "el") {
      return Language.GREEK;
    } else if (languageAttribute === "ro") {
      return Language.ROMANIAN;
    } else if (languageAttribute === "bg") {
      return Language.BULGARIAN;
    } else if (languageAttribute === "de") {
      return Language.GERMAN;
    } else if (languageAttribute === "en") {
      return Language.ENGLISH;
    }

    return Language.ENGLISH;
  }
}
