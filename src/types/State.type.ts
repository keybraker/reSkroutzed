import { Language } from "../enums/Language.enum";

export type State = {
  visible: boolean;
  language: Language;
  sponsoredCount: number;
  sponsoredShelfCount: number;
  videoCount: number;
  darkMode: boolean;
};
