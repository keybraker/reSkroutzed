import { BrowserClient, StorageKey } from '../clients/browser/client';
import { DomClient } from '../clients/dom/client';
import { Language } from '../common/enums/Language.enum';
import { getConditionalTranslation, getTranslation } from '../common/functions/translations';
import { State } from '../common/types/State.type';
import { CampaignAdHandler } from '../handlers/Campaign.handler';
import { ListProductAdHandler } from '../handlers/ListProductAd.handler';
import { RecommendationAdHandler } from '../handlers/RecommendationAd.handler';
import { ShelfProductAdHandler } from '../handlers/ShelfProductAd.handler';
import { SkoopHandler } from '../handlers/Skoop.handler';
import { SponsorshipAdHandler } from '../handlers/SponsorshipAd.handler';
import { VideoAdHandler } from '../handlers/VideoAd.handler';
import { FeatureInstance } from './common/FeatureInstance';
import { createLogoElement } from './functions/createLogoElement';
import { buildSvg, ICON } from './functions/icons';
import { themeSync } from './functions/themeSync';
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

    const priceDifferenceButton = this.createPriceDifferenceOption();
    const darkModeButton = this.createDarkModeToggleButton();
    const wideModeButton = this.createWideModeToggleButton();
    const adToggleButton = this.createAdToggleButton();
    const videoToggleButton = this.createVideoToggleButton();
    const sponsorshipToggleButton = this.createSponsorshipToggleButton();
    const shelfProductAdToggleButton = this.createShelfProductAdToggleButton();
    const recommendationAdToggleButton = this.createRecommendationAdToggleButton();
    const skoopToggleButton = this.createSkoopToggleButton();
    const aiSlopToggleButton = this.createAISlopToggleButton();

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
        this.state.hideRecommendationAds ?? false,
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
      aiSlopToggleButton.classList.toggle('active', this.state.hideAISlop || false);
      aiSlopToggleButton.title = getConditionalTranslation(
        this.state.language,
        this.state.hideAISlop || false,
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

  private createPriceDifferenceOption(): HTMLButtonElement {
    const button = document.createElement('button');
    button.classList.add('toggle-option-button', 'price-difference-option');

    const titleText =
      this.state.language === Language.GREEK
        ? `Ελάχιστη ποσοστιαία διαφορά: ${this.state.minimumPriceDifference}%`
        : `Minimum Percentage Difference: ${this.state.minimumPriceDifference}%`;
    button.title = titleText;

    button.setAttribute('data-value', this.state.minimumPriceDifference.toString());

    let isMobile = false;
    try {
      isMobile = BrowserClient.detectMobile();
    } catch (error) {
      console.warn('Failed to detect mobile status:', error);
    }

    if (isMobile) {
      const mobileContainer = document.createElement('div');
      mobileContainer.classList.add('price-difference-mobile-container');
      mobileContainer.style.display = 'flex';
      mobileContainer.style.alignItems = 'center';
      mobileContainer.style.justifyContent = 'center';
      mobileContainer.style.width = '100%';
      mobileContainer.style.height = '100%';

      const valueText = document.createElement('span');
      valueText.classList.add('price-value-mobile');
      valueText.textContent = this.state.minimumPriceDifference.toString();
      valueText.style.fontSize = '14px';
      valueText.style.fontWeight = 'bold';
      DomClient.appendElementToElement(valueText, mobileContainer);

      const percentSymbol = document.createElement('span');
      percentSymbol.classList.add('price-currency-symbol-mobile');
      percentSymbol.textContent = '%';
      percentSymbol.style.marginLeft = '2px';
      percentSymbol.style.fontSize = '14px';
      percentSymbol.style.fontWeight = 'bold';
      DomClient.appendElementToElement(percentSymbol, mobileContainer);

      DomClient.appendElementToElement(mobileContainer, button);
    } else {
      const flexContainer = document.createElement('div');
      flexContainer.classList.add('price-difference-container');
      flexContainer.style.display = 'flex';
      flexContainer.style.alignItems = 'center';
      flexContainer.style.justifyContent = 'center';
      flexContainer.style.width = '100%';
      flexContainer.style.height = '100%';

      const valueDisplay = document.createElement('span');
      valueDisplay.classList.add('price-value-display');
      valueDisplay.textContent = this.state.minimumPriceDifference.toString();
      DomClient.appendElementToElement(valueDisplay, flexContainer);

      const percentSymbol = document.createElement('span');
      percentSymbol.classList.add('price-currency-symbol');
      percentSymbol.textContent = '%';
      percentSymbol.style.marginLeft = '2px';
      DomClient.appendElementToElement(percentSymbol, flexContainer);

      DomClient.appendElementToElement(flexContainer, button);
    }

    button.addEventListener('click', (e) => {
      e.stopPropagation();

      if (isMobile) {
        const inputValue = prompt(
          getTranslation(this.state.language, 'minimumPriceDifferencePrompt'),
          this.state.minimumPriceDifference.toString(),
        );

        if (inputValue !== null) {
          const newValue = parseFloat(inputValue);
          if (!isNaN(newValue) && newValue >= 0) {
            this.updatePriceDifferenceValue(newValue, button);
          }
        }
      } else {
        const container = button.querySelector('.price-difference-container');
        if (!container) return;

        const valueDisplay = container.querySelector('.price-value-display') as HTMLElement;
        const percentSymbol = container.querySelector('.price-currency-symbol') as HTMLElement;
        if (valueDisplay && percentSymbol) {
          valueDisplay.style.display = 'none';
          percentSymbol.style.display = 'none';
        }

        const input = document.createElement('input');
        input.type = 'number';
        input.min = '0';
        input.step = '0.1';
        input.value = this.state.minimumPriceDifference.toString();
        input.classList.add('price-inline-input');
        input.style.width = '70%';
        input.style.height = '60%';
        input.style.textAlign = 'center';
        input.style.padding = '0px';
        input.style.border = '1px solid white';
        input.style.borderRadius = '2px';
        input.style.background = 'rgba(255, 255, 255, 0.2)';
        input.style.color = 'white';
        input.style.font = 'inherit';
        input.style.fontSize = '16px';
        input.style.fontWeight = 'bold';

        DomClient.appendElementToElement(input, container);
        input.focus();
        input.select();

        const saveValue = (): void => {
          const newValue = parseFloat(input.value);
          if (!isNaN(newValue) && newValue >= 0) {
            this.updatePriceDifferenceValue(newValue, button);
          }

          if (valueDisplay && percentSymbol) {
            valueDisplay.style.display = '';
            percentSymbol.style.display = '';
          }

          if (input.parentNode) {
            input.parentNode.removeChild(input);
          }
        };

        input.addEventListener('blur', saveValue);

        input.addEventListener('keyup', (event) => {
          if (event.key === 'Enter') {
            saveValue();
          } else if (event.key === 'Escape') {
            if (valueDisplay && percentSymbol) {
              valueDisplay.style.display = '';
              percentSymbol.style.display = '';
            }
            if (input.parentNode) {
              input.parentNode.removeChild(input);
            }
          }
        });
      }
    });

    return button;
  }

  /**
   * Updates the price difference value in the state and UI
   */
  private updatePriceDifferenceValue(newValue: number, button?: HTMLButtonElement): void {
    this.state.minimumPriceDifference = newValue;

    if (button) {
      button.setAttribute('data-value', newValue.toString());

      const updatedTitle =
        this.state.language === Language.GREEK
          ? `Ελάχιστη ποσοστιαία διαφορά: ${newValue}%`
          : `Minimum Percentage Difference: ${newValue}%`;
      button.title = updatedTitle;

      const valueText = button.querySelector('.price-value-mobile');
      if (valueText) {
        valueText.textContent = newValue.toString();
      } else {
        const valueDisplay = button.querySelector('span');
        if (valueDisplay) {
          valueDisplay.textContent = newValue.toString();
        }
      }

      // Ensure symbols are % after update
      const mobileSymbol = button.querySelector(
        '.price-currency-symbol-mobile',
      ) as HTMLElement | null;
      if (mobileSymbol) mobileSymbol.textContent = '%';
      const desktopSymbol = button.querySelector('.price-currency-symbol') as HTMLElement | null;
      if (desktopSymbol) desktopSymbol.textContent = '%';
    }

    BrowserClient.setValue(StorageKey.MINIMUM_PRICE_DIFFERENCE, newValue);

    const productPage = document.querySelector('article.offering-card');
    if (productPage) {
      const event = new Event('priceThresholdChange');
      document.dispatchEvent(event);
    }
  }

  private createDarkModeToggleButton(): HTMLButtonElement {
    const button = document.createElement('button');
    button.classList.add('toggle-option-button', 'dark-mode-option');
    button.title = this.state.darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode';

    const svg = buildSvg(ICON.moon);
    DomClient.appendElementToElement(svg, button);

    if (this.state.darkMode) {
      button.classList.add('active');
    }

    button.addEventListener('click', (e) => {
      e.stopPropagation();

      this.state.darkMode = !this.state.darkMode;
      BrowserClient.setValue(StorageKey.DARK_MODE, this.state.darkMode);
      themeSync(this.state);

      button.classList.toggle('active');
      button.title = this.state.darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode';
    });

    return button;
  }

  private createWideModeToggleButton(): HTMLButtonElement {
    const button = document.createElement('button');
    button.classList.add('toggle-option-button', 'wide-mode-option');
    button.title = this.state.wideMode ? 'Disable Wide Mode' : 'Enable Wide Mode';

    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 16 16');
    svg.setAttribute('width', '16');
    svg.setAttribute('height', '16');

    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    // Two diagonal arrows facing away: top-right ↗ and bottom-left ↙
    path.setAttribute(
      'd',
      'M11 1.5a.5.5 0 0 1 .5-.5h3.5a.5.5 0 0 1 .5.5V5a.5.5 0 0 1-1 0V2.707L9.854 7.354a.5.5 0 1 1-.708-.708L13.793 2H11.5a.5.5 0 0 1-.5-.5zM1.5 11a.5.5 0 0 1 .5.5v1.293l4.646-4.647a.5.5 0 0 1 .708.708L2.707 13.5H4.5a.5.5 0 0 1 0 1H1.5a.5.5 0 0 1-.5-.5v-3a.5.5 0 0 1 .5-.5z',
    );
    path.setAttribute('fill', 'currentColor');

    DomClient.appendElementToElement(path, svg);
    DomClient.appendElementToElement(svg, button);

    if (this.state.wideMode) {
      button.classList.add('active');
    }

    button.addEventListener('click', (e) => {
      e.stopPropagation();

      this.state.wideMode = !this.state.wideMode;
      BrowserClient.setValue(StorageKey.WIDE_MODE, this.state.wideMode);
      this.wideModeDecorator.sync();

      button.classList.toggle('active');
      button.title = this.state.wideMode ? 'Disable Wide Mode' : 'Enable Wide Mode';
    });

    return button;
  }

  private createAdToggleButton(): HTMLButtonElement {
    const button = document.createElement('button');
    button.classList.add('toggle-option-button', 'ad-toggle-option');
    button.title = this.state.hideProductAds ? 'Hide Ads' : 'Show Ads';

    const svg = buildSvg(ICON.tag);
    DomClient.appendElementToElement(svg, button);

    if (!this.state.hideProductAds) {
      button.classList.add('active');
    }

    const notificationBubble = document.createElement('div');
    notificationBubble.classList.add('notification-bubble');
    notificationBubble.textContent = `${this.state.productAdCount}`;
    DomClient.appendElementToElement(notificationBubble, button);

    const updateNotificationCount = (): void => {
      const flaggedElements = document.querySelectorAll(
        'li.flagged-product, div.flagged-bought-together, .card.flagged-product',
      );

      if (flaggedElements.length !== this.state.productAdCount) {
        this.state.productAdCount = flaggedElements.length;
      }

      notificationBubble.textContent = `${this.state.productAdCount}`;

      if (this.state.productAdCount === 0) {
        notificationBubble.style.display = 'none';
      } else {
        notificationBubble.style.display = 'flex';
      }
    };

    updateNotificationCount();

    setInterval(() => {
      updateNotificationCount();
    }, 2000);

    button.addEventListener('click', (e) => {
      e.stopPropagation();
      this.state.hideProductAds = !this.state.hideProductAds;

      BrowserClient.setValue(StorageKey.PRODUCT_AD_VISIBILITY, this.state.hideProductAds);

      const sponsoredFlagButton = document.getElementById('sponsored-flagger-button');
      if (sponsoredFlagButton) {
        const activeButtonClass = 'flagger-toggle-product-active';
        if (this.state.hideProductAds) {
          sponsoredFlagButton.classList.remove(activeButtonClass);
        } else {
          sponsoredFlagButton.classList.add(activeButtonClass);
        }
      }

      this.listProductAdHandler.visibilityUpdate();
      this.shelfProductAdHandler.visibilityUpdate();

      button.classList.toggle('active');

      button.title = this.state.hideProductAds ? 'Hide Ads' : 'Show Ads';
    });

    return button;
  }

  private createVideoToggleButton(): HTMLButtonElement {
    const button = document.createElement('button');
    button.classList.add('toggle-option-button', 'video-toggle-option');
    button.title = this.state.hideVideoAds ? 'Hide Videos' : 'Show Videos';

    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 16 16');
    svg.setAttribute('width', '16');
    svg.setAttribute('height', '16');

    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute(
      'd',
      'M0 1a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H1a1 1 0 0 1-1-1V1zm4 0v6h8V1H4zm8 8H4v6h8V9zM1 1v2h2V1H1zm2 3H1v2h2V4zM1 7v2h2V7H1zm2 3H1v2h2v-2zm-2 3v2h2v-2H1zM15 1h-2v2h2V1zm-2 3v2h2V4h-2zm2 3h-2v2h2V7zm-2 3v2h2v-2h-2zm2 3h-2v2h2V13z',
    );
    path.setAttribute('fill', 'currentColor');
    DomClient.appendElementToElement(path, svg);
    DomClient.appendElementToElement(svg, button);

    const videoNotificationBubble = document.createElement('div');
    videoNotificationBubble.classList.add('notification-bubble', 'video-notification');
    videoNotificationBubble.textContent = `${this.state.videoAdCount}`;
    DomClient.appendElementToElement(videoNotificationBubble, button);

    const updateVideoNotificationCount = (): void => {
      videoNotificationBubble.textContent = `${this.state.videoAdCount}`;
      if (this.state.videoAdCount === 0) {
        videoNotificationBubble.style.display = 'none';
      } else {
        videoNotificationBubble.style.display = 'flex';
      }
    };

    updateVideoNotificationCount();

    setInterval(() => {
      updateVideoNotificationCount();
    }, 2000);

    if (!this.state.hideVideoAds) {
      button.classList.add('active');
    }

    button.addEventListener('click', (e) => {
      e.stopPropagation();
      this.state.hideVideoAds = !this.state.hideVideoAds;

      BrowserClient.setValue(StorageKey.VIDEO_AD_VISIBILITY, this.state.hideVideoAds);

      this.videoHandler.visibilityUpdate();
      button.classList.toggle('active');

      button.title = this.state.hideVideoAds ? 'Hide Videos' : 'Show Videos';
    });

    return button;
  }

  private createSponsorshipToggleButton(): HTMLButtonElement {
    const button = document.createElement('button');
    button.classList.add('toggle-option-button', 'sponsorship-toggle-option');
    button.title = this.state.hideSponsorships ? 'Hide Sponsorships' : 'Show Sponsorships';

    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 16 16');
    svg.setAttribute('width', '16');
    svg.setAttribute('height', '16');

    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute(
      'd',
      'M12 1a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1h8zM4 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2H4z M4 2.5a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-.5.5h-7a.5.5 0 0 1-.5-.5v-2zm0 4a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-.5.5h-7a.5.5 0 0 1-.5-.5v-2zm0 4a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-.5.5h-7a.5.5 0 0 1-.5-.5v-2z',
    );
    path.setAttribute('fill', 'currentColor');

    DomClient.appendElementToElement(path, svg);
    DomClient.appendElementToElement(svg, button);

    const notificationBubble = document.createElement('div');
    notificationBubble.classList.add('notification-bubble', 'sponsorship-notification');
    notificationBubble.textContent = '0';
    DomClient.appendElementToElement(notificationBubble, button);

    const updateNotificationCount = (): void => {
      const sponsorshipElements = document.querySelectorAll('.flagged-sponsorship');
      notificationBubble.textContent = `${sponsorshipElements.length}`;
      notificationBubble.style.display = sponsorshipElements.length === 0 ? 'none' : 'flex';
    };

    updateNotificationCount();

    setInterval(updateNotificationCount, 2000);

    if (!this.state.hideSponsorships) {
      button.classList.add('active');
    }

    button.addEventListener('click', (e) => {
      e.stopPropagation();
      this.state.hideSponsorships = !this.state.hideSponsorships;
      BrowserClient.setValue(StorageKey.SPONSORSHIP_VISIBILITY, this.state.hideSponsorships);

      this.sponsorshipAdHandler.visibilityUpdate();
      this.campaignAdHandler.visibilityUpdate();
      button.classList.toggle('active');

      button.title = button.classList.contains('active')
        ? 'Show Sponsorships'
        : 'Hide Sponsorships';
    });

    return button;
  }

  private createShelfProductAdToggleButton(): HTMLButtonElement {
    const button = document.createElement('button');
    button.classList.add('toggle-option-button', 'shelf-ad-toggle-option');
    button.title = this.state.hideShelfProductAds ? 'Hide Shelf Ads' : 'Show Shelf Ads';

    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 16 16');
    svg.setAttribute('width', '16');
    svg.setAttribute('height', '16');

    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute(
      'd',
      'M0 2a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1v7.5a2.5 2.5 0 0 1-2.5 2.5h-9A2.5 2.5 0 0 1 1 12.5V5a1 1 0 0 1-1-1V2zm2 3v7.5A1.5 1.5 0 0 0 3.5 14h9a1.5 1.5 0 0 0 1.5-1.5V5H2zm13-3H1v2h14V2zM5 7.5a.5.5 0 0 1 .5-.5h5a.5.5 0 0 1 0 1h-5a.5.5 0 0 1-.5-.5z M10 7a.25.25 0 0 0-.25.25v.5c0 .138.112.25.25.25h.5A.25.25 0 0 0 10.75 7.75v-.5A.25.25 0 0 0 10.5 7h-.5z',
    );
    path.setAttribute('fill', 'currentColor');

    DomClient.appendElementToElement(path, svg);
    DomClient.appendElementToElement(svg, button);

    const shelfNotificationBubble = document.createElement('div');
    shelfNotificationBubble.classList.add('notification-bubble', 'shelf-notification');
    shelfNotificationBubble.textContent = `${this.state.shelfAdCount}`;
    DomClient.appendElementToElement(shelfNotificationBubble, button);

    const updateShelfNotificationCount = (): void => {
      shelfNotificationBubble.textContent = `${this.state.shelfAdCount}`;
      if (this.state.shelfAdCount === 0) {
        shelfNotificationBubble.style.display = 'none';
      } else {
        shelfNotificationBubble.style.display = 'flex';
      }
    };

    updateShelfNotificationCount();

    setInterval(() => {
      updateShelfNotificationCount();
    }, 2000);

    if (!this.state.hideShelfProductAds) {
      button.classList.add('active');
    }

    button.addEventListener('click', (e) => {
      e.stopPropagation();
      this.state.hideShelfProductAds = !this.state.hideShelfProductAds;

      BrowserClient.setValue(
        StorageKey.SHELF_PRODUCT_AD_VISIBILITY,
        this.state.hideShelfProductAds,
      );

      this.shelfProductAdHandler.visibilityUpdate();
      button.classList.toggle('active');

      button.title = this.state.hideShelfProductAds ? 'Hide Shelf Ads' : 'Show Shelf Ads';
    });

    return button;
  }

  private createAISlopToggleButton(): HTMLButtonElement {
    const button = document.createElement('button');
    button.classList.add('toggle-option-button', 'ai-slop-toggle-option');
    button.title = this.state.hideAISlop ? 'Hide AI Slop' : 'Show AI Slop';

    const svg = buildSvg(ICON.cpu);
    DomClient.appendElementToElement(svg, button);

    if (this.state.hideAISlop) {
      button.classList.add('active');
    }

    const notificationBubble = document.createElement('div');
    notificationBubble.classList.add('notification-bubble', 'ai-notification');
    notificationBubble.textContent = '0';
    DomClient.appendElementToElement(notificationBubble, button);

    const ensureStyle = (): void => {
      if (document.getElementById('resk-ai-hide-style')) return;
      const style = document.createElement('style');
      style.id = 'resk-ai-hide-style';
      style.textContent = `.resk-hide-ai { display: none !important; }`;
      document.head.appendChild(style);
    };

    const queryNodes = (): NodeListOf<HTMLElement> => {
      const selector = [
        '[class*="sofos"]',
        '.sofos-entrypoint',
        '.sofos-listing-shelf',
        '.sofos-chat-button-wrapper',
        '.sofos-chat-button',
      ].join(',');
      return document.querySelectorAll(selector) as NodeListOf<HTMLElement>;
    };

    const apply = (): void => {
      ensureStyle();
      const nodes = queryNodes();
      let count = 0;
      nodes.forEach((el) => {
        const element = el as HTMLElement;
        if (this.state.hideAISlop) {
          element.classList.add('resk-hide-ai');
        } else {
          element.classList.remove('resk-hide-ai');
        }
        count += 1;
      });
      notificationBubble.textContent = `${count}`;
      notificationBubble.style.display = count === 0 ? 'none' : 'flex';
    };

    // initial apply and count
    setTimeout(apply, 0);

    // keep the counter fresh
    const counterInterval = window.setInterval(apply, 2000);
    button.addEventListener('remove', () => window.clearInterval(counterInterval));

    button.addEventListener('click', (e) => {
      e.stopPropagation();
      this.state.hideAISlop = !this.state.hideAISlop;

      BrowserClient.setValue(StorageKey.AI_SLOP_VISIBILITY, this.state.hideAISlop);

      apply();
      button.classList.toggle('active');
      button.title = this.state.hideAISlop ? 'Hide AI Slop' : 'Show AI Slop';
    });

    return button;
  }

  private createRecommendationAdToggleButton(): HTMLButtonElement {
    const button = document.createElement('button');
    button.classList.add('toggle-option-button', 'recommendation-ad-toggle-option');
    button.title = this.state.hideRecommendationAds
      ? 'Hide Recommendation Ads'
      : 'Show Recommendation Ads';

    const svg = buildSvg(ICON.sparkle);
    DomClient.appendElementToElement(svg, button);

    const recommendationNotificationBubble = document.createElement('div');
    recommendationNotificationBubble.classList.add(
      'notification-bubble',
      'recommendation-notification',
    );
    recommendationNotificationBubble.textContent = `${this.state.recommendationAdCount ?? 0}`;
    DomClient.appendElementToElement(recommendationNotificationBubble, button);

    const updateRecommendationNotificationCount = (): void => {
      const flaggedRecommendationElements = document.querySelectorAll('.flagged-recommendation');

      if (flaggedRecommendationElements.length !== (this.state.recommendationAdCount ?? 0)) {
        this.state.recommendationAdCount = flaggedRecommendationElements.length;
      }

      recommendationNotificationBubble.textContent = `${this.state.recommendationAdCount ?? 0}`;
      recommendationNotificationBubble.style.display =
        (this.state.recommendationAdCount ?? 0) === 0 ? 'none' : 'flex';
    };

    updateRecommendationNotificationCount();
    setInterval(updateRecommendationNotificationCount, 2000);

    if (!(this.state.hideRecommendationAds ?? false)) {
      button.classList.add('active');
    }

    button.addEventListener('click', (e) => {
      e.stopPropagation();
      this.state.hideRecommendationAds = !(this.state.hideRecommendationAds ?? false);

      BrowserClient.setValue(
        StorageKey.RECOMMENDATION_AD_VISIBILITY,
        this.state.hideRecommendationAds,
      );

      this.recommendationAdHandler.visibilityUpdate();
      button.classList.toggle('active');
      button.title = this.state.hideRecommendationAds
        ? 'Hide Recommendation Ads'
        : 'Show Recommendation Ads';
    });

    return button;
  }

  private createSkoopToggleButton(): HTMLButtonElement {
    const button = document.createElement('button');
    button.classList.add('toggle-option-button', 'skoop-toggle-option');
    button.title = this.state.hideSkoopAds
      ? 'Hide Skoop Recommendations'
      : 'Show Skoop Recommendations';

    const svg = buildSvg(ICON.newspaper);
    DomClient.appendElementToElement(svg, button);

    if (!this.state.hideSkoopAds) {
      button.classList.add('active');
    }

    const skoopNotificationBubble = document.createElement('div');
    skoopNotificationBubble.classList.add('notification-bubble', 'skoop-notification');
    skoopNotificationBubble.textContent = `${this.state.skoopAdCount}`;
    DomClient.appendElementToElement(skoopNotificationBubble, button);

    const updateSkoopNotificationCount = (): void => {
      const flaggedSkoopElements = document.querySelectorAll('.flagged-skoop');

      if (flaggedSkoopElements.length !== this.state.skoopAdCount) {
        this.state.skoopAdCount = flaggedSkoopElements.length;
      }

      skoopNotificationBubble.textContent = `${this.state.skoopAdCount}`;
      skoopNotificationBubble.style.display = this.state.skoopAdCount === 0 ? 'none' : 'flex';
    };

    updateSkoopNotificationCount();
    setInterval(updateSkoopNotificationCount, 2000);

    button.addEventListener('click', (e) => {
      e.stopPropagation();
      this.state.hideSkoopAds = !this.state.hideSkoopAds;

      BrowserClient.setValue(StorageKey.SKOOP_AD_VISIBILITY, this.state.hideSkoopAds);

      this.skoopHandler.visibilityUpdate();
      button.classList.toggle('active');
      button.title = this.state.hideSkoopAds
        ? 'Hide Skoop Recommendations'
        : 'Show Skoop Recommendations';
    });

    return button;
  }
}
