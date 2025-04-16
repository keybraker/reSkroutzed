import { Language } from "../enums/Language.enum";
import { IStorageRetrieverAdapter } from "./IStorageRetriever";

export class LanguageStorageAdapter
  implements IStorageRetrieverAdapter<Language>
{
  public getValue(): Language {
    const languageAttribute = document.documentElement.lang;

    if (languageAttribute === "el") {
      return Language.GREEK;
    } else {
      return Language.ENGLISH;
    }
  }
}
