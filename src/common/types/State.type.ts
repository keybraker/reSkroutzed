import { Language } from '../enums/Language.enum';

export type State = {
  // visibility
  hideProductAds: boolean;
  hideVideoAds: boolean;
  hideSponsorships: boolean;
  hideShelfProductAds: boolean; // New property for shelf product ads
  // counters
  productAdCount: number;
  ShelfAdCount: number;
  videoAdCount: number;
  sponsorshipAdCount: number;
  // config
  language: Language;
  darkMode: boolean;
  // price checker
  minimumPriceDifference: number;
};
