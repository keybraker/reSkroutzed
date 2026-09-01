import { BrowserClient, StorageKey } from '../clients/browser/client';
import { DomClient } from '../clients/dom/client';
import { Language } from '../common/enums/Language.enum';
import { getConditionalTranslation } from '../common/functions/translations';
import { State } from '../common/types/State.type';
import { CampaignAdHandler } from '../handlers/Campaign.handler';
import { ListProductAdHandler } from '../handlers/ListProductAd.handler';
import { RecommendationAdHandler } from '../handlers/RecommendationAd.handler';
import { ShelfProductAdHandler } from '../handlers/ShelfProductAd.handler';
import { SkoopHandler } from '../handlers/Skoop.handler';
import { SponsorshipAdHandler } from '../handlers/SponsorshipAd.handler';
import { VideoAdHandler } from '../handlers/VideoAd.handler';
import { FeatureInstance } from './common/FeatureInstance';
import { createAdToggleButton } from './functions/createAdToggleButton';
import { createAISlopToggleButton } from './functions/createAISlopToggleButton';
import { createDarkModeToggleButton } from './functions/createDarkModeToggleButton';
import { createLogoElement } from './functions/createLogoElement';
import { createPriceDifferenceOption } from './functions/createPriceDifferenceOption';
import { createRecommendationAdToggleButton } from './functions/createRecommendationAdToggleButton';
import { createShelfProductAdToggleButton } from './functions/createShelfProductAdToggleButton';
import { createSkoopToggleButton } from './functions/createSkoopToggleButton';
import { createSponsorshipToggleButton } from './functions/createSponsorshipToggleButton';
import { createVideoToggleButton } from './functions/createVideoToggleButton';
import { createWideModeToggleButton } from './functions/createWideModeToggleButton';
import { ToggleButtonContext } from './functions/toggleButtonContext';
import { WideModeDecorator } from './WideMode.decorator';

export class UniversalToggleDecorator implements FeatureInstance {
  private isMenuOpen: boolean = false;
  private state: State;

  private readonly videoHandler: VideoAdHandler;
  private readonly listProductAdHandler: ListProductAdHandler;
  private readonly recommendationAdHandler: RecommendationAdHandler;
  private readonly shelfProductAdHandler: ShelfProductAdHandler;
  private readonly sponsorshipAdHandler: SponsorshipAdHandler;
  private readonly skoopHandler: SkoopHandler;
  private readonly campaignAdHandler: CampaignAdHandler;
  private readonly wideModeDecorator: WideModeDecorator;

  constructor(state: State) {
    this.state = state;

    this.videoHandler = new VideoAdHandler(this.state);
    this.listProductAdHandler = new ListProductAdHandler(this.state);
    this.recommendationAdHandler = new RecommendationAdHandler(this.state);
    this.shelfProductAdHandler = new ShelfProductAdHandler(this.state);
    this.sponsorshipAdHandler = new SponsorshipAdHandler(this.state);
    this.skoopHandler = new SkoopHandler(this.state);
    this.campaignAdHandler = new CampaignAdHandler(this.state);
    this.wideModeDecorator = new WideModeDecorator(this.state);
  }

  private get toggleContext(): ToggleButtonContext {
    return {
      state: this.state,
      wideModeDecorator: this.wideModeDecorator,
      videoHandler: this.videoHandler,
      listProductAdHandler: this.listProductAdHandler,
      recommendationAdHandler: this.recommendationAdHandler,
      shelfProductAdHandler: this.shelfProductAdHandler,
      sponsorshipAdHandler: this.sponsorshipAdHandler,
      skoopHandler: this.skoopHandler,
      campaignAdHandler: this.campaignAdHandler,
    };
  }

