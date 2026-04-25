---
description: 'Use when writing or editing test files in test/. Covers Vitest patterns, mock State construction, DomClient mocking, chrome API mocks, and AAA structure.'
applyTo: 'test/**'
---

# Test Conventions

## Framework

All tests use **Vitest**. Run with `npm test` (single pass) or `npm run test:watch` (watch mode).

## File Location

Test files mirror the source tree under `test/`:

| Source                                        | Test                                                |
| --------------------------------------------- | --------------------------------------------------- |
| `src/handlers/ListProductAd.handler.ts`       | `test/handlers/ListProductAd.handler.test.ts`       |
| `src/features/PriceChecker.decorator.ts`      | `test/features/PriceChecker.decorator.test.ts`      |
| `src/features/functions/createLogoElement.ts` | `test/features/functions/createLogoElement.test.ts` |
| `src/clients/dom/client.ts`                   | `test/clients/dom/client.test.ts`                   |

## Structure (AAA)

```ts
describe('MyClass', () => {
  let subject: MyClass;
  let mockState: State;

  beforeEach(() => {
    vi.resetAllMocks();
    mockState = { /* all required fields */ };
    subject = new MyClass(mockState);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should <expected behaviour>', () => {
    // Arrange
    vi.mocked(DomClient.getElementsByClass).mockReturnValue([...]);

    // Act
    subject.flag();

    // Assert
    expect(mockState.productAdCount).toBe(2);
  });
});
```

## Mock State

`State` has **no optional fields** — every property must be provided. Use these defaults and override only what the test exercises:

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

If TypeScript reports a missing property, add it to this object — do not make the `State` type optional.

## Mocking DomClient

Mock at module level with `vi.mock` before the `describe` block:

```ts
vi.mock('../../src/clients/dom/client', () => ({
  DomClient: {
    getElementsByClass: vi.fn(),
    addClassesToElement: vi.fn(),
    updateElementVisibility: vi.fn(),
    appendElementToElement: vi.fn(),
  },
}));
```

## Chrome API

The `chrome` global is set up in `test/setup.ts` and includes:

- `chrome.runtime.sendMessage`
- `chrome.runtime.getURL` — returns `chrome-extension://test-extension-id/<path>`
- `chrome.storage.local.get` / `chrome.storage.local.set`
- `chrome.runtime.lastError`

Do not re-mock these in individual test files unless you need to override a specific return value.

## Visibility Logic Tests

When testing `visibilityUpdate()` on handlers, remember the intentional polarity:

| `hideX` | Expected `updateElementVisibility` call |
| ------- | --------------------------------------- |
| `false` | `'hide'`                                |
| `true`  | `'show'`                                |
