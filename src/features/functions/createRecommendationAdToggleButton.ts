import { BrowserClient, StorageKey } from '../../clients/browser/client';
import { DomClient } from '../../clients/dom/client';
import { buildSvg, ICON } from './icons';
import { ToggleButtonContext } from './toggleButtonContext';

export function createRecommendationAdToggleButton(ctx: ToggleButtonContext): HTMLButtonElement {
  const { state, recommendationAdHandler } = ctx;
  const button = document.createElement('button');
  button.classList.add('toggle-option-button', 'recommendation-ad-toggle-option');
  button.title = state.hideRecommendationAds
    ? 'Hide Recommendation Ads'
    : 'Show Recommendation Ads';

  const svg = buildSvg(ICON.sparkle);
  DomClient.appendElementToElement(svg, button);

  const recommendationNotificationBubble = document.createElement('div');
  recommendationNotificationBubble.classList.add(
    'notification-bubble',
    'recommendation-notification',
  );
  recommendationNotificationBubble.textContent = `${state.recommendationAdCount}`;
  DomClient.appendElementToElement(recommendationNotificationBubble, button);

  const updateRecommendationNotificationCount = (): void => {
    const flaggedRecommendationElements = document.querySelectorAll('.flagged-recommendation');

    if (flaggedRecommendationElements.length !== state.recommendationAdCount) {
      state.recommendationAdCount = flaggedRecommendationElements.length;
    }

    recommendationNotificationBubble.textContent = `${state.recommendationAdCount}`;
    recommendationNotificationBubble.style.display =
      state.recommendationAdCount === 0 ? 'none' : 'flex';
  };

  updateRecommendationNotificationCount();
  setInterval(updateRecommendationNotificationCount, 2000);

  if (!state.hideRecommendationAds) {
    button.classList.add('active');
  }

  button.addEventListener('click', (e) => {
    e.stopPropagation();
    state.hideRecommendationAds = !state.hideRecommendationAds;

    BrowserClient.setValue(StorageKey.RECOMMENDATION_AD_VISIBILITY, state.hideRecommendationAds);

    recommendationAdHandler.visibilityUpdate();
    button.classList.toggle('active');
    button.title = state.hideRecommendationAds
      ? 'Hide Recommendation Ads'
      : 'Show Recommendation Ads';
  });

  return button;
}
