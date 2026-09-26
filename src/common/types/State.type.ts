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
  priceCheckerEnabled: boolean;
  /** Minimum total-price difference, in euros, before the checker calls out a deal. */
  minimumPriceDifference: number;
  /** Also compare against Shopflix when checking prices (Greece only). */
  showShopflix: boolean;
  // platform detection
  isMobile: boolean;
};
