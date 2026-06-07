# Open Source Readiness Plan

**Goal:** Prepare `@tedberg/constraint-modeler` for broader Vue 3 consumption with accurate package metadata, TypeScript declarations, modern documentation, isolated CSS, and clean demos.

**Source:** Derived from the June 2026 handoff notes after the library CSS isolation work.

---

## Current Baseline

Recent verified checks from the handoff:

- [x] `npm run typecheck`
- [x] `npm run lint`
- [x] `npm run build:lib`
- [x] `npm run test:unit`
- [x] `npm run test:e2e -- --project=chromium`
- [x] Reef focused Playwright theme spec passed after yalc verification

Known follow-up:

- [x] Demo routes emit Vue warnings because `ListGrid` receives `items=undefined`.
- [x] Package does not yet publish TypeScript declaration files.
- [x] README still shows Vue 2-era install examples.
- [x] `package.json` still needs public-package cleanup and export hardening.

---

## Phase 1 - Package And API Hardening

- [x] Add declaration generation for library builds.
- [x] Emit declarations into `dist`.
- [x] Add `types` metadata in `package.json`.
- [x] Add `exports["."].types`.
- [x] Keep ESM as the primary package entry.
- [x] Remove the misleading CommonJS `require` condition unless a real `.cjs` build is added and tested.
- [x] Keep UMD/browser build only as a browser/CDN artifact.
- [x] Export the intentional public API:
  - [x] `ConstraintModeler`
  - [x] plugin default export
  - [x] resource base/default classes or interfaces
  - [x] public emitted event payload types
  - [ ] model JSON/schema types if formalized
- [x] Avoid exporting internal model classes unless that becomes an explicit public API decision.
- [x] Run `npm pack --dry-run` and inspect package contents.

## Phase 2 - Dependency And Metadata Cleanup

- [x] Move `vue` out of runtime `dependencies`; keep it in `peerDependencies` and `devDependencies`.
- [x] Move `vue-router` to `devDependencies` only, unless public library code starts requiring it.
- [x] Remove `shadcn-vue` from runtime dependencies if only copied local components are used.
- [x] Keep actual runtime dependencies required by library components:
  - [x] `@lucide/vue`
  - [x] `@vueuse/core`
  - [x] `class-variance-authority`
  - [x] `clsx`
  - [x] `mitt`
  - [x] `reka-ui`
  - [x] `tailwind-merge`
- [x] Fill package `description`.
- [x] Fill package `keywords`.
- [x] Remove placeholder `gitHooksX`.
- [x] Add CSS `sideEffects` metadata so bundlers preserve shipped styles.
- [x] Confirm `files` includes only intended publish artifacts.

## Phase 3 - README Rewrite

- [x] Replace Vue 2 `new Vue` / `Vue.use` examples with Vue 3 `createApp` examples.
- [x] Document plugin installation.
- [x] Document direct component import.
- [x] Document required CSS import.
- [x] Document `constraintModelerResource` contract.
- [x] Provide a minimal runnable Vue 3 example.
- [x] Document emitted `applyConstraintsToData` usage.
- [x] Document theme/token override strategy with `--cm-*` variables.
- [x] Link demo and screenshots.
- [x] State browser/framework compatibility.

## Phase 4 - Tailwind/ShadCN Cleanup

Phase 4 changes are visual/systemic and should stay split into small checkpoints. Do not batch all of these into one broad styling rewrite.

### 4.1 - Audit Only

- [x] Inventory every hard-coded color in copied UI primitives and constraint modeler components.
- [x] Inventory raw scoped CSS blocks that still carry Bootstrap-era layout assumptions.
- [x] Inventory fixed widths/min-widths and identify whether each is layout-critical or legacy.
- [x] Document the current visual purpose of each item before changing it.

Original audit findings before 4.2 cleanup:

- `src/components/ui/button/index.ts`
  - `secondary` uses `cm:bg-zinc-500 cm:text-white cm:hover:bg-zinc-400`.
  - `menu` uses `cm:text-white cm:hover:bg-white/10`.
  - Current purpose: compact controls on dark/tinted modeler bars. Most usage is already overridden by `ConstraintModeler.vue` scoped bar styles.
- `src/components/constraint-modeler/ui/ConstraintModeler.vue`
  - Success alert uses `cm:border-green-600 cm:text-green-400`.
  - Bar button overrides use `color-mix(... var(--cm-bar-foreground) ...)`.
  - Debug link uses `#0000cc`.
  - Root uses `all: revert-layer`.
  - Fixed/layout values: debug panel `style="width: 250px"`, root `width: max-content`, `max-width: 100%`, `min-width: 400px`, padding/title spacing.
- `src/components/constraint-modeler/ui/constraint/Constraint.vue`
  - Validity icons use `cm:text-green-500` and `cm:text-red-500`.
  - Constraint row has `max-width: 800px`.
- `src/components/constraint-modeler/ui/constraint/ConstraintGroup.vue`
  - Nested group margin is `15px`; bar is `width: 100%` and `min-width: 225px`.
- `src/components/constraint-modeler/ui/projection/Projection.vue`
  - Projection bar is `width: 100%` and `min-width: 400px`.
