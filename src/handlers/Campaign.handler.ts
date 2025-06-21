import { DomClient } from '../clients/dom/client';
import { State } from '../common/types/State.type';
import { AdHandlerInterface } from './common/interfaces/adHandler.interface';

export class CampaignAdHandler implements AdHandlerInterface {
  private readonly shelfAdClass = ['sponsored-badge', 'shop-promoter'];
  private readonly flaggedShelfAdClass = 'flagged-shelf';

  constructor(private state: State) {}

  public flag(): void {
    this.state.ShelfAdCount = 0;

    const allFlaggedShelfElements = DomClient.getElementsByClass(`.${this.flaggedShelfAdClass}`);
    this.state.ShelfAdCount = allFlaggedShelfElements.length;

    DomClient.getElementsByClass(`li:not(.${this.flaggedShelfAdClass})`).forEach((element) =>
      this.updateCountAndVisibility(element),
    );

    this.shelfAdClass.forEach((adClass) => {
      this.flagElementsBySelector(`.timeline-card .${adClass}:not(.${this.flaggedShelfAdClass})`);
    });
  }

  public visibilityUpdate(): void {
    DomClient.getElementsByClass(`.${this.flaggedShelfAdClass}`).forEach((element) => {
      DomClient.updateElementVisibility(element, !this.state.hideShelfProductAds ? 'hide' : 'show');
    });
  }

  private updateCountAndVisibility(element: Element): void {
    if (
      this.shelfAdClass.some((adClass) => element.classList.contains(adClass)) &&
      !element.classList.contains(this.flaggedShelfAdClass)
    ) {
      const parentElement = element.parentElement;
      if (parentElement && !parentElement.classList.contains(this.flaggedShelfAdClass)) {
        this.state.ShelfAdCount++;
        DomClient.addClassesToElement(parentElement, this.flaggedShelfAdClass);
        DomClient.updateElementVisibility(
          parentElement,
          !this.state.hideShelfProductAds ? 'hide' : 'show',
        );
      }
    }
  }

  private flagElementsBySelector(selector: string): void {
    DomClient.getElementsByClass(selector).forEach((element) => {
      const parentElement = element.parentElement;
      if (parentElement && !parentElement.classList.contains(this.flaggedShelfAdClass)) {
        this.state.ShelfAdCount++;
        DomClient.addClassesToElement(parentElement, this.flaggedShelfAdClass);
        DomClient.updateElementVisibility(
          parentElement,
          !this.state.hideShelfProductAds ? 'hide' : 'show',
        );
      }
    });
  }
}
