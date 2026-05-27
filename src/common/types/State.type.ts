import { Language } from '../enums/Language.enum';

export type State = {
  // visibility
  hideProductAds: boolean;
  hideVideoAds: boolean;
  hideSponsorships: boolean;
  hideShelfProductAds: boolean;
  hideRecommendationAds: boolean;
  hideSkoopAds: boolean;
  hideAISlop: boolean;
  // ui
  hideUniversalToggle: boolean;
  // counters
  productAdCount: number;
  shelfAdCount: number;
  skoopAdCount: number;
  recommendationAdCount: number;
  videoAdCount: number;
  sponsorshipAdCount: number;
  // config
  language: Language;
  darkMode: boolean;
  wideMode: boolean;
  // price checker
  minimumPriceDifference: number;
  // platform detection
  isMobile: boolean;
};
