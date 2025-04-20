import { DomClient } from '../clients/dom/client';
import { State } from '../common/types/State.type';

export abstract class BaseHandler {
  protected state: State;

  constructor(state: State) {
    this.state = state;
  }

  /**
   * Flags elements according to handler-specific criteria
   * Each handler must implement this method
   */
  public abstract flag(): void;

  /**
   * Adds the specified classes to an element and marks it as flagged
   * @param element Element to flag
   * @param flagClasses Classes to add to the element
   */
  protected flagElement(element: Element, ...flagClasses: string[]): void {
    element.classList.add(...flagClasses);
  }

  /**
   * Toggles element visibility based on state
   * @param element Element to toggle visibility
   * @param hideCondition Property of state to check for hiding condition
   */
  protected toggleElementVisibility(element: Element, hideCondition: boolean): void {
    hideCondition
      ? element.classList.remove('display-none')
      : element.classList.add('display-none');
  }

  /**
   * Updates element with appropriate sponsored text based on language
   * @param element Element to update
   * @param isSingle Whether to use single or plural form
   */
  protected updateSponsoredText(element: Element, isSingle: boolean): void {
    isSingle
      ? DomClient.updateSponsoredTextSingle(element, this.state.language)
      : DomClient.updateSponsoredTextPlural(element, this.state.language);
  }

  /**
   * Safely gets elements by selector with null check
   * @param selector CSS selector
   * @param parent Optional parent element to search within
   * @returns Array of matching elements or empty array
   */
  protected getElements(selector: string, parent: Element | Document = document): Element[] {
    const elements = parent.querySelectorAll(selector);
    return elements ? Array.from(elements) : [];
  }

  /**
   * Check if an element is sponsored based on its content
   * @param element Element to check
   * @returns Boolean indicating if element is sponsored
   */
  protected isSponsored(element: Element | null): boolean {
    return DomClient.isElementSponsored(element);
  }
}
