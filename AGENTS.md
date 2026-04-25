# reSkroutzed — Agent Instructions

## Project Overview

**reSkroutzed** is a Chrome and Firefox Manifest V3 browser extension that enhances [skroutz.gr](https://skroutz.gr) by flagging and hiding sponsored products, providing a price-checker against "Buy through Skroutz" pricing, and adding quality-of-life UI (dark mode, universal toggle overlay).

- Language: TypeScript (`es2016` target, `commonjs` modules)
- Bundler: Webpack (Chrome and Firefox builds are separate)
- Test runner: Vitest (`npm test`)
- Node: ≥ 18

## Build & Test Commands

```bash
npm test                  # run all tests (151 tests, must all pass)
npm run build:chrome      # outputs to build/chrome_build/
npm run build:firefox     # outputs to build/firefox_build/
npm run lint              # ESLint on all TS files
npm run format            # Prettier on src/
```

After any source change, **always run `npm test`** before considering the task done.

## Architecture

```
src/
  background.ts           # Content script — entry point injected into skroutz.gr pages
  service_worker.ts       # MV3 service worker — bridges BestPrice API calls
  clients/
    browser/              # BrowserClient: chrome.storage + locale/mobile detection
    dom/                  # DomClient: DOM manipulation helpers
    skroutz/              # SkroutzClient: fetches product data from Skroutz API
    best_price/           # BestPriceClient: fetches BestPrice store listings
  common/
    types/State.type.ts   # Shared mutable State object (see below)
    enums/                # Language enum
  features/               # FeatureInstance decorators (execute once on page load)
  handlers/               # AdHandlerInterface implementors (flag + visibilityUpdate)
  css/                    # Injected stylesheets
```

## The `State` Object

`State` (`src/common/types/State.type.ts`) is a single plain object shared by reference across all handlers and features. It is initialized in `background.ts`, populated by `loadStorage()`, then mutated directly:

- All properties are **required** — no optional (`?`) fields.
- Counters (`productAdCount`, `shelfAdCount`, etc.) are incremented by handlers during `flag()`.
- Visibility booleans (`hideProductAds`, etc.) are toggled by the popup via `chrome.runtime.onMessage`.

## Clients

- **BrowserClient** (`clients/browser/`) — `getValue`/`setValue` wrappers over `localStorage` and `chrome.storage.local`. Use these, never `localStorage` directly.
- **DomClient** (`clients/dom/`) — static helpers: `getElementsByClass`, `addClassesToElement`, `updateElementVisibility`, `appendElementToElement`. Use these, never `document.querySelector` directly in handlers/features.
- **SkroutzClient** (`clients/skroutz/`) — fetches product metadata and price history from Skroutz's internal API.
- **BestPriceClient** (`clients/best_price/`) — fetches competing store prices from bestprice.gr.

## Key Conventions

- `camelCase` for variables, properties, functions
- `PascalCase` for classes, types, interfaces
- `UPPER_SNAKE_CASE` for constants and enum values
- No `any` — use `unknown` if type is unavailable
- No redundant type casts — if a `NodeListOf<HTMLElement>` is declared, do not cast elements again inside `forEach`
- No empty constructors — omit `constructor() {}` entirely
- Use `chrome.runtime.getURL('path')` for bundled assets, never raw external URLs
- Dead commented-out code must not be left in source files

## Handlers (`src/handlers/`)

Each handler implements `AdHandlerInterface`:

```ts
interface AdHandlerInterface {
  flag(): void; // walk DOM, count elements, add CSS marker classes
  visibilityUpdate(): void; // show/hide flagged elements based on state
}
```

### `flag()` pattern

```ts
flag(): void {
  this.state.productAdCount = 0;                          // 1. reset counter
  const flagged = DomClient.getElementsByClass('flagged-product');
  this.state.productAdCount += flagged.length;            // 2. count already-flagged
  const items = DomClient.getElementsByClass('js-product-list-item');
  items.forEach((item) => {
    if (this.isSponsored(item)) {
      DomClient.addClassesToElement(item, ['flagged-product']);
      this.state.productAdCount++;                        // 3. flag + count new
    }
  });
}
```

### `visibilityUpdate()` pattern — **do not invert this logic**

```ts
visibilityUpdate(): void {
  const elements = DomClient.getElementsByClass('flagged-product');
  elements.forEach((el) => {
    DomClient.updateElementVisibility(el, !this.state.hideProductAds ? 'hide' : 'show');
  });
}
```

| `hideX` value     | Meaning                                     | Element state |
| ----------------- | ------------------------------------------- | ------------- |
| `false` (default) | Ads are **blocked** — filtered from view    | `'hide'`      |
| `true`            | User turned filtering **off** — ads visible | `'show'`      |

### Counter ↔ Visibility property mapping

| Handler                   | Counter                       | Visibility flag         |
| ------------------------- | ----------------------------- | ----------------------- |
| `ListProductAdHandler`    | `productAdCount`              | `hideProductAds`        |
| `ShelfProductAdHandler`   | `shelfAdCount`                | `hideShelfProductAds`   |
| `RecommendationAdHandler` | `recommendationAdCount`       | `hideRecommendationAds` |
| `VideoAdHandler`          | `videoAdCount`                | `hideVideoAds`          |
| `SponsorshipAdHandler`    | `sponsorshipAdCount`          | `hideSponsorships`      |
| `CampaignAdHandler`       | `sponsorshipAdCount` (shared) | `hideSponsorships`      |

## Features (`src/features/`)

Each feature implements `FeatureInstance`:

```ts
interface FeatureInstance {
  execute(): void; // called once on window.onload
  destroy?(): void; // optional — clean up DOM nodes / listeners
}
```

- Stateful features accept `state: State` in the constructor; stateless ones take no arguments.
- Always use `chrome.runtime.getURL('icons/128.png')` for bundled assets.
- Guard injected `<style>` tags against duplicates with a unique element ID.
- Helper functions shared within a feature go in `src/features/functions/`, one file each with a matching test.

## Tests (`test/`)

- Framework: Vitest. Run: `npm test`.
- File layout mirrors `src/` under `test/`.
- Every test file uses AAA (Arrange / Act / Assert).
- `State` has **no optional fields**. All required properties must be present in every mock:

```ts
mockState = {
  hideProductAds: false,
  hideVideoAds: false,
  hideSponsorships: false,
  hideShelfProductAds: false,
  hideRecommendationAds: false,
  hideAISlop: false,
  hideUniversalToggle: false,
  productAdCount: 0,
  shelfAdCount: 0,
  recommendationAdCount: 0,
  videoAdCount: 0,
  sponsorshipAdCount: 0,
  language: Language.GREEK,
  darkMode: false,
  minimumPriceDifference: 0,
  isMobile: false,
};
```

- Mock `DomClient` at module level with `vi.mock`.
- `chrome.runtime.getURL` is mocked in `test/setup.ts` — do not re-mock it per file.

## File Locations

| Concern              | Path                                                    |
| -------------------- | ------------------------------------------------------- |
| Shared state type    | `src/common/types/State.type.ts`                        |
| Ad handler interface | `src/handlers/common/interfaces/adHandler.interface.ts` |
| Feature interface    | `src/features/common/FeatureInstance.ts`                |
| Browser storage keys | `src/clients/browser/client.ts` (`StorageKey` enum)     |
| Test global mocks    | `test/setup.ts`                                         |
| Chrome manifest      | `manifests/manifest_chrome.json`                        |
| Firefox manifest     | `manifests/manifest_firefox.json`                       |

## Documentation

- `docs/CODE_STYLE.md` — coding standards and naming conventions
- `docs/README.md` — user-facing feature overview and dev setup
- `docs/RELEASING.md` — tagging and publishing workflow
