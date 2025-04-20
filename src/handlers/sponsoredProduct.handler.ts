import { DomClient } from '../clients/dom/client';
import { State } from '../common/types/State.type';
import { BaseHandler } from './base.handler';

// replaced
export class SponsoredProductHandler extends BaseHandler {
  private readonly productAdClass = ['labeled-item', 'labeled-product', 'flagged-list-title'];
  private readonly flaggedProductAdClass = 'flagged-product';

  constructor(state: State) {
    super(state);
  }

  public flag(): void {
    this.updateSponsoredCount();

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

    const shopPromoterElements = this.getElements('.shop-promoter:not(.flagged-product)');

    shopPromoterElements.forEach((element) => {
      const parentElement = this.findParentToFlag(element);

      if (parentElement) {
        DomClient.flagElementAsSponsored(parentElement);
        this.state.productAdCount++;
        this.toggleElementVisibility(parentElement, !this.state.hideProductAds);
      }
    });

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

  public visibilityUpdate(): void {
    this.getElements(`.${this.flaggedProductAdClass}`).forEach((element) => {
      DomClient.updateElementVisibility(element, !this.state.hideProductAds ? 'hide' : 'show');
    });
  }

  private updateSponsoredCount(): void {
    this.state.productAdCount = 0;
    const allFlaggedProductElements = this.getElements(`.${this.flaggedProductAdClass}`);
    this.state.productAdCount = allFlaggedProductElements.length;
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
