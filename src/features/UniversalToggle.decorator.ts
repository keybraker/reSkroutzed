import { BrowserClient, StorageKey } from '../clients/browser/client';
import { DomClient } from '../clients/dom/client';
import { Language } from '../common/enums/Language.enum';
import { State } from '../common/types/State.type';
import { ListProductAdHandler } from '../handlers/ListProductAd.handler';
import { ShelfProductAdHandler } from '../handlers/ShelfProductAd.handler';
import { SponsorshipAdHandler } from '../handlers/SponsorshipAd.handler';
import { VideoAdHandler } from '../handlers/VideoAd.handler';
import { FeatureInstance } from './common/FeatureInstance';
import { createLogoElement } from './functions/createLogoElement';
import { themeSync } from './functions/themeSync';

export class UniversalToggleDecorator implements FeatureInstance {
  private isMenuOpen: boolean = false;
  private state: State;

  private readonly videoHandler: VideoAdHandler;
  private readonly listProductAdHandler: ListProductAdHandler;
  private readonly shelfProductAdHandler: ShelfProductAdHandler;
  private readonly sponsorshipAdHandler: SponsorshipAdHandler;

  constructor(state: State) {
    this.state = state;

    this.videoHandler = new VideoAdHandler(this.state);
    this.listProductAdHandler = new ListProductAdHandler(this.state);
    this.shelfProductAdHandler = new ShelfProductAdHandler(this.state);
    this.sponsorshipAdHandler = new SponsorshipAdHandler(this.state);
  }

  public execute(): void {
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
    const adToggleButton = this.createAdToggleButton();
    const videoToggleButton = this.createVideoToggleButton();
    const sponsorshipToggleButton = this.createSponsorshipToggleButton();
    const shelfProductAdToggleButton = this.createShelfProductAdToggleButton();

    DomClient.appendElementToElement(priceDifferenceButton, buttonsContainer);
    DomClient.appendElementToElement(darkModeButton, buttonsContainer);
    DomClient.appendElementToElement(adToggleButton, buttonsContainer);
    DomClient.appendElementToElement(videoToggleButton, buttonsContainer);
    DomClient.appendElementToElement(sponsorshipToggleButton, buttonsContainer);
    DomClient.appendElementToElement(shelfProductAdToggleButton, buttonsContainer);

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
    // Use getValueAsync to get the latest values from Chrome storage
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
    this.state.hideSponsorships = (await BrowserClient.getValueAsync(
      StorageKey.SPONSORSHIP_VISIBILITY,
    )) as boolean;
    this.state.minimumPriceDifference = (await BrowserClient.getValueAsync(
      StorageKey.MINIMUM_PRICE_DIFFERENCE,
    )) as number;

    // Update UI to reflect the refreshed values
    this.updateUIFromState();
  }

