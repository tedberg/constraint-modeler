# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

`@tedberg/constraint-modeler` — a Vue component library for building visual query constraints (filters + projections) that serialize to a query string / JSON format consumed by a backend API. Published to npm. Includes a demo app hosted on GitHub Pages at `https://tedberg.github.io/constraint-modeler/`.

The consuming project uses `bootstrap@^5.3.0` + `bootstrap-vue-next@^0.45.0`. Longer-term plan is to replace Bootstrap with Tailwind + shadcn-vue, so component boundaries should stay clean.

## Commands

```bash
npm run serve          # Vue CLI dev server (port 8080)
npm run build          # Production build of demo app
npm run build:lib      # Build library output to dist/ (UMD + ESM)
npm run test:unit      # Jest unit tests
npm run test:e2e       # Build + run Cypress e2e (headless)
npm run cypress        # Run Cypress interactively
npm run lint           # ESLint
```

Run a single Jest test file:
```bash
npx jest tests/unit/constraint-modeler/model/Model.spec.js
```

## Architecture

### Two entry points

- **Library** (`src/components/entry.js`) — exports `ConstraintModeler` as a Vue plugin for npm consumers
- **Demo app** (`src/main.js` → `src/demo/`) — a standalone Vue app with 5 routes demonstrating the component

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

`ConstraintModeler.vue` is the root component. It uses `provide` to inject itself as `modelListener` to all descendant components. Children emit events upward via `this.$emit('setProperty', ...)` etc., and the root handles all model mutations in `mounted()` via `this.$on(...)`. This is a Vue 2 event bus pattern that will change in the Vue 3 migration.

`data-test` attributes on interactive elements are used for e2e selectors. The `vue-cli-plugin-test-attrs` plugin strips `data-cy` and `data-xtest` attributes from production builds. Note: some components use hardcoded IDs like `#test_valueEntry-11000` — these are fragile and will be replaced with `data-testid` during the Playwright migration.

### Enums

`src/components/constraint-modeler/enum/` — `ComparisonTypeEnum`, `DataTypeEnum`, `JunctionEnum`, `QueryFunctionEnum`, etc. These drive which operators appear for a given property's `simpleDataType`.

## Testing

- **Unit tests** (Jest): `tests/unit/` — cover models, enums, and a few component snapshots
- **E2e tests** (Cypress): `tests/e2e/specs/` — 5 specs matching the 5 demo routes

## Migration status

Currently Vue 2 / Vue CLI 4 / Bootstrap-Vue 2 / Cypress 4. Active migration to Vue 3.5 / Vite 8 / bootstrap-vue-next / Playwright. See `.claude/superpowers/specs/2026-05-11-modernization-design.md` for the full plan.

## Superpowers / AI tooling

Design specs and implementation plans live in `.claude/superpowers/specs/` (not in `docs/`, which is reserved for GitHub Pages content).
