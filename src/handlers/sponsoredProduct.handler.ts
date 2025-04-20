import { DomClient } from '../clients/dom/client';
import { State } from '../common/types/State.type';
import { BaseHandler } from './base.handler';

export class SponsoredProductHandler extends BaseHandler {
  constructor(state: State) {
    super(state);
  }

  public flag(): void {
    this.updateSponsoredCount();

    // Flag non-flagged product list items that are sponsored
    const nonFlaggedProductListItems = this.getElements('li:not(.flagged-product)');

    nonFlaggedProductListItems.filter(this.isSponsored.bind(this)).forEach((listItem) => {
      DomClient.flagElementAsSponsored(listItem);
      this.updateSponsoredText(listItem, true);
      this.state.productAdCount++;
      this.toggleElementVisibility(listItem, !this.state.hideProductAds);
    });

    nonFlaggedProductListItems.filter(this.hasFlaggedLabelText).forEach((listItem) => {
      DomClient.flagElementAsSponsored(listItem);
      this.updateSponsoredText(listItem, true);
      this.toggleElementVisibility(listItem, !this.state.hideProductAds);
    });

    // Flag shop promoter elements
    const shopPromoterElements = this.getElements('.shop-promoter:not(.flagged-product)');

    shopPromoterElements.forEach((element) => {
      const parentElement = this.findParentToFlag(element);

      if (parentElement) {
        DomClient.flagElementAsSponsored(parentElement);
        this.state.productAdCount++;
        this.toggleElementVisibility(parentElement, !this.state.hideProductAds);
      }
    });

    // Flag card elements with shop promoters
    this.getElements('.card.tracking-img-container:not(.flagged-product)').forEach((card) => {
      const shopPromoter = card.querySelector('.shop-promoter');
      if (shopPromoter) {
        this.flagElement(card, 'flagged-product');

        const labelText = shopPromoter.querySelector('.label-text');
        if (labelText) {
          this.flagElement(labelText, 'flagged-product-label');
        }

        this.state.productAdCount++;
        this.toggleElementVisibility(card, !this.state.hideProductAds);
      }
    });
  }

  private updateSponsoredCount(): void {
    const flaggedProductLists = this.getElements('li.flagged-product');
    const flaggedProductDivs = this.getElements('div.flagged-bought-together');
    const flaggedCardElements = this.getElements('.card.flagged-product');

    if (
      flaggedProductLists.length === 0 &&
      flaggedProductDivs.length === 0 &&
      flaggedCardElements.length === 0
    ) {
      this.state.productAdCount = 0;
    }
  }

  public isSponsored(listItem: Element): boolean {
    const labelTextElement = listItem.querySelector('.label-text');
    return DomClient.isElementSponsored(labelTextElement);
  }

  private hasFlaggedLabelText(listItem: Element): boolean {
    const labelTextElement = listItem.querySelector('.label-text');
    return DomClient.isElementFlaggedAsSponsored(labelTextElement);
  }

  private findParentToFlag(element: Element): Element | null {
    const parentLi = element.closest('li');
    if (parentLi) {
      return parentLi;
    }

    const timelineCard = element.closest(".timeline-card, .generic-post, [class*='timeline']");
    if (timelineCard) {
      return timelineCard;
    }

    return element.parentElement || element;
  }
}
