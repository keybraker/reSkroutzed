import { State } from '../../common/types/State.type';
import { AdHandlerInterface } from '../../handlers/common/interfaces/adHandler.interface';

/** Wide-mode surface required by the toggle builders. */
export type WideModeController = {
  sync(): void;
  execute(): void;
  destroy(): void;
};

/**
 * Dependencies shared by every universal-toggle button factory.
 * Bundled so the button builders stay pure and testable. Dependencies are
 * declared structurally (interfaces), not as concrete classes, so tests can
 * provide lightweight stubs.
 */
export type ToggleButtonContext = {
  state: State;
  wideModeDecorator: WideModeController;
  videoHandler: AdHandlerInterface;
  listProductAdHandler: AdHandlerInterface;
  recommendationAdHandler: AdHandlerInterface;
  shelfProductAdHandler: AdHandlerInterface;
  sponsorshipAdHandler: AdHandlerInterface;
  skoopHandler: AdHandlerInterface;
  campaignAdHandler: AdHandlerInterface;
};
