import { Language } from '../enums/Language.enum';
import { PriceProvider } from '../enums/PriceProvider.enum';

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
  /** External catalogue the price checker compares the Skroutz offer against. */
  priceProvider: PriceProvider;
  // platform detection
  isMobile: boolean;
};
