# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

`@tedberg/constraint-modeler` — a Vue component library for building visual query constraints (filters + projections) that serialize to a query string / JSON format consumed by a backend API. Published to npm. Includes a demo app hosted on GitHub Pages at `https://tedberg.github.io/constraint-modeler/`.

The consuming project uses `bootstrap@^5.3.0` + `bootstrap-vue-next@^0.45.0`. Longer-term plan is to replace Bootstrap with Tailwind + shadcn-vue, so component boundaries should stay clean.

## Future: Vue Vapor mode

Vue 3.6 introduces Vapor mode — a compilation strategy that replaces the virtual DOM with direct DOM manipulation. Vapor works by statically analyzing `<template>` blocks; components using JSX render functions are opaque to the Vapor compiler and can't be opted in.

**Rule:** All components must use `<template>` syntax (no JSX render functions). This keeps every component Vapor-eligible when we upgrade to 3.6.

## Commands

```bash
npm run dev            # Vite dev server (port 8080)
npm run build          # Production build of demo app
npm run build:lib      # Build library output to dist/ (UMD + ESM)
npm run test:unit      # Vitest unit tests
npm run test:e2e:pw    # Playwright e2e tests (requires dev server running)
npm run test:e2e:pw:ui # Playwright UI mode
npm run lint           # ESLint
```

Run a single Vitest test file:
```bash
npx vitest run tests/unit/constraint-modeler/model/Model.spec.js
```

## Architecture

### Two entry points

- **Library** (`src/components/entry.js`) — exports `ConstraintModeler` as a Vue 3 plugin for npm consumers
- **Demo app** (`src/main.js` → `src/demo/`) — a standalone Vue 3 app with 5 routes demonstrating the component

### Domain model (pure JS, no Vue)

`src/components/constraint-modeler/model/` contains the core logic:

- **`Model`** — root domain object. Owns a `ConstraintGroupModel` tree and an optional `ProjectionGroupModel`. Exposes `renderSyntax()`, `renderQueryString()`, `renderSimpleJSON()`, `validate()`, and `apply()`.
- **`ConstraintGroupModel`** — recursive: has a `JunctionEnum` (AND/OR), a list of `ConstraintModel`s, and a list of child `ConstraintGroupModel`s.
- **`ConstraintModel`** / **`ProjectionModel`** — individual constraint/projection rows.
- **`QueryElementModel`** / **`QueryElementGroupModel`** — shared base classes.

### Resource interface

`AbstractConstraintModelerResource` defines the contract for backend calls:
- `loadProperties(objectName)` — returns `{ propertyList, multiPropertyList }`
- `loadValueList(serverDataType)` — returns enum values for dropdowns
- `validateConstraintModeler(className, constraintList)` — server-side validation
- `loadResultWithConstraints(className, queryString)` — paginated data results

`StubConstraintModelerResource` implements this with static fixture data — used by all demo views. Consumers provide their own implementation via the `constraintModelerResource` prop.

### Component communication

`ConstraintModeler.vue` is the root component. It uses `provide` to inject `modelListener: this` and `constraintModelerResource` to all descendants. Children emit events upward via `this.modelListener.emitter.emit(...)`, and the root handles all model mutations in `mounted()` via `this.emitter.on(...)` (mitt event bus).

**mitt multi-arg pattern:** mitt only supports one payload argument. Multi-arg events use array wrapping:
```javascript
// Child emits:
this.modelListener.emitter.emit('setJunction', [constraintGroupModel, junctionEnum]);
// ConstraintModeler listens:
this.emitter.on('setJunction', ([constraintGroupModel, junctionEnum]) => { ... });
```

`data-test` and `data-testid` attributes on interactive elements are used for Playwright selectors.

### Enums

`src/components/constraint-modeler/enum/` — `ComparisonTypeEnum`, `DataTypeEnum`, `JunctionEnum`, `QueryFunctionEnum`, etc. These drive which operators appear for a given property's `simpleDataType`.

### ⚠️ Vue 3 reactive proxy and enum comparisons

The domain model classes (`ConstraintModel`, `ConstraintGroupModel`, etc.) are plain JS and store enum singleton references (e.g. `this.dataType = DataTypeEnum.STRING`). When stored inside Vue's `data()`, Vue 3's `reactive()` deep-wraps these objects in a Proxy. This **breaks `===` reference equality** against the original enum singletons.

**Symptom:** A check like `this.dataType === DataTypeEnum.STRING` silently returns `false` even though the value is conceptually STRING, because the left side is `Proxy(DataTypeEnum.STRING)`.

**Fix:** Compare by `.key` (string) instead of reference identity:
```javascript
// BROKEN in Vue 3 reactive context:
if (this.dataType === DataTypeEnum.STRING)
if (this.junction !== JunctionEnum.AND)

// CORRECT:
if (this.dataType?.key === DataTypeEnum.STRING.key)
if (this.junction?.key !== JunctionEnum.AND.key)
```

Apply this pattern whenever a model class stored in Vue `data()` needs to compare against enum constants.

## Testing

- **Unit tests** (Vitest): `tests/unit/` — cover models, enums, and component structure checks
- **E2e tests** (Playwright): `tests/playwright/` — 13 specs covering all demo routes and feature scenarios

### Playwright selector patterns

See `tests/playwright/CLAUDE.md` for full documentation. Key rules:

- `b-nav-item-dropdown` toggles must be clicked via `a.nav-link`, not on the outer `<li>`:
  ```typescript
  page.locator('[data-test="comparison-menu"] a.nav-link').click()  // ✅
  page.getByTestId('comparison-menu').click()                       // ❌
  ```
- Junction menu: `subGroup.locator('.constraint-group-bar a.nav-link').click()`
- Projection property menu: `projection.locator('[data-testid="projection-property-menu"] a.nav-link').click()`

## Tech stack (current)

Vue 3.5 / Vite 8 / bootstrap-vue-next 0.45 / Vue Router 4 / mitt / Vitest 4 / Playwright / Node 24

## Superpowers / AI tooling

Design specs and implementation plans live in `.claude/superpowers/specs/` and `.claude/superpowers/plans/` (not in `docs/`, which is reserved for GitHub Pages content).
