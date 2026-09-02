import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { BrowserClient } from '../../../src/clients/browser/client';
import { Language } from '../../../src/common/enums/Language.enum';
import { State } from '../../../src/common/types/State.type';
import { createDarkModeToggleButton } from '../../../src/features/functions/createDarkModeToggleButton';
import { ToggleButtonContext } from '../../../src/features/functions/toggleButtonContext';

vi.mock('../../../src/clients/browser/client', () => ({
  BrowserClient: {
    setValue: vi.fn(),
    getValueAsync: vi.fn(),
    detectMobile: vi.fn(),
  },
  StorageKey: {
    DARK_MODE: 'RESKROUTZED-dark-mode',
  },
}));

describe('createDarkModeToggleButton', () => {
  let ctx: ToggleButtonContext;
  let mockState: State;

  const buildContext = (state: State): ToggleButtonContext => ({
    state,
    wideModeDecorator: {
      sync: vi.fn(),
      execute: vi.fn(),
      destroy: vi.fn(),
    },
    // The dark-mode factory only touches `state`, so handlers can be stubs.
    videoHandler: { flag: vi.fn(), visibilityUpdate: vi.fn() },
    listProductAdHandler: { flag: vi.fn(), visibilityUpdate: vi.fn() },
    recommendationAdHandler: { flag: vi.fn(), visibilityUpdate: vi.fn() },
    shelfProductAdHandler: { flag: vi.fn(), visibilityUpdate: vi.fn() },
    sponsorshipAdHandler: { flag: vi.fn(), visibilityUpdate: vi.fn() },
    skoopHandler: { flag: vi.fn(), visibilityUpdate: vi.fn() },
    campaignAdHandler: { flag: vi.fn(), visibilityUpdate: vi.fn() },
  });

  beforeEach(() => {
    vi.clearAllMocks();

    mockState = {
      hideProductAds: false,
      hideVideoAds: false,
      hideSponsorships: false,
      hideShelfProductAds: false,
      hideRecommendationAds: false,
      hideSkoopAds: false,
      hideAISlop: false,
      hideUniversalToggle: false,
      productAdCount: 0,
      shelfAdCount: 0,
      recommendationAdCount: 0,
      skoopAdCount: 0,
      videoAdCount: 0,
      sponsorshipAdCount: 0,
      language: Language.ENGLISH,
      darkMode: false,
      wideMode: false,
      minimumPriceDifference: 0,
      isMobile: false,
    };

    document.body.innerHTML = '<div id="root"></div>';
    ctx = buildContext(mockState);
  });

  afterEach(() => {
    document.body.innerHTML = '';
    vi.restoreAllMocks();
  });

  it('should create a button with the dark-mode-option class and moon icon', () => {
    const button = createDarkModeToggleButton(ctx);

    expect(button.classList.contains('toggle-option-button')).toBe(true);
    expect(button.classList.contains('dark-mode-option')).toBe(true);
    const hasSvg = Array.from(button.children).some(
      (child) => child.namespaceURI === 'http://www.w3.org/2000/svg',
    );
    expect(hasSvg).toBe(true);
  });

  it('should start inactive when dark mode is off and activate on click', () => {
    const button = createDarkModeToggleButton(ctx);

    expect(button.classList.contains('active')).toBe(false);

    button.click();

    expect(mockState.darkMode).toBe(true);
    expect(BrowserClient.setValue).toHaveBeenCalledWith('RESKROUTZED-dark-mode', true);
    expect(button.classList.contains('active')).toBe(true);
    expect(button.title).toBe('Switch to Light Mode');
  });

  it('should start active when dark mode is on and deactivate on click', () => {
    mockState.darkMode = true;
    const button = createDarkModeToggleButton(ctx);

    expect(button.classList.contains('active')).toBe(true);

    button.click();

    expect(mockState.darkMode).toBe(false);
    expect(BrowserClient.setValue).toHaveBeenCalledWith('RESKROUTZED-dark-mode', false);
    expect(button.classList.contains('active')).toBe(false);
    expect(button.title).toBe('Switch to Dark Mode');
  });
});