  /**
   * Update UI elements to match the current state
   */
  private updateUIFromState(): void {
    const container = document.querySelector('.universal-toggle-container');
    if (!container) return;

    // Update dark mode button
    const darkModeButton = container.querySelector('.dark-mode-option') as HTMLButtonElement;
    if (darkModeButton) {
      darkModeButton.classList.toggle('active', this.state.darkMode);
      darkModeButton.title = this.state.darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode';

      const darkModePath = darkModeButton.querySelector('path');
      if (darkModePath) {
        if (this.state.darkMode) {
          // Moon icon
          darkModePath.setAttribute(
            'd',
            'M12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9 9-4.03 9-9c0-.46-.04-.92-.1-1.36-.98 1.37-2.58 2.26-4.4 2.26-3.03 0-5.5-2.47-5.5-5.5 0-1.82.89-3.42 2.26-4.4-.44-.06-.9-.1-1.36-.1z',
          );
        } else {
          // Sun icon
          darkModePath.setAttribute(
            'd',
            'M12 7c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zM2 13h2c.55 0 1-.45 1-1s-.45-1-1-1H2c-.55 0-1 .45-1 1s.45 1 1 1zm18 0h2c.55 0 1-.45 1-1s-.45-1-1-1h-2c-.55 0-1 .45-1 1s.45 1 1 1zM11 2v2c0 .55.45 1 1 1s1-.45 1-1V2c0-.55-.45-1-1-1s-1 .45-1 1zm0 18v2c0 .55.45 1 1 1s1-.45 1-1v-2c0-.55-.45-1-1-1s-1 .45-1 1zM5.99 4.58c-.39-.39-1.03-.39-1.41 0-.39.39-.39 1.03 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0 .39-.39.39-1.03 0-1.41L5.99 4.58zm12.37 12.37c-.39-.39-1.03-.39-1.41 0-.39.39-.39 1.03 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0 .39-.39.39-1.03 0-1.41l-1.06-1.06zm1.06-10.96c.39-.39.39-1.03 0-1.41-.39-.39-1.03-.39-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41.39.39 1.03.39 1.41 0l1.06-1.06zM7.05 18.36c.39-.39.39-1.03 0-1.41-.39-.39-1.03-.39-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41.39.39 1.03.39 1.41 0l1.06-1.06z',
          );
        }
      }
    }

    // Update product ads button
    const adToggleButton = container.querySelector('.ad-toggle-option') as HTMLButtonElement;
    if (adToggleButton) {
      adToggleButton.classList.toggle('active', !this.state.hideProductAds);
      adToggleButton.title = this.state.hideProductAds ? 'Hide Ads' : 'Show Ads';

      const adText = adToggleButton.querySelector('.ad-text-icon');
      if (adText) {
        adText.classList.toggle('ad-text-disabled', !this.state.hideProductAds);
      }
    }

    // Update video ads button
    const videoToggleButton = container.querySelector('.video-toggle-option') as HTMLButtonElement;
    if (videoToggleButton) {
      videoToggleButton.classList.toggle('active', !this.state.hideVideoAds);
      videoToggleButton.title = this.state.hideVideoAds ? 'Hide Videos' : 'Show Videos';

      const videoPath = videoToggleButton.querySelector('path');
      if (videoPath) {
        if (this.state.hideVideoAds) {
          videoPath.setAttribute(
            'd',
            'M0 1a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H1a1 1 0 0 1-1-1V1zm4 0v6h8V1H4zm8 8H4v6h8V9zM1 1v2h2V1H1zm2 3H1v2h2V4zM1 7v2h2V7H1zm2 3H1v2h2v-2zm-2 3v2h2v-2H1zM15 1h-2v2h2V1zm-2 3v2h2V4h-2zm2 3h-2v2h2V7zm-2 3v2h2v-2h-2zm2 3h-2v2h2v-2z',
          );
        } else {
          videoPath.setAttribute(
            'd',
            'M0 1a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H1a1 1 0 0 1-1-1V1zm4 0v6h8V1H4zm8 8H4v6h8V9zM1 1v2h2V1H1zm2 3H1v2h2V4zM1 7v2h2V7H1zm2 3H1v2h2v-2zm-2 3v2h2v-2H1zM15 1h-2v2h2V1zm-2 3v2h2V4h-2zm2 3h-2v2h2V7zm-2 3v2h2v-2h-2zm2 3h-2v2h2v-2z M10.707 5.293a1 1 0 0 0-1.414 0L7 7.586 5.707 6.293a1 1 0 0 0-1.414 1.414L5.586 9 4.293 10.293a1 1 0 1 0 1.414 1.414L7 10.414l1.293 1.293a1 1 0 0 0 1.414-1.414L8.414 9l1.293-1.293a1 1 0 0 0 0-1.414z',
          );
        }
      }
    }

    // Update sponsorship button
    const sponsorshipToggleButton = container.querySelector(
      '.sponsorship-toggle-option',
    ) as HTMLButtonElement;
    if (sponsorshipToggleButton) {
      sponsorshipToggleButton.classList.toggle('active', !this.state.hideSponsorships);
      sponsorshipToggleButton.title = this.state.hideSponsorships
        ? 'Hide Sponsorships'
        : 'Show Sponsorships';

      const sponsorshipPath = sponsorshipToggleButton.querySelector('path');
      if (sponsorshipPath) {
        if (this.state.hideSponsorships) {
          sponsorshipPath.setAttribute(
            'd',
            'M12 1a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1h8zM4 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2H4z M4 2.5a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-.5.5h-7a.5.5 0 0 1-.5-.5v-2zm0 4a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-.5.5h-7a.5.5 0 0 1-.5-.5v-2zm0 4a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-.5.5h-7a.5.5 0 0 1-.5-.5v-2z',
          );
        } else {
          sponsorshipPath.setAttribute(
            'd',
            'M12 1a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1h8zM4 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2H4z M4 2.5a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-.5.5h-7a.5.5 0 0 1-.5-.5v-2zm0 4a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-.5.5h-7a.5.5 0 0 1-.5-.5v-2zm0 4a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-.5.5h-7a.5.5 0 0 1-.5-.5v-2z M13.354 3.354a.5.5 0 0 0-.708-.708L2.646 12.646a.5.5 0 0 0 .708.708L13.354 3.354z',
          );
        }
      }
    }

    // Update shelf ads button
    const shelfToggleButton = container.querySelector(
      '.shelf-ad-toggle-option',
    ) as HTMLButtonElement;
    if (shelfToggleButton) {
      shelfToggleButton.classList.toggle('active', !this.state.hideShelfProductAds);
      shelfToggleButton.title = this.state.hideShelfProductAds
        ? 'Hide Shelf Ads'
        : 'Show Shelf Ads';

      const shelfPath = shelfToggleButton.querySelector('path');
      if (shelfPath) {
        if (this.state.hideShelfProductAds) {
          shelfPath.setAttribute(
            'd',
            'M0 2a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1v7.5a2.5 2.5 0 0 1-2.5 2.5h-9A2.5 2.5 0 0 1 1 12.5V5a1 1 0 0 1-1-1V2zm2 3v7.5A1.5 1.5 0 0 0 3.5 14h9a1.5 1.5 0 0 0 1.5-1.5V5H2zm13-3H1v2h14V2zM5 7.5a.5.5 0 0 1 .5-.5h5a.5.5 0 0 1 0 1h-5a.5.5 0 0 1-.5-.5z',
          );
        } else {
          shelfPath.setAttribute(
            'd',
            'M0 2a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1v7.5a2.5 2.5 0 0 1-2.5 2.5h-9A2.5 2.5 0 0 1 1 12.5V5a1 1 0 0 1-1-1V2zm2 3v7.5A1.5 1.5 0 0 0 3.5 14h9a1.5 1.5 0 0 0 1.5-1.5V5H2zm13-3H1v2h14V2zM5 7.5a.5.5 0 0 1 .5-.5h5a.5.5 0 0 1 0 1h-5a.5.5 0 0 1-.5-.5z M10 7a.25.25 0 0 0-.25.25v.5c0 .138.112.25.25.25h.5A.25.25 0 0 0 10.75 7.75v-.5A.25.25 0 0 0 10.5 7h-.5z',
          );
        }
      }
    }

    // Update minimum price difference display
    const priceDifferenceButton = container.querySelector(
      '.price-difference-option',
    ) as HTMLButtonElement;
    if (priceDifferenceButton) {
      // Update data-value attribute for mobile display
      priceDifferenceButton.setAttribute(
        'data-value',
        this.state.minimumPriceDifference.toString(),
      );

      const updatedTitle =
        this.state.language === Language.GREEK
          ? `Ελάχιστη διαφορά τιμής: ${this.state.minimumPriceDifference}€`
          : `Minimum Price Difference: ${this.state.minimumPriceDifference}€`;
      priceDifferenceButton.title = updatedTitle;

      // Update for mobile view
      const valueText = priceDifferenceButton.querySelector('.price-value-mobile');
      if (valueText) {
        valueText.textContent = this.state.minimumPriceDifference.toString();
      } else {
        // Update for desktop view
        const valueDisplay = priceDifferenceButton.querySelector('span');
        if (valueDisplay) {
          valueDisplay.textContent = this.state.minimumPriceDifference.toString();
        }
      }
    }
  }

  private openMenu(container: HTMLElement): void {
    container.classList.add('menu-open');
    this.isMenuOpen = true;

    const buttons = container.querySelectorAll('.toggle-option-button');
    buttons.forEach((button, index) => {
      setTimeout(() => {
        button.classList.add('button-active');
      }, 80 * index); // More pronounced staggering (start from first button)
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
        ? `Ελάχιστη διαφορά τιμής: ${this.state.minimumPriceDifference}€`
        : `Minimum Price Difference: ${this.state.minimumPriceDifference}€`;
    button.title = titleText;

    // Set data-value attribute for mobile display
    button.setAttribute('data-value', this.state.minimumPriceDifference.toString());

    const isMobile = BrowserClient.detectMobile();

    // Create the internal structure based on device type
    if (isMobile) {
      // Mobile: Just show the plain number
      const valueText = document.createElement('span');
      valueText.classList.add('price-value-mobile');
      valueText.textContent = this.state.minimumPriceDifference.toString();
      DomClient.appendElementToElement(valueText, button);
    } else {
      // Desktop: Show the full display with icon and value
      const flexContainer = document.createElement('div');
      flexContainer.style.display = 'flex';
      flexContainer.style.alignItems = 'center';
      flexContainer.style.justifyContent = 'center';

      const valueDisplay = document.createElement('span');
      valueDisplay.textContent = this.state.minimumPriceDifference.toString();
      DomClient.appendElementToElement(valueDisplay, flexContainer);

      const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svg.setAttribute('viewBox', '0 0 16 16');
      svg.setAttribute('width', '16');
      svg.setAttribute('height', '16');
      svg.style.marginLeft = '5px';

      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.setAttribute(
        'd',
        'M4 9.42h1.063C5.4 12.323 7.317 14 10.34 14c.622 0 1.167-.068 1.659-.185v-1.3c-.484.119-1.045.17-1.659.17-2.1 0-3.455-1.198-3.775-3.264h4.017v-.928H6.497v-.936c0-.11 0-.219.008-.329h4.078v-.927H6.618c.388-1.898 1.719-2.985 3.723-2.985.614 0 1.175.05 1.659.177V2.194A6.617 6.617 0 0 0 10.341 2c-2.973 0-4.96 1.714-5.277 4.734H4V7.66h1.01V8.595H4z',
      );
      path.setAttribute('fill', 'currentColor');
      DomClient.appendElementToElement(path, svg);
      DomClient.appendElementToElement(svg, flexContainer);

      DomClient.appendElementToElement(flexContainer, button);
    }

    button.addEventListener('click', (e) => {
      e.stopPropagation();

      if (isMobile) {
        // On mobile, show a simple input dialog
        const inputValue = prompt(
          this.state.language === Language.GREEK
            ? 'Ελάχιστη διαφορά τιμής (€):'
            : 'Minimum price difference (€):',
          this.state.minimumPriceDifference.toString(),
        );

        if (inputValue !== null) {
          const newValue = parseFloat(inputValue);
          if (!isNaN(newValue) && newValue >= 0) {
            this.updatePriceDifferenceValue(newValue, button);
          }
        }
      } else {
        // On desktop, show the popup
        const popup = document.createElement('div');
        popup.classList.add('price-difference-popup');

        const label = document.createElement('label');
        label.textContent =
          this.state.language === Language.GREEK
            ? 'Ελάχιστη διαφορά τιμής (€):'
            : 'Minimum price difference (€):';

        const input = document.createElement('input');
        input.type = 'number';
        input.min = '0';
        input.step = '0.5';
        input.value = this.state.minimumPriceDifference.toString();

        const saveValue = (): void => {
          const newValue = parseFloat(input.value);
          if (!isNaN(newValue) && newValue >= 0) {
            this.updatePriceDifferenceValue(newValue, button);
          }
          popup.remove();
        };

        input.addEventListener('blur', saveValue);
        input.addEventListener('keyup', (event) => {
          if (event.key === 'Enter') {
            saveValue();
          }
        });

        DomClient.appendElementToElement(label, popup);
        DomClient.appendElementToElement(input, popup);
        DomClient.appendElementToElement(popup, button);
        input.focus();

        const closePopupHandler = (event: MouseEvent): void => {
          if (!popup.contains(event.target as Node) && event.target !== button) {
            saveValue();
            document.removeEventListener('click', closePopupHandler);
          }
        };

        setTimeout(() => {
          document.addEventListener('click', closePopupHandler);
        }, 100);
      }
    });

    return button;
  }

  /**
   * Updates the price difference value in the state and UI
   */
  private updatePriceDifferenceValue(newValue: number, button?: HTMLButtonElement): void {
    this.state.minimumPriceDifference = newValue;

    // Update data-value attribute for mobile display
    if (button) {
      button.setAttribute('data-value', newValue.toString());

      const updatedTitle =
        this.state.language === Language.GREEK
          ? `Ελάχιστη διαφορά τιμής: ${newValue}€`
          : `Minimum Price Difference: ${newValue}€`;
      button.title = updatedTitle;

      // Update text content if it's a mobile view
      const valueText = button.querySelector('.price-value-mobile');
      if (valueText) {
        valueText.textContent = newValue.toString();
      } else {
        // Update for desktop view
        const valueDisplay = button.querySelector('span');
        if (valueDisplay) {
          valueDisplay.textContent = newValue.toString();
        }
      }
    }

    // Store the setting
    BrowserClient.setValue(StorageKey.MINIMUM_PRICE_DIFFERENCE, newValue);

    // Trigger price difference update if on a product page
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

    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('width', '16');
    svg.setAttribute('height', '16');

    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');

    if (this.state.darkMode) {
      // Moon icon
      path.setAttribute(
        'd',
        'M12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9 9-4.03 9-9c0-.46-.04-.92-.1-1.36-.98 1.37-2.58 2.26-4.4 2.26-3.03 0-5.5-2.47-5.5-5.5 0-1.82.89-3.42 2.26-4.4-.44-.06-.9-.1-1.36-.1z',
      );
    } else {
      // Sun icon
      path.setAttribute(
        'd',
        'M12 7c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zM2 13h2c.55 0 1-.45 1-1s-.45-1-1-1H2c-.55 0-1 .45-1 1s.45 1 1 1zm18 0h2c.55 0 1-.45 1-1s-.45-1-1-1h-2c-.55 0-1 .45-1 1s.45 1 1 1zM11 2v2c0 .55.45 1 1 1s1-.45 1-1V2c0-.55-.45-1-1-1s-1 .45-1 1zm0 18v2c0 .55.45 1 1 1s1-.45 1-1v-2c0-.55-.45-1-1-1s-1 .45-1 1zM5.99 4.58c-.39-.39-1.03-.39-1.41 0-.39.39-.39 1.03 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0 .39-.39.39-1.03 0-1.41L5.99 4.58zm12.37 12.37c-.39-.39-1.03-.39-1.41 0-.39.39-.39 1.03 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0 .39-.39.39-1.03 0-1.41l-1.06-1.06zm1.06-10.96c.39-.39.39-1.03 0-1.41-.39-.39-1.03-.39-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41.39.39 1.03.39 1.41 0l1.06-1.06zM7.05 18.36c.39-.39.39-1.03 0-1.41-.39-.39-1.03-.39-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41.39.39 1.03.39 1.41 0l1.06-1.06z',
      );
    }

    path.setAttribute('fill', 'currentColor');

    DomClient.appendElementToElement(path, svg);
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

      const newPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      if (this.state.darkMode) {
        // Moon icon
        newPath.setAttribute(
          'd',
          'M12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9 9-4.03 9-9c0-.46-.04-.92-.1-1.36-.98 1.37-2.58 2.26-4.4 2.26-3.03 0-5.5-2.47-5.5-5.5 0-1.82.89-3.42 2.26-4.4-.44-.06-.9-.1-1.36-.1z',
        );
      } else {
        // Sun icon
        newPath.setAttribute(
          'd',
          'M12 7c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zM2 13h2c.55 0 1-.45 1-1s-.45-1-1-1H2c-.55 0-1 .45-1 1s.45 1 1 1zm18 0h2c.55 0 1-.45 1-1s-.45-1-1-1h-2c-.55 0-1 .45-1 1s.45 1 1 1zM11 2v2c0 .55.45 1 1 1s1-.45 1-1V2c0-.55-.45-1-1-1s-1 .45-1 1zm0 18v2c0 .55.45 1 1 1s1-.45 1-1v-2c0-.55-.45-1-1-1s-1 .45-1 1zM5.99 4.58c-.39-.39-1.03-.39-1.41 0-.39.39-.39 1.03 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0 .39-.39.39-1.03 0-1.41L5.99 4.58zm12.37 12.37c-.39-.39-1.03-.39-1.41 0-.39.39-.39 1.03 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0 .39-.39.39-1.03 0-1.41l-1.06-1.06zm1.06-10.96c.39-.39.39-1.03 0-1.41-.39-.39-1.03-.39-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41.39.39 1.03.39 1.41 0l1.06-1.06zM7.05 18.36c.39-.39.39-1.03 0-1.41-.39-.39-1.03-.39-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41.39.39 1.03.39 1.41 0l1.06-1.06z',
        );
      }
      newPath.setAttribute('fill', 'currentColor');

      const oldPath = svg.querySelector('path');
      if (oldPath) {
        svg.removeChild(oldPath);
      }
      DomClient.appendElementToElement(newPath, svg);

      button.title = this.state.darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode';
    });

    return button;
  }

