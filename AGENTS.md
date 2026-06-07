# AGENTS.md

This file provides guidance for AI coding agents working in this repository.

## Project

`@tedberg/constraint-modeler` is a Vue 3 component library for building visual query constraints and projections. It serializes filter/projection models to syntax, query string, and JSON forms consumed by backend APIs. The repo also includes a Vite demo app hosted on GitHub Pages.

The package is intended for npm consumers. Keep public API, package metadata, generated declarations, and library CSS behavior in mind when changing component internals.

## Current Stack

- Vue 3.5
- Vite 8
- TypeScript 6
- Tailwind CSS 4 with `cm:` prefixed utilities
- Local ShadCN-style primitives backed by `reka-ui`
- `mitt` event bus
- Vitest 4
- Playwright
- Node 24

## Future: Vue Vapor Mode

Vue 3.6 introduces Vapor mode, a compilation strategy that relies on static analysis of `<template>` blocks. JSX render functions are opaque to the Vapor compiler.

Rule: all components should use `<template>` syntax. Do not introduce JSX render functions.

## Commands

```bash
npm run dev              # Vite dev server, default port 8080
npm run build            # Production build of the demo app
npm run build:lib        # Build library output to dist/ (UMD + ESM + CSS + d.ts)
npm run format           # Format src with oxfmt
npm run format:check     # Check src formatting
npm run lint             # oxlint + eslint
npm run typecheck        # vue-tsc --noEmit
npm run test:unit        # Vitest unit tests
npm run test:e2e         # Playwright e2e tests
npm run publish:local    # Build library and yalc push to local consumers
```

Run a single Vitest test file:

```bash
npx vitest run tests/unit/constraint-modeler/model/Model.spec.js
```

Run the focused local e2e suite:

```bash
npm run test:e2e -- --project=chromium
```

Consumer verification after library CSS/package changes:

```bash
npm run publish:local
cd /Users/ted/Development/projects/triview/reef/reef-client
npx playwright test tests/e2e/specs/constraint-modeler-theme.spec.ts --project=chromium
```

## Architecture

### Entry Points

- Library entry: `src/components/entry.ts`
  - Exports the default Vue plugin.
  - Exports `ConstraintModeler`.
  - Exports public resource classes and event types.
- Demo app entry: `src/main.ts`
  - Mounts the standalone demo under `src/demo/`.

### Domain Model

`src/components/constraint-modeler/model/` contains the core query-building logic. It is intentionally separate from Vue component rendering.

- `Model`: root domain object. Owns a `ConstraintGroupModel` tree and optional `ProjectionGroupModel`. Exposes rendering, validation, and apply methods.
- `ConstraintGroupModel`: recursive group with a `JunctionEnum`, child constraints, and child groups.
- `ConstraintModel`: individual filter row.
- `ProjectionModel`: individual projection row.
- `QueryElementModel` and `QueryElementGroupModel`: shared base classes.

### Resource Interface

`AbstractConstraintModelerResource` defines the backend contract:

- `loadProperties(objectName)`: returns property metadata.
- `loadValueList(serverDataType)`: returns enum/dropdown values.
- `validateConstraintModeler(className, constraintList)`: performs server-side validation.
- `loadResultWithConstraints(className, queryString)`: loads result data for applied constraints.

`StubConstraintModelerResource` implements this with static fixture data for demo routes. Consumers should provide their own implementation through the `constraintModelerResource` prop.

### Component Communication

`ConstraintModeler.vue` is the root component. It provides:

- typed mitt emitter via `emitterKey`
- resource instance via `resourceKey`
- dropdown portal ref via `dropdownPortalKey`

Children emit model mutation events through the mitt emitter. The root owns model mutations and event handling.

mitt only supports one payload argument. Multi-value events use array payloads:

```ts
emitter.emit("setJunction", [constraintGroupModel, junctionEnum]);

emitter.on("setJunction", ([constraintGroupModel, junctionEnum]) => {
  constraintGroupModel.setJunction(junctionEnum);
});
```

Use `data-test` and `data-testid` attributes deliberately. Playwright selectors depend on them.

### Enums

`src/components/constraint-modeler/enum/` contains `ComparisonTypeEnum`, `DataTypeEnum`, `JunctionEnum`, `QueryFunctionEnum`, and related enum singletons. These drive operator availability and query rendering.

### Vue Reactive Proxy And Enum Comparisons

The domain model stores enum singleton references. When model objects are made reactive by Vue, enum objects may be proxied. Reference equality against enum singletons can fail.

Avoid this:

```ts
if (dataType === DataTypeEnum.STRING) {}
if (junction !== JunctionEnum.AND) {}
```

Prefer key comparisons:

```ts
if (dataType?.key === DataTypeEnum.STRING.key) {}
if (junction?.key !== JunctionEnum.AND.key) {}
```

Apply this pattern whenever reactive model state is compared to enum constants.

## Library CSS And Theming

Library CSS is built from `src/assets/css/lib.css`.

Important constraints:

- Tailwind utilities are prefixed with `cm:`.
- Tailwind Preflight is not shipped in library CSS.
- Design tokens are scoped to `.constraint-modeler` and `.constraint-modeler-portal`.
- Do not put library design tokens on `:root`.
- Default bar colors should follow `--cm-primary` / `--cm-primary-foreground` through `--cm-bar` / `--cm-bar-foreground`.
- The modeler root is a themed tool surface/panel using card tokens. It is not a ShadCN `Card` public API.

Demo theme CSS is in `src/assets/css/tailwind.css`. Keep demo theme bridges and packaged library defaults aligned when changing `--cm-*` token behavior that consumers should also receive.

## UI Component Guidance

- Prefer existing local primitives under `src/components/ui/`.
- Do not add `shadcn-vue` as a runtime dependency for copied primitives.
- Keep lucide icons for icon-only buttons.
- Keep icon buttons square with stable dimensions.
- Avoid broad CSS resets such as `all: revert-layer` in library components. Prefer explicit isolation styles.
- Watch narrow viewport layout: bars must not spill outside `.constraint-modeler`.

## Testing

Unit tests live in `tests/unit/`.

Playwright tests live in `tests/playwright/`. Selector guidance for those tests is in `tests/playwright/CLAUDE.md`; despite the filename, the guidance applies to all agents.

Key selector rules:

- ShadCN/Reka dropdown triggers render as buttons. Target the button inside the wrapper:

```ts
await page.locator('[data-test="comparison-menu"] button').click();
```

- Do not click the wrapper with `getByTestId` for dropdowns.
- Use role-based menu item selection with exact matching when labels overlap.

## Planning And Specs

Design specs and implementation plans live in:

- `docs/specs/`
- `docs/plans/`

When continuing multi-phase cleanup, update the relevant plan doc as work is completed and record verification commands that actually ran.
