import { State } from '../../common/types/State.type';
import { CampaignAdHandler } from '../../handlers/Campaign.handler';
import { ListProductAdHandler } from '../../handlers/ListProductAd.handler';
import { RecommendationAdHandler } from '../../handlers/RecommendationAd.handler';
import { ShelfProductAdHandler } from '../../handlers/ShelfProductAd.handler';
import { SkoopHandler } from '../../handlers/Skoop.handler';
import { SponsorshipAdHandler } from '../../handlers/SponsorshipAd.handler';
import { VideoAdHandler } from '../../handlers/VideoAd.handler';
import { WideModeDecorator } from '../WideMode.decorator';

/**
 * Dependencies shared by every universal-toggle button factory.
 * Bundled so the button builders stay pure and testable.
 */
export type ToggleButtonContext = {
  state: State;
  wideModeDecorator: WideModeDecorator;
  videoHandler: VideoAdHandler;
  listProductAdHandler: ListProductAdHandler;
  recommendationAdHandler: RecommendationAdHandler;
  shelfProductAdHandler: ShelfProductAdHandler;
  sponsorshipAdHandler: SponsorshipAdHandler;
  skoopHandler: SkoopHandler;
  campaignAdHandler: CampaignAdHandler;
};
