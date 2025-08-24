import { Language } from '../enums/Language.enum';

export type State = {
  // visibility
  hideProductAds: boolean;
  hideVideoAds: boolean;
  hideSponsorships: boolean;
  hideShelfProductAds: boolean; // New property for shelf product ads
  hideAISlop?: boolean;
  // ui
  hideUniversalToggle?: boolean;
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
  // platform detection
  isMobile?: boolean;
};
