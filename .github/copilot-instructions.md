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

### The `State` Object

`State` (`src/common/types/State.type.ts`) is a single plain object shared by reference across all handlers and features. It is initialized in `background.ts`, populated by `loadStorage()`, then mutated directly:

- All properties are **required** — no optional (`?`) fields.
- Counters (`productAdCount`, `shelfAdCount`, etc.) are incremented by handlers during `flag()`.
- Visibility booleans (`hideProductAds`, etc.) are toggled by the popup via `chrome.runtime.onMessage`.

### Handlers (`src/handlers/`)

Each handler implements `AdHandlerInterface` with two methods:

- `flag()` — walks the DOM, counts matching elements, adds CSS marker classes
- `visibilityUpdate()` — shows or hides flagged elements based on state

**Visibility logic convention**: `!hideX ? 'hide' : 'show'` — when `hideX = false` the ad is blocked (hidden from the user); when `hideX = true` it is shown. This naming is intentional.

See `.github/instructions/handlers.instructions.md` for handler implementation details.

### Features (`src/features/`)

Each feature implements `FeatureInstance` with `execute()` (and optionally `destroy()`). Features are instantiated once in `background.ts` and called on `window.onload`.

See `.github/instructions/features.instructions.md` for feature implementation details.

### Clients

- **BrowserClient** (`clients/browser/`) — synchronous `getValue`/`setValue` wrappers over `localStorage` (sync) and `chrome.storage.local` (async bridge via service worker). Use these, never `localStorage` directly.
- **DomClient** (`clients/dom/`) — static helpers: `getElementsByClass`, `addClassesToElement`, `updateElementVisibility`, `appendElementToElement`. Use these, never `document.querySelector` directly in handlers/features.
- **SkroutzClient** (`clients/skroutz/`) — fetches product metadata and price history from Skroutz's internal API.
- **BestPriceClient** (`clients/best_price/`) — fetches competing store prices from bestprice.gr.

## Key Conventions

- `camelCase` for variables, properties, functions
- `PascalCase` for classes, types, interfaces
- `UPPER_SNAKE_CASE` for constants and enum values
- No `any` — use `unknown` if type is unavailable
- No redundant type casts — if a `NodeList` is already typed as `NodeListOf<HTMLElement>`, do not re-cast elements inside `forEach`
- No empty constructors — omit `constructor() {}` entirely
- Use `chrome.runtime.getURL('path')` for extension-bundled assets, never raw external URLs
- Dead commented-out code must not be left in source files

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

## Existing Documentation

- `docs/CODE_STYLE.md` — coding standards and naming conventions
- `docs/README.md` — user-facing feature overview and dev setup
- `docs/RELEASING.md` — tagging and publishing workflow
