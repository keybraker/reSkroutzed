import { Language } from '../../common/enums/Language.enum';

export class DomClient {
  public static getDom(): Document {
    return document;
  }

  public static updateElementVisibility(element: Element, visibility: 'show' | 'hide'): void {
    if (visibility === 'show') {
      element.classList.remove('display-none');
    } else {
      element.classList.add('display-none');
    }
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
    ];

    return sponsoredTexts.includes(element.textContent.trim());
  }

  public static updateSponsoredTextPlural(element: Element, language: Language): void {
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

  public static updateSponsoredTextSingle(element: Element, language: Language): void {
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

  public static isElementFlaggedAsSponsored(element: Element | null): boolean {
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

  public static appendElementToElement(element: Element, parentElement: Element): void {
    parentElement.appendChild(element);
  }

  public static getElementByClass(className: string, searchElement?: Element): Element | null {
    return (searchElement ?? document).querySelector(className);
  }

  public static getElementsByClass(className: string, searchElement?: Element): Element[] {
    return Array.from((searchElement ?? document).querySelectorAll(className));
  }

  public static createElement(
    tagName: 'div' | 'span' | 'button',
    options: { className?: string | string[] },
  ): HTMLElement {
    const element = document.createElement(tagName) as HTMLElement;

    if (Array.isArray(options.className)) {
      element.classList.add(...options.className);
    } else if (options.className) {
      element.classList.add(options.className);
    }

    return element;
  }

  public static addClassesToElement(element: Element, ...flagClasses: string[]): void {
    element.classList.add(...flagClasses);
  }

  private static getSponsoredText(isPlural = false, language: Language): string {
    return isPlural
      ? language === Language.ENGLISH
        ? 'Sponsored Stores'
        : 'Προωθούμενα Καταστήματα'
      : language === Language.ENGLISH
        ? 'Sponsored Store'
        : 'Προωθούμενo Κατάστημα';
  }
}