  private createAdToggleButton(): HTMLButtonElement {
    const button = document.createElement('button');
    button.classList.add('toggle-option-button', 'ad-toggle-option');
    button.title = this.state.hideProductAds ? 'Hide Ads' : 'Show Ads';

    const adTextSpan = document.createElement('span');
    adTextSpan.classList.add('ad-text-icon');
    adTextSpan.textContent = 'AD';

    if (!this.state.hideProductAds) {
      adTextSpan.classList.add('ad-text-disabled');
      button.classList.add('active');
    }

    DomClient.appendElementToElement(adTextSpan, button);

    const notificationBubble = document.createElement('div');
    notificationBubble.classList.add('notification-bubble');
    notificationBubble.textContent = `${this.state.productAdCount}`;
    DomClient.appendElementToElement(notificationBubble, button);

    const updateNotificationCount = (): void => {
      const flaggedElements = document.querySelectorAll(
        'li.flagged-product, div.flagged-bought-together, .card.flagged-product, .card.tracking-img-container.flagged-product',
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

      const adText = button.querySelector('.ad-text-icon');
      if (adText) {
        if (this.state.hideProductAds) {
          adText.classList.remove('ad-text-disabled');
        } else {
          adText.classList.add('ad-text-disabled');
        }
      }

      const sponsoredFlagButton = document.getElementById('sponsored-flagger-button');
      if (sponsoredFlagButton) {
        const activeButtonClass = 'flagger-toggle-product-active';
        if (this.state.hideProductAds) {
          sponsoredFlagButton.classList.remove(activeButtonClass);
        } else {
          sponsoredFlagButton.classList.add(activeButtonClass);
        }
      }

      // Use handlers to update visibility
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
    if (this.state.hideVideoAds) {
      path.setAttribute(
        'd',
        'M0 1a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H1a1 1 0 0 1-1-1V1zm4 0v6h8V1H4zm8 8H4v6h8V9zM1 1v2h2V1H1zm2 3H1v2h2V4zM1 7v2h2V7H1zm2 3H1v2h2v-2zm-2 3v2h2v-2H1zM15 1h-2v2h2V1zm-2 3v2h2V4h-2zm2 3h-2v2h2V7zm-2 3v2h2v-2h-2zm2 3h-2v2h2V13z',
      );
    } else {
      path.setAttribute(
        'd',
        'M0 1a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H1a1 1 0 0 1-1-1V1zm4 0v6h8V1H4zm8 8H4v6h8V9zM1 1v2h2V1H1zm2 3H1v2h2V4zM1 7v2h2V7H1zm2 3H1v2h2v-2zm-2 3v2h2v-2H1zM15 1h-2v2h2V1zm-2 3v2h2V4h-2zm2 3h-2v2h2V7zm-2 3v2h2v-2h-2zm2 3h-2v2h2V13z M10.707 5.293a1 1 0 0 0-1.414 0L7 7.586 5.707 6.293a1 1 0 0 0-1.414 1.414L5.586 9 4.293 10.293a1 1 0 1 0 1.414 1.414L7 10.414l1.293 1.293a1 1 0 0 0 1.414-1.414L8.414 9l1.293-1.293a1 1 0 0 0 0-1.414z',
      );
    }
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

      // Add this line to persist the video visibility setting to storage
      BrowserClient.setValue(StorageKey.VIDEO_AD_VISIBILITY, this.state.hideVideoAds);

      this.videoHandler.visibilityUpdate();
      button.classList.toggle('active');

      const newPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      if (this.state.hideVideoAds) {
        newPath.setAttribute(
          'd',
          'M0 1a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H1a1 1 0 0 1-1-1V1zm4 0v6h8V1H4zm8 8H4v6h8V9zM1 1v2h2V1H1zm2 3H1v2h2V4zM1 7v2h2V7H1zm2 3H1v2h2v-2zm-2 3v2h2v-2H1zM15 1h-2v2h2V1zm-2 3v2h2V4h-2zm2 3h-2v2h2V7zm-2 3v2h2v-2h-2zm2 3h-2v2h2V13z',
        );
      } else {
        newPath.setAttribute(
          'd',
          'M0 1a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H1a1 1 0 0 1-1-1V1zm4 0v6h8V1H4zm8 8H4v6h8V9zM1 1v2h2V1H1zm2 3H1v2h2V4zM1 7v2h2V7H1zm2 3H1v2h2v-2zm-2 3v2h2v-2H1zM15 1h-2v2h2V1zm-2 3v2h2V4h-2zm2 3h-2v2h2V7zm-2 3v2h2v-2h-2zm2 3h-2v2h2V13z M10.707 5.293a1 1 0 0 0-1.414 0L7 7.586 5.707 6.293a1 1 0 0 0-1.414 1.414L5.586 9 4.293 10.293a1 1 0 1 0 1.414 1.414L7 10.414l1.293 1.293a1 1 0 0 0 1.414-1.414L8.414 9l1.293-1.293a1 1 0 0 0 0-1.414z',
        );
      }
      newPath.setAttribute('fill', 'currentColor');

      const oldPath = svg.querySelector('path');
      if (oldPath) {
        svg.removeChild(oldPath);
      }
      DomClient.appendElementToElement(newPath, svg);

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
    if (this.state.hideSponsorships) {
      // Megaphone icon for visible state
      path.setAttribute(
        'd',
        'M12 1a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1h8zM4 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2H4z M4 2.5a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-.5.5h-7a.5.5 0 0 1-.5-.5v-2zm0 4a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-.5.5h-7a.5.5 0 0 1-.5-.5v-2zm0 4a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-.5.5h-7a.5.5 0 0 1-.5-.5v-2z',
      );
    } else {
      // Blocked megaphone icon for hidden state
      path.setAttribute(
        'd',
        'M12 1a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1h8zM4 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2H4z M4 2.5a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-.5.5h-7a.5.5 0 0 1-.5-.5v-2zm0 4a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-.5.5h-7a.5.5 0 0 1-.5-.5v-2zm0 4a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-.5.5h-7a.5.5 0 0 1-.5-.5v-2z M13.354 3.354a.5.5 0 0 0-.708-.708L2.646 12.646a.5.5 0 0 0 .708.708L13.354 3.354z',
      );
    }
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
      button.classList.toggle('active');

      const newPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      if (!button.classList.contains('active')) {
        // Megaphone icon for visible state
        newPath.setAttribute(
          'd',
          'M12 1a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1h8zM4 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2H4z M4 2.5a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-.5.5h-7a.5.5 0 0 1-.5-.5v-2zm0 4a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-.5.5h-7a.5.5 0 0 1-.5-.5v-2zm0 4a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-.5.5h-7a.5.5 0 0 1-.5-.5v-2z',
        );
      } else {
        // Blocked megaphone icon for hidden state
        newPath.setAttribute(
          'd',
          'M12 1a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1h8zM4 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2H4z M4 2.5a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-.5.5h-7a.5.5 0 0 1-.5-.5v-2zm0 4a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-.5.5h-7a.5.5 0 0 1-.5-.5v-2zm0 4a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-.5.5h-7a.5.5 0 0 1-.5-.5v-2z M13.354 3.354a.5.5 0 0 0-.708-.708L2.646 12.646a.5.5 0 0 0 .708.708L13.354 3.354z',
        );
      }
      newPath.setAttribute('fill', 'currentColor');

      const oldPath = svg.querySelector('path');
      if (oldPath) {
        svg.removeChild(oldPath);
      }
      DomClient.appendElementToElement(newPath, svg);

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

    // Create shelf icon (bookshelf-like icon)
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 16 16');
    svg.setAttribute('width', '16');
    svg.setAttribute('height', '16');

    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    if (this.state.hideShelfProductAds) {
      // Simple shelf icon
      path.setAttribute(
        'd',
        'M0 2a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1v7.5a2.5 2.5 0 0 1-2.5 2.5h-9A2.5 2.5 0 0 1 1 12.5V5a1 1 0 0 1-1-1V2zm2 3v7.5A1.5 1.5 0 0 0 3.5 14h9a1.5 1.5 0 0 0 1.5-1.5V5H2zm13-3H1v2h14V2zM5 7.5a.5.5 0 0 1 .5-.5h5a.5.5 0 0 1 0 1h-5a.5.5 0 0 1-.5-.5z',
      );
    } else {
      // Shelf icon with "Ad" text
      path.setAttribute(
        'd',
        'M0 2a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1v7.5a2.5 2.5 0 0 1-2.5 2.5h-9A2.5 2.5 0 0 1 1 12.5V5a1 1 0 0 1-1-1V2zm2 3v7.5A1.5 1.5 0 0 0 3.5 14h9a1.5 1.5 0 0 0 1.5-1.5V5H2zm13-3H1v2h14V2zM5 7.5a.5.5 0 0 1 .5-.5h5a.5.5 0 0 1 0 1h-5a.5.5 0 0 1-.5-.5z M10 7a.25.25 0 0 0-.25.25v.5c0 .138.112.25.25.25h.5A.25.25 0 0 0 10.75 7.75v-.5A.25.25 0 0 0 10.5 7h-.5z',
      );
    }
    path.setAttribute('fill', 'currentColor');

    DomClient.appendElementToElement(path, svg);
    DomClient.appendElementToElement(svg, button);

    // Add notification badge
    const shelfNotificationBubble = document.createElement('div');
    shelfNotificationBubble.classList.add('notification-bubble', 'shelf-notification');
    shelfNotificationBubble.textContent = `${this.state.ShelfAdCount}`;
    DomClient.appendElementToElement(shelfNotificationBubble, button);

    const updateShelfNotificationCount = (): void => {
      shelfNotificationBubble.textContent = `${this.state.ShelfAdCount}`;
      if (this.state.ShelfAdCount === 0) {
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

      // Store the setting
      BrowserClient.setValue(
        StorageKey.SHELF_PRODUCT_AD_VISIBILITY,
        this.state.hideShelfProductAds,
      );

      // Update visibility using the handler
      this.shelfProductAdHandler.visibilityUpdate();
      button.classList.toggle('active');

      // Update SVG icon
      const newPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      if (this.state.hideShelfProductAds) {
        // Simple shelf icon
        newPath.setAttribute(
          'd',
          'M0 2a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1v7.5a2.5 2.5 0 0 1-2.5 2.5h-9A2.5 2.5 0 0 1 1 12.5V5a1 1 0 0 1-1-1V2zm2 3v7.5A1.5 1.5 0 0 0 3.5 14h9a1.5 1.5 0 0 0 1.5-1.5V5H2zm13-3H1v2h14V2zM5 7.5a.5.5 0 0 1 .5-.5h5a.5.5 0 0 1 0 1h-5a.5.5 0 0 1-.5-.5z',
        );
      } else {
        // Shelf icon with "Ad" text
        newPath.setAttribute(
          'd',
          'M0 2a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1v7.5a2.5 2.5 0 0 1-2.5 2.5h-9A2.5 2.5 0 0 1 1 12.5V5a1 1 0 0 1-1-1V2zm2 3v7.5A1.5 1.5 0 0 0 3.5 14h9a1.5 1.5 0 0 0 1.5-1.5V5H2zm13-3H1v2h14V2zM5 7.5a.5.5 0 0 1 .5-.5h5a.5.5 0 0 1 0 1h-5a.5.5 0 0 1-.5-.5z M10 7a.25.25 0 0 0-.25.25v.5c0 .138.112.25.25.25h.5A.25.25 0 0 0 10.75 7.75v-.5A.25.25 0 0 0 10.5 7h-.5z',
        );
      }
      newPath.setAttribute('fill', 'currentColor');

      const oldPath = svg.querySelector('path');
      if (oldPath) {
        svg.removeChild(oldPath);
      }
      DomClient.appendElementToElement(newPath, svg);

      button.title = this.state.hideShelfProductAds ? 'Hide Shelf Ads' : 'Show Shelf Ads';
    });

    return button;
  }
}
