---
description: 'Use when creating, editing, or debugging feature decorator files in src/features/. Covers FeatureInstance interface, execute/destroy lifecycle, chrome.runtime.getURL for assets, and helper function placement.'
applyTo: 'src/features/**'
---

# Feature Decorator Conventions

## Interface Contract

Every feature class implements `FeatureInstance` (defined at `src/features/common/FeatureInstance.ts`):

```ts
export interface FeatureInstance {
  execute(): void;
  destroy?(): void;
}
```

- `execute()` is called once on `window.onload` from `background.ts`.
- `destroy()` is optional — implement it when the feature creates DOM nodes or event listeners that may need to be cleaned up (e.g., `UniversalToggleDecorator` removes itself when hidden).

## Instantiation

Features that require `State` receive it via constructor. Features that have no state dependency (e.g., `LogoHatDecorator`) take no arguments. Do not add an empty constructor — omit it entirely.

```ts
// Stateful feature
export class PriceCheckerDecorator implements FeatureInstance {
  constructor(private readonly state: State) {}
  execute(): void { ... }
}

// Stateless feature — no constructor needed
export class LogoHatDecorator implements FeatureInstance {
  execute(): void { ... }
}
```

## Extension Assets

Always reference bundled assets with `chrome.runtime.getURL()`:

```ts
img.src = chrome.runtime.getURL('icons/128.png');
```

Never embed raw external URLs. The icon must be listed in the manifest's `web_accessible_resources` to be accessible from content scripts.

## DOM Helpers

Use `DomClient` for DOM manipulation — do not call `document.querySelector` / `document.createElement` chains inline when a helper already exists:

```ts
DomClient.appendElementToElement(child, parent);
DomClient.addClassesToElement(el, ['my-class']);
```

## Helper Functions

Small pure functions used by a single feature live in `src/features/functions/`. Name them after what they create or compute (e.g., `createLogoElement.ts`, `createBuyMeCoffeeElement.ts`). Each function gets its own file and a corresponding test.

## Style Injection Guards

If a feature injects a `<style>` tag, guard against duplicates with an element ID:

```ts
if (document.getElementById('resk-my-feature-style')) return;
const style = document.createElement('style');
style.id = 'resk-my-feature-style';
document.head.appendChild(style);
```

## Adding a New Feature

1. Create `src/features/<Name>.decorator.ts` implementing `FeatureInstance`.
2. If it reads or writes state, accept `state: State` in the constructor.
3. Instantiate it in `background.ts` and call `execute()` inside `initializer()`.
4. If it can be toggled off, wire a `chrome.runtime.onMessage` branch and call `destroy()` when hidden.
5. Write a test file at `test/features/<Name>.decorator.test.ts`.
