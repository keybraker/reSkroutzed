import { State } from '../../common/types/State.type';
import { AdHandlerInterface } from '../../handlers/common/interfaces/adHandler.interface';

/** Feature surface required by the toggle builders for appearance toggles. */
export type WideModeController = {
  sync(): void;
  execute(): void;
  destroy(): void;
};

/** Calm-mode decorator surface required by its toggle builder. */
export type CalmModeController = WideModeController;

/**
 * Dependencies shared by every universal-toggle button factory.
 * Bundled so the button builders stay pure and testable. Dependencies are
 * declared structurally (interfaces), not as concrete classes, so tests can
 * provide lightweight stubs.
 */
export type ToggleButtonContext = {
  state: State;
  wideModeDecorator: WideModeController;
  calmModeDecorator: CalmModeController;
  videoHandler: AdHandlerInterface;
  listProductAdHandler: AdHandlerInterface;
  recommendationAdHandler: AdHandlerInterface;
  shelfProductAdHandler: AdHandlerInterface;
  sponsorshipAdHandler: AdHandlerInterface;
  skoopHandler: AdHandlerInterface;
  campaignAdHandler: AdHandlerInterface;
};
