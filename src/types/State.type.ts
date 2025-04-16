import { Language } from "../enums/Language.enum";

export type State = {
  // visibility
  hideProductAds: boolean;
  hideVideoAds: boolean;
  hideSponsorships: boolean;
  // counters
  productAdCount: number;
  ShelfAdCount: number;
  videoAdCount: number;
  // config
  language: Language;
  darkMode: boolean;
};