- `src/components/constraint-modeler/ui/projection/ProjectionGroup.vue`
  - Projection group bar is `width: 100%` and `min-width: 225px`.
- `src/components/constraint-modeler/ui/constraint/ValueInput.vue`
  - Inputs/selects use tokenized raw CSS, but fixed widths remain: `250px`, `125px`, `100px`, `515px`, `96px`, `80px`.

### 4.2 - Low-Risk Cleanup

- [x] Replace obvious hard-coded colors with existing semantic tokens where behavior is already covered by tests.
- [x] Prefer tokens such as `secondary`, `accent`, `popover`, `muted`, `foreground`, and component-specific `--cm-*`.
- [x] Keep changes small enough that e2e screenshots and theme tests can isolate regressions.

Progress:

- [x] `Button` `secondary` variant now uses `secondary` semantic tokens instead of zinc/white utilities.
- [x] `Button` `menu` variant now uses `cm-bar-foreground` tokens instead of white utilities.
- [x] Debug links now use `--cm-primary` instead of literal `#0000cc`.
- [x] Library and demo modeler bars now default to `primary`/`primary-foreground` tokens via `--cm-bar` and `--cm-bar-foreground`.
- [x] Success alert now uses component token `--cm-success` instead of green Tailwind utilities.
- [x] Constraint validity icons now use `--cm-success` and existing `--cm-destructive` instead of green/red Tailwind utilities.
- [x] Verification for 4.2: `npm run format`, `npm run typecheck`, `npm run lint`, `npm run build:lib`, and `npm run test:e2e -- --project=chromium`.

### 4.3 - Isolation Decision

- [x] Re-evaluate `all: revert-layer` in `ConstraintModeler.vue`; remove if there is a less surprising isolation approach.
- [x] If removing or replacing it, verify local demo routes and Reef focused theme spec before calling the change complete.
- [x] Document the final isolation decision in this plan or a short ADR if the tradeoff remains non-obvious.

Decision:

- Removed `all: revert-layer` from the modeler root. It was too broad for a library component because it silently reset all inherited host styles and made the isolation behavior hard to reason about.
- Replaced it with explicit component isolation on `.constraint-modeler`: `box-sizing`, `font-family`, `color`, `background-color`, `line-height`, and descendant `box-sizing: border-box`.
- Kept the component as a themed tool surface/panel using `--cm-card` / `--cm-card-foreground`; it is not treated as a ShadCN `Card` component API.
- Fixed the layout regression found during 4.3: the root `min-width` is now responsive, and projection bars account for their left indent so they do not spill outside the modeler at narrow widths.
- Verification for 4.3: `npm run format`, `npm run typecheck`, `npm run lint`, `npm run build:lib`, `npm run test:e2e -- --project=chromium`, hostile host-CSS browser probe, `npm run publish:local`, and Reef `constraint-modeler-theme.spec.ts`.

### 4.4 - Form Primitive Decision

- [ ] Decide whether `ValueInput.vue` gets a light tokenized cleanup or a proper local `Input` / `Select` primitive.
- [ ] If adding primitives, keep them local and consistent with the copied ShadCN-style component pattern.
- [ ] Avoid a broad form rewrite unless it removes real duplication or fixes a concrete visual/accessibility problem.

### 4.5 - Remaining Component Cleanup

- [x] Replace hard-coded button/menu colors with semantic tokens where practical.
- [x] Replace text `x` close buttons with lucide `X` icon buttons and accessible labels.
- [x] Remove stray `console.log` calls from public components.
- [ ] Reduce Bootstrap-era raw CSS and fixed widths where it can be done without layout regressions.
  - [x] Made the root modeler minimum width responsive.
  - [x] Made projection rows account for left indent instead of overflowing the modeler container.
- [ ] Consider local `Input` / `Select` primitives before deeply rewriting `ValueInput.vue`.

### 4.6 - Visual Verification

- [x] Run local e2e after each small Phase 4 slice.
- [x] Manually inspect key demo routes when changing layout or tokens.
- [x] Run `npm run publish:local` and the Reef focused spec before considering Phase 4 complete.

## Phase 5 - Demo Cleanup

- [x] Fix `ListGrid items=undefined` warnings.
- [x] Keep e2e logs warning-free where practical.
- [x] Verify all demo routes still render after package/API changes.

## Phase 6 - Verification

Run after each substantial phase:

- [x] `npm run format`
- [x] `npm run lint`
- [x] `npm run typecheck`
- [x] `npm run build:lib`
- [x] `npm run test:unit`
- [x] `npm run test:e2e -- --project=chromium`
- [x] `npm pack --dry-run`

Consumer verification:

- [x] `npm run publish:local`
- [x] In `/Users/ted/Development/projects/triview/reef/reef-client`, run:

```bash
npx playwright test tests/e2e/specs/constraint-modeler-theme.spec.ts --project=chromium
```

---

## Notes

- CommonJS is not a current goal. Do not advertise CJS support unless a real CJS build is added and smoke-tested.
- Consumers that import CSS in TypeScript projects may need their own `declare module "*.css"` unless their app framework already provides one.
- Keep `docs/tweak-cn.png` untouched unless its purpose is clarified.
