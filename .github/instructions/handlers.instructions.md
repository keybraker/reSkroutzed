---
description: 'Use when creating, editing, or debugging ad handler files in src/handlers/. Covers AdHandlerInterface, flag/visibilityUpdate contracts, State counter conventions, visibility logic semantics, and test file placement.'
applyTo: 'src/handlers/**'
---

# Ad Handler Conventions

## Interface Contract

Every handler class implements `AdHandlerInterface` (defined at `src/handlers/common/interfaces/adHandler.interface.ts`):

```ts
export interface AdHandlerInterface {
  flag(): void;
  visibilityUpdate(): void;
}
```

Handlers receive `state: State` via constructor and hold a reference to it — they must not copy state values; always read `this.state.*` live.

## `flag()` Responsibilities

1. Reset the handler's counter to `0` at the start of every call.
2. Check for already-flagged elements (guard against double-counting on re-runs).
3. Walk the DOM using `DomClient.getElementsByClass(selector)`.
4. Add CSS marker classes via `DomClient.addClassesToElement(element, ['flagged-x'])`.
5. Increment the corresponding `state.*AdCount` property.

```ts
flag(): void {
  this.state.productAdCount = 0;

  const flagged = DomClient.getElementsByClass('flagged-product');
  this.state.productAdCount += flagged.length;

  const items = DomClient.getElementsByClass('js-product-list-item');
  items.forEach((item) => {
    if (this.isSponsored(item)) {
      DomClient.addClassesToElement(item, ['flagged-product']);
      this.state.productAdCount++;
    }
  });
}
```

## `visibilityUpdate()` Responsibilities

Toggle visibility of all previously-flagged elements using `DomClient.updateElementVisibility`:

```ts
visibilityUpdate(): void {
  const elements = DomClient.getElementsByClass('flagged-product');
  elements.forEach((el) => {
    DomClient.updateElementVisibility(el, !this.state.hideProductAds ? 'hide' : 'show');
  });
}
```

### Visibility Logic Semantics (critical — do not invert)

The convention `!hideX ? 'hide' : 'show'` is **intentional**:

| `hideX` value     | Meaning                                             | Element state |
| ----------------- | --------------------------------------------------- | ------------- |
| `false` (default) | Ads are **blocked** (filtered out for the user)     | `'hide'`      |
| `true`            | User has turned filtering **off** — ads are visible | `'show'`      |

The naming is misleading but the logic is correct and backed by tests. Do not change this polarity.

## State Counter Properties

| Handler                   | Counter property                    | Visibility property           |
| ------------------------- | ----------------------------------- | ----------------------------- |
| `ListProductAdHandler`    | `state.productAdCount`              | `state.hideProductAds`        |
| `ShelfProductAdHandler`   | `state.shelfAdCount`                | `state.hideShelfProductAds`   |
| `RecommendationAdHandler` | `state.recommendationAdCount`       | `state.hideRecommendationAds` |
| `VideoAdHandler`          | `state.videoAdCount`                | `state.hideVideoAds`          |
| `SponsorshipAdHandler`    | `state.sponsorshipAdCount`          | `state.hideSponsorships`      |
| `CampaignAdHandler`       | `state.sponsorshipAdCount` (shared) | `state.hideSponsorships`      |

## Adding a New Handler

1. Create `src/handlers/<Name>.handler.ts` implementing `AdHandlerInterface`.
2. Add a required counter property and a required visibility boolean to `State` in `src/common/types/State.type.ts`.
3. Initialize both in `background.ts` (`loadStorage()` + the `state` literal).
4. Instantiate and wire into `flagContent()` and `toggleVisibility()` in `background.ts`.
5. Add a `chrome.runtime.onMessage` branch for the popup toggle.
6. Write a test file at `test/handlers/<Name>.handler.test.ts`.
