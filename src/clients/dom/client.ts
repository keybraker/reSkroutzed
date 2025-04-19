import { Language } from "../../common/enums/Language.enum";
import { State } from "../../common/types/State.type";

export class DomClient {
    public static toggleElementVisibility(element: Element, state: State) {
      state.hideProductAds
        ? element.classList.remove('display-none')
        : element.classList.add('display-none');
    }

    public static isElementSponsored(element: Element | null): boolean {
        if (!element || !element.textContent) {
          return false;
        }

        const sponsoredTexts = [
          'Επιλεγμένο κατάστημα',
          'Eπιλεγμένο κατάστημα',
          'Selected shop',
          'Επιλεγμένα καταστήματα',
          'Eπιλεγμένα καταστήματα',
          'Selected shops',
          'Sponsored',
          'Sponsored Store',
          'Ad',
          'Advertisement',
          'Advertisement',
        ];

        return sponsoredTexts.includes(element.textContent.trim());
    }

    public static updateSponsoredTextPlural(element: Element, language: Language) {
    if (DomClient.isElementSponsored(element)) {
        element.classList.add('sponsored-label');
        element.textContent = this.getSponsoredText(true, language);
        return;
    }

    const labelTextElement = element.querySelector('.label-text');

    if (labelTextElement) {
        labelTextElement.classList.add('sponsored-label');
        labelTextElement.textContent = this.getSponsoredText(true, language);
    }
    }

    public static updateSponsoredTextSingle(element: Element, language: Language) {
    if (DomClient.isElementSponsored(element)) {
        element.classList.add('sponsored-label');
        element.textContent = this.getSponsoredText(false, language);
        return;
    }

    const labelTextElement = element.querySelector('.label-text');

    if (labelTextElement) {
        labelTextElement.classList.add('sponsored-label');
        labelTextElement.textContent = this.getSponsoredText(false, language);
    }
    }

    public static isElementFlaggedAsSponsored(element: Element | null) {
        if (!element || !element?.textContent) {
          return false;
        }

        const sponsoredTexts = [
          'Sponsored Stores',
          'Προωθούμενα Καταστήματα',
          'Sponsored Store',
          'Προωθούμενo Κατάστημα',
        ];

        return sponsoredTexts.includes(element.textContent);
    }

    public static flagElementAsSponsored(element: Element): void {
        element.classList.add('flagged-product');

        this.flagImageElement(element);
        this.flagLabelElement(element);
    }

    public static appendElementToElement(element: Element, parentElement: Element): void {
        parentElement.appendChild(element);
    }

    public static getElementByClass(className: string, searchElement?: Element): Element | null {
      return (searchElement ?? document).querySelector(className);
    }

    public static getElementsByClass(className: string, searchElement?: Element): Element[] {
      return [...(searchElement ?? document).querySelectorAll(className)];
    }

    public static getDom(): Document {
        return document;
    }

    // PRIVATE

    private static getSponsoredText(isPlural = false, language: Language) {
    return isPlural
        ? language === Language.ENGLISH
        ? 'Sponsored Stores'
        : 'Προωθούμενα Καταστήματα'
        : language === Language.ENGLISH
        ? 'Sponsored Store'
        : 'Προωθούμενo Κατάστημα';
    }

    private static flagLabelElement(element: Element): void {
        const labelText = element.querySelector('.label-text');

        if (labelText) {
          labelText.classList.add('flagged-product-label');
        }
      }

      private static flagImageElement(element: Element): void {
        const imageLink = element.querySelector('a.image');

        if (imageLink) {
          imageLink.classList.add('flagged-product-image');
        }
      }
}