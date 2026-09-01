import { DomClient } from '../../clients/dom/client';
import { State } from '../../common/types/State.type';
import { AdHandlerInterface } from './interfaces/adHandler.interface';

/** State counters mutated by handlers during flag(). */
export type AdCounterKey =
  | 'productAdCount'
  | 'shelfAdCount'
  | 'skoopAdCount'
  | 'recommendationAdCount'
  | 'videoAdCount'
  | 'sponsorshipAdCount';

/** State visibility flags consulted by handlers during visibilityUpdate(). */
export type AdVisibilityKey =
  | 'hideProductAds'
  | 'hideShelfProductAds'
  | 'hideSkoopAds'
  | 'hideRecommendationAds'
  | 'hideVideoAds'
  | 'hideSponsorships';

/**
 * Shared scaffold for the repetitive parts of every ad handler: resetting the
 * counter, marking flagged elements, and toggling their visibility.
 *
 * Concrete handlers provide the CSS selector criteria in flag().
 */
export abstract class BaseAdHandler implements AdHandlerInterface {
  protected abstract readonly flaggedClass: string;
  protected abstract readonly counterKey: AdCounterKey;
  protected abstract readonly visibilityKey: AdVisibilityKey;

  constructor(protected readonly state: State) {}

  public abstract flag(): void;

  public visibilityUpdate(): void {
    DomClient.getElementsByClass(`.${this.flaggedClass}`).forEach((element) => {
      DomClient.updateElementVisibility(element, !this.state[this.visibilityKey] ? 'hide' : 'show');
    });
  }

  /** Reset the counter to the number of currently-flagged elements. */
  protected resetCount(): void {
    this.state[this.counterKey] = DomClient.getElementsByClass(`.${this.flaggedClass}`).length;
  }

  /** Flag a single element: count it, mark it, and apply current visibility. */
  protected mark(element: Element): void {
    this.state[this.counterKey]++;
    DomClient.addClassesToElement(element, this.flaggedClass);
    DomClient.updateElementVisibility(element, !this.state[this.visibilityKey] ? 'hide' : 'show');
  }

  /** Flag every element matching a selector (skipping already-flagged ones). */
  protected flagBySelector(selector: string): void {
    DomClient.getElementsByClass(selector).forEach((element) => {
      if (!element.classList.contains(this.flaggedClass)) {
        this.mark(element);
      }
    });
  }

  /** Flag the parent of every element matching a selector. */
  protected flagParentBySelector(selector: string): void {
    DomClient.getElementsByClass(selector).forEach((element) => {
      const parent = element.parentElement;
      if (parent && !parent.classList.contains(this.flaggedClass)) {
        this.mark(parent);
      }
    });
  }

  /**
   * Scan `<li>` elements that aren't flagged yet, marking those matching the
   * predicate. Set flagParent to mark the element's parent instead.
   */
  protected scanListItems(predicate: (element: Element) => boolean, flagParent = false): void {
    DomClient.getElementsByClass(`li:not(.${this.flaggedClass})`).forEach((element) => {
      if (!predicate(element)) {
        return;
      }

      const target = flagParent ? element.parentElement : element;
      if (target && !target.classList.contains(this.flaggedClass)) {
        this.mark(target);
      }
    });
  }
}
