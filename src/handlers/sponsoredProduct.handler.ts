import { DomClient } from '../clients/dom/client';
import { State } from '../common/types/State.type';

export class SponsoredProductHandler {
  private state: State;

  constructor(state: State) {
    this.state = state;
  }

  public flag(): void {
    this.updateSponsoredCount();

    const nonFlaggedProductListItems = document.querySelectorAll('li:not(.flagged-product)');

    [...nonFlaggedProductListItems]?.filter(this.isSponsored)?.forEach((listItem) => {
      DomClient.flagElementAsSponsored(listItem);
      DomClient.updateSponsoredTextSingle(listItem, this.state.language);
      this.state.productAdCount++;
      DomClient.toggleElementVisibility(listItem, this.state);
    });

    [...nonFlaggedProductListItems]?.filter(this.hasFlaggedLabelText)?.forEach((listItem) => {
      DomClient.flagElementAsSponsored(listItem);
      DomClient.updateSponsoredTextSingle(listItem, this.state.language);
      DomClient.toggleElementVisibility(listItem, this.state);
    });

    const shopPromoterElements = document.querySelectorAll('.shop-promoter:not(.flagged-product)');

    shopPromoterElements?.forEach((element) => {
      const parentElement = this.findParentToFlag(element);
      if (parentElement) {
        DomClient.flagElementAsSponsored(parentElement);
        this.state.productAdCount++;
        DomClient.toggleElementVisibility(parentElement, this.state);
      }
    });

    document
      .querySelectorAll('.card.tracking-img-container:not(.flagged-product)')
      .forEach((card) => {
        const shopPromoter = card.querySelector('.shop-promoter');
        if (shopPromoter) {
          card.classList.add('flagged-product');

          const labelText = shopPromoter.querySelector('.label-text');
          if (labelText) {
            labelText.classList.add('flagged-product-label');
          }

          this.state.productAdCount++;

          if (!this.state.hideProductAds) {
            card.classList.add('display-none');
          } else {
            card.classList.remove('display-none');
          }
        }
      });
  }

  private updateSponsoredCount(): void {
    const flaggedProductLists = document.querySelectorAll('li.flagged-product');
    const flaggedProductDivs = document.querySelectorAll('div.flagged-bought-together');
    const flaggedCardElements = document.querySelectorAll('.card.flagged-product');

    if (
      flaggedProductLists?.length === 0 &&
      flaggedProductDivs?.length === 0 &&
      flaggedCardElements?.length === 0
    ) {
      this.state.productAdCount = 0;
    }
  }

  private isSponsored(listItem: Element): boolean {
    const labelTextElement = listItem.querySelector('.label-text');
    if (DomClient.isElementSponsored(labelTextElement)) {
      return true;
    }

    return false;
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