  public execute(): void {
    if (this.state.hideUniversalToggle) {
      return;
    }
    const container = document.createElement('div');
    container.classList.add('universal-toggle-container');

    const mainToggle = document.createElement('button');
    mainToggle.classList.add('universal-toggle-button');
    mainToggle.title = 'ReSkroutzed Options';

    const reskroutzedLogo = createLogoElement();
    DomClient.appendElementToElement(reskroutzedLogo, mainToggle);

    const buttonsContainer = document.createElement('div');
    buttonsContainer.classList.add('toggle-buttons-container');

    const ctx = this.toggleContext;
    const priceDifferenceButton = createPriceDifferenceOption(ctx);
    const darkModeButton = createDarkModeToggleButton(ctx);
    const wideModeButton = createWideModeToggleButton(ctx);
    const adToggleButton = createAdToggleButton(ctx);
    const videoToggleButton = createVideoToggleButton(ctx);
    const sponsorshipToggleButton = createSponsorshipToggleButton(ctx);
    const shelfProductAdToggleButton = createShelfProductAdToggleButton(ctx);
    const recommendationAdToggleButton = createRecommendationAdToggleButton(ctx);
    const skoopToggleButton = createSkoopToggleButton(ctx);
    const aiSlopToggleButton = createAISlopToggleButton(ctx);

    DomClient.appendElementToElement(priceDifferenceButton, buttonsContainer);
    DomClient.appendElementToElement(darkModeButton, buttonsContainer);
    DomClient.appendElementToElement(wideModeButton, buttonsContainer);
    DomClient.appendElementToElement(adToggleButton, buttonsContainer);
    DomClient.appendElementToElement(videoToggleButton, buttonsContainer);
    DomClient.appendElementToElement(sponsorshipToggleButton, buttonsContainer);
    DomClient.appendElementToElement(shelfProductAdToggleButton, buttonsContainer);
    DomClient.appendElementToElement(recommendationAdToggleButton, buttonsContainer);
    DomClient.appendElementToElement(skoopToggleButton, buttonsContainer);
    DomClient.appendElementToElement(aiSlopToggleButton, buttonsContainer);

    mainToggle.addEventListener('click', () => this.toggleMenu(container));

    document.addEventListener('click', (event) => {
      if (this.isMenuOpen && !container.contains(event.target as Node)) {
        this.closeMenu(container);
      }
    });

    DomClient.appendElementToElement(buttonsContainer, container);
    DomClient.appendElementToElement(mainToggle, container);

    DomClient.appendElementToElement(container, DomClient.getDom().body);
  }

  private toggleMenu(container: HTMLElement): void {
    if (this.isMenuOpen) {
      this.closeMenu(container);
    } else {
      this.refreshSettingsFromStorage().then(() => {
        this.openMenu(container);
      });
    }
  }

  /**
   * Refresh all settings from storage to ensure we have the latest values
   */
  private async refreshSettingsFromStorage(): Promise<void> {
    this.state.darkMode = (await BrowserClient.getValueAsync(StorageKey.DARK_MODE)) as boolean;
    this.state.hideProductAds = (await BrowserClient.getValueAsync(
      StorageKey.PRODUCT_AD_VISIBILITY,
    )) as boolean;
    this.state.hideVideoAds = (await BrowserClient.getValueAsync(
      StorageKey.VIDEO_AD_VISIBILITY,
    )) as boolean;
    this.state.hideShelfProductAds = (await BrowserClient.getValueAsync(
      StorageKey.SHELF_PRODUCT_AD_VISIBILITY,
    )) as boolean;
    this.state.hideRecommendationAds = (await BrowserClient.getValueAsync(
      StorageKey.RECOMMENDATION_AD_VISIBILITY,
    )) as boolean;
    this.state.hideSkoopAds = (await BrowserClient.getValueAsync(
      StorageKey.SKOOP_AD_VISIBILITY,
    )) as boolean;
    this.state.hideSponsorships = (await BrowserClient.getValueAsync(
      StorageKey.SPONSORSHIP_VISIBILITY,
    )) as boolean;
    this.state.hideAISlop = (await BrowserClient.getValueAsync(
      StorageKey.AI_SLOP_VISIBILITY,
    )) as boolean;
    this.state.wideMode = (await BrowserClient.getValueAsync(StorageKey.WIDE_MODE)) as boolean;
    this.state.minimumPriceDifference = (await BrowserClient.getValueAsync(
      StorageKey.MINIMUM_PRICE_DIFFERENCE,
    )) as number;

    this.updateUIFromState();
  }

