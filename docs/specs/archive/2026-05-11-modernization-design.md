# Constraint Modeler Modernization Design

**Date:** 2026-05-11  
**Author:** Ted Bergeron  
**Status:** Approved

## Overview

Modernize `@tedberg/constraint-modeler` from Vue 2 / Vue CLI 4 / Cypress 4 to Vue 3.5 / Vite 8 / Playwright, with a Playwright e2e baseline established before any migration work begins. The library build output (UMD + ESM) must be preserved throughout.

## Context

- Vue 2 component library with a demo app, published to npm as `@tedberg/constraint-modeler`
- Currently uses Bootstrap-Vue 2, Vue CLI 4, Vue Router 3, Cypress 4, Jest
- Node 24 in use; engine field in package.json is stale (currently says ≥8)
- Consuming project already on `bootstrap@^5.3.0` + `bootstrap-vue-next@^0.45.0`
- Longer-term plan: replace Bootstrap with Tailwind + shadcn-vue (component boundaries must stay clean)
- Existing Cypress e2e specs cover all 5 demo pages; some selectors use fragile hardcoded IDs

## Approach

Sequential phases, each gated by a green Playwright suite. No phase begins until the previous exit gate passes.

**Tool choices:**
- **Playwright** (not Vercel Agent Browser) — assertion-driven tests for CI/CD, Trace Viewer, cross-browser support
- **Options API first** — minimal churn for the Vue 3 port; Composition API rewrite is a follow-up phase
- **bootstrap-vue-next** — matches the consuming project; component boundaries kept clean for future Tailwind swap

---

## Phase 0 — Foundation

- Create `CLAUDE.md` documenting project purpose, tech stack, build commands, test strategy, and migration status
- Commit as baseline

---

## Phase 1 — Playwright E2E Baseline

**Goal:** Establish a green test suite against the current Vue 2 app before touching any production code.

**Setup:**
- Install `@playwright/test`, configure for local dev server (`http://localhost:8080`)
- Add `playwright.config.ts` at project root
- Add `test:e2e:pw` script to `package.json`
- Keep existing Cypress setup intact during this phase

**Test files** (mirror Cypress specs 1:1):
- `tests/playwright/simple.spec.ts`
- `tests/playwright/debug.spec.ts`
- `tests/playwright/with-projection.spec.ts`
- `tests/playwright/persistent.spec.ts`
- `tests/playwright/everything.spec.ts`

**Selector strategy:**
- Port selectors as-is including hardcoded IDs (`#test_valueEntry-11000`) — these are deterministic and will be hardened in Phase 2
- Use `testIdAttribute: 'data-test'` in Playwright config to leverage existing `data-test` attrs
- Use `getByText()` for button labels

**Assertions per spec:**
- `simple`: add constraint, set field/operator/value, verify syntax output
- `debug`: add constraint, verify syntax, query string, and JSON outputs
- `with-projection`: add constraint + 2 projections, verify syntax output
- `persistent`: load pre-defined constraint, verify syntax output
- `everything`: load pre-defined constraint, verify syntax, query string, and JSON outputs

**Exit gate:** All 5 specs pass against `npm run serve` (Vue 2 dev server)

---

## Phase 2 — Test Improvement & Expansion

**Goal:** Harden the Playwright suite and expand coverage against the Vue 2 app — this becomes the migration safety net.

**Selector improvements:**
- Replace hardcoded IDs (`#test_valueEntry-11000`) with stable `data-testid` / `getByTestId()` locators
- Ensure all interactive elements have stable `data-testid` attrs in source

**New test scenarios:**
- Constraint group nesting (And within Or, etc.)
- Removing constraints and groups
- Clearing the entire modeler
- All comparison operators across different data types
- Projection reordering / removal
- Save and reload (Persistent page)
- Syntax output validation: query string and JSON for all pages that support it

**Exit gate:** Expanded suite green against Vue 2 app

---

## Phase 3 — Vue 3.5 + Vite 8 Migration

**Goal:** Migrate the app and library to Vue 3.5 + Vite 8, keeping Options API, verified by the Phase 2 expanded Playwright suite.

**Build tooling:**
- Remove `@vue/cli-service`, `@vue/cli-plugin-*`, `vue-template-compiler`
- Add `vite@8`, `@vitejs/plugin-vue`
- Add `vite.config.ts` with:
  - Dev server on port 8080 (matches Playwright config)
  - Library build mode: UMD + ESM outputs targeting `dist/`
  - `publicPath` equivalent: `/constraint-modeler/` in production

**Dependencies:**
| Old | New |
|-----|-----|
| `vue@^2.6` | `vue@^3.5` |
| `vue-router@^3` | `vue-router@^4` |
| `bootstrap-vue@^2` | `bootstrap@^5.3.0` + `bootstrap-vue-next@^0.45.0` |
| `vue-template-compiler` | removed |
| `@vue/cli-service` | `vite@8` |
| `node-sass` / `sass-loader` | `sass` (dart sass) |
| `axios@^0.19` | `axios@^1.x` |

**Component migration (Options API):**
- Update lifecycle hooks: `beforeDestroy` → `beforeUnmount`, `destroyed` → `unmounted`
- Update `Vue.set` / `this.$set` → direct assignment (Vue 3 reactive)
- Update `Vue.delete` / `this.$delete` → `delete` operator
- Update filters (removed in Vue 3) → methods or computed
- Update `$listeners` / `$attrs` merging behavior (Vue 3 unified)
- Update `v-model` (Vue 3 uses `modelValue` / `update:modelValue`)
- Update `bootstrap-vue` components → `bootstrap-vue-next` equivalents

**Entry point / plugin registration:**
- Update `src/components/entry.js` for Vue 3 plugin API (`install(app)` instead of `Vue.use`)
- Update `src/main.js` for `createApp()`
- Update `src/demo/router.js` for `createRouter()` / `createWebHistory()`

**Library build output** (must be preserved):
- `dist/constraint-modeler.umd.js`
- `dist/constraint-modeler.common.js` (or ESM equivalent)
- `dist/constraint-modeler.css`
- `package.json` `main` / `module` / `exports` fields updated accordingly

**Unit tests:**
- Migrate Jest → Vitest (ships with Vite, minimal config change)
- Update `@vue/test-utils` to v2

**Exit gate:** Full expanded Playwright suite green against `npm run dev` (Vite dev server), Cypress removed

---

## Phase 4 — Composition API Rewrite *(separate session)*

**Goal:** Modernize component internals to Vue 3.5 idiomatic `<script setup>` + Composition API.

**Strategy:**
- Convert one component at a time, Playwright suite as safety net after each
- Start with leaf components (no children): `ComparisonMenu`, `JunctionMenu`, `ValueInput`, `PropertyMenu`
- Work up to container components: `Constraint`, `ConstraintGroup`, `ProjectionGroup`, `ConstraintModeler`
- Use `defineProps`, `defineEmits`, `ref`, `computed`, `watch` throughout
- Replace any event bus patterns with `provide/inject` or composables

**Exit gate:** Full Playwright suite green, all components on `<script setup>`

---

## Out of Scope

- Tailwind / shadcn-vue migration (future session)
- API / backend changes
- New constraint modeler features
- npm publish workflow changes (preserve existing)
