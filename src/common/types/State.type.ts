import { Language } from '../enums/Language.enum';

export type State = {
  // visibility
  hideProductAds: boolean;
  hideVideoAds: boolean;
  hideSponsorships: boolean;
  hideShelfProductAds: boolean;
  hideRecommendationAds: boolean;
  hideAISlop: boolean;
  // ui
  hideUniversalToggle: boolean;
  // counters
  productAdCount: number;
  shelfAdCount: number;
  recommendationAdCount: number;
  videoAdCount: number;
  sponsorshipAdCount: number;
  // config
  language: Language;
  darkMode: boolean;
  // price checker
  minimumPriceDifference: number;
  // platform detection
  isMobile: boolean;
};