  /**
   * Update UI elements to match the current state
   */
  private updateUIFromState(): void {
    const container = document.querySelector('.universal-toggle-container');
    if (!container) return;

    const darkModeButton = container.querySelector('.dark-mode-option') as HTMLButtonElement;
    if (darkModeButton) {
      darkModeButton.classList.toggle('active', this.state.darkMode);
      darkModeButton.title = getConditionalTranslation(
        this.state.language,
        this.state.darkMode,
        'darkModeOn',
        'darkModeOff',
      );
    }

    const wideModeButton = container.querySelector('.wide-mode-option') as HTMLButtonElement;
    if (wideModeButton) {
      wideModeButton.classList.toggle('active', this.state.wideMode);
      wideModeButton.title = this.state.wideMode ? 'Disable Wide Mode' : 'Enable Wide Mode';
    }

    const adToggleButton = container.querySelector('.ad-toggle-option') as HTMLButtonElement;
    if (adToggleButton) {
      adToggleButton.classList.toggle('active', !this.state.hideProductAds);
      adToggleButton.title = getConditionalTranslation(
        this.state.language,
        this.state.hideProductAds,
        'adHide',
        'adShow',
      );
    }

    const videoToggleButton = container.querySelector('.video-toggle-option') as HTMLButtonElement;
    if (videoToggleButton) {
      videoToggleButton.classList.toggle('active', !this.state.hideVideoAds);
      videoToggleButton.title = getConditionalTranslation(
        this.state.language,
        this.state.hideVideoAds,
        'videoHide',
        'videoShow',
      );
    }

    const sponsorshipToggleButton = container.querySelector(
      '.sponsorship-toggle-option',
    ) as HTMLButtonElement;
    if (sponsorshipToggleButton) {
      sponsorshipToggleButton.classList.toggle('active', !this.state.hideSponsorships);
      sponsorshipToggleButton.title = getConditionalTranslation(
        this.state.language,
        this.state.hideSponsorships,
        'sponsorshipHide',
        'sponsorshipShow',
      );
    }

    const shelfToggleButton = container.querySelector(
      '.shelf-ad-toggle-option',
    ) as HTMLButtonElement;
    if (shelfToggleButton) {
      shelfToggleButton.classList.toggle('active', !this.state.hideShelfProductAds);
      shelfToggleButton.title = getConditionalTranslation(
        this.state.language,
        this.state.hideShelfProductAds,
        'shelfAdHide',
        'shelfAdShow',
      );
    }

    const recommendationToggleButton = container.querySelector(
      '.recommendation-ad-toggle-option',
    ) as HTMLButtonElement;
    if (recommendationToggleButton) {
      recommendationToggleButton.classList.toggle('active', !this.state.hideRecommendationAds);
      recommendationToggleButton.title = getConditionalTranslation(
        this.state.language,
        this.state.hideRecommendationAds,
        'recommendationAdHide',
        'recommendationAdShow',
      );
    }

    const skoopToggleButton = container.querySelector('.skoop-toggle-option') as HTMLButtonElement;
    if (skoopToggleButton) {
      skoopToggleButton.classList.toggle('active', !this.state.hideSkoopAds);
      skoopToggleButton.title = getConditionalTranslation(
        this.state.language,
        this.state.hideSkoopAds,
        'skoopHide',
        'skoopShow',
      );
    }

    const aiSlopToggleButton = container.querySelector(
      '.ai-slop-toggle-option',
    ) as HTMLButtonElement;
    if (aiSlopToggleButton) {
      // Active (orange) when hiding AI slop; inactive (black) by default when showing
      aiSlopToggleButton.classList.toggle('active', this.state.hideAISlop);
      aiSlopToggleButton.title = getConditionalTranslation(
        this.state.language,
        this.state.hideAISlop,
        'aiSlopHide',
        'aiSlopShow',
      );
    }

    const priceDifferenceButton = container.querySelector(
      '.price-difference-option',
    ) as HTMLButtonElement;
    if (priceDifferenceButton) {
      priceDifferenceButton.setAttribute(
        'data-value',
        this.state.minimumPriceDifference.toString(),
      );

      const updatedTitle =
        this.state.language === Language.GREEK
          ? `Ελάχιστη ποσοστιαία διαφορά: ${this.state.minimumPriceDifference}%`
          : `Minimum Percentage Difference: ${this.state.minimumPriceDifference}%`;
      priceDifferenceButton.title = updatedTitle;

      const valueText = priceDifferenceButton.querySelector('.price-value-mobile');
      if (valueText) {
        valueText.textContent = this.state.minimumPriceDifference.toString();
      } else {
        const valueDisplay = priceDifferenceButton.querySelector('span');
        if (valueDisplay) {
          valueDisplay.textContent = this.state.minimumPriceDifference.toString();
        }
      }

      const mobileSymbol = priceDifferenceButton.querySelector(
        '.price-currency-symbol-mobile',
      ) as HTMLElement | null;
      if (mobileSymbol) mobileSymbol.textContent = '%';
      const desktopSymbol = priceDifferenceButton.querySelector(
        '.price-currency-symbol',
      ) as HTMLElement | null;
      if (desktopSymbol) desktopSymbol.textContent = '%';
    }
  }

  private openMenu(container: HTMLElement): void {
    container.classList.add('menu-open');
    this.isMenuOpen = true;

    const buttons = container.querySelectorAll('.toggle-option-button');
    buttons.forEach((button, index) => {
      setTimeout(() => {
        button.classList.add('button-active');
      }, 80 * index);
    });
  }

  private closeMenu(container: HTMLElement): void {
    this.isMenuOpen = false;

    const buttons = container.querySelectorAll('.toggle-option-button');
    buttons.forEach((button, index) => {
      setTimeout(() => {
        button.classList.remove('button-active');
      }, 50 * index);
    });

    setTimeout(
      (): void => {
        container.classList.remove('menu-open');
      },
      50 * buttons.length + 100,
    );
  }
}
