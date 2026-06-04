# Migration Spec: TypeScript + Composition API + Tailwind + ShadCN

**Date:** 2026-06-02
**Branch:** feat/vue3 → new feature branch per phase
**Phases:** 2 (logic modernization, then visual layer swap)

---

## Goals

1. Migrate all JS → TypeScript
2. Migrate all Options API components → `<script setup lang="ts">`
3. Replace Bootstrap 5 + bootstrap-vue-next with Tailwind 4 + shadcn-vue
4. Replace SASS with modern CSS
5. Align lint/format tooling with afa-client
6. Keep all 13 Playwright + 74 unit tests green throughout

**Not in scope:** Visual redesign. After Phase 2 the component should look and behave identically to today (dark default, same layout).

**Future target:** Vue 3.6 Vapor mode. All components must use `<template>` syntax — no JSX render functions. ValueInput.vue's render function is converted to template as part of Phase 1.

---

## Phase 1: TypeScript + Composition API

**Goal:** Zero visual changes. Every component rewrites its `<script>` block. Tests must remain green.

### Dependency version bumps

All dependencies bumped to current stable versions as part of Phase 1:
- `vue` → 3.5.x (latest stable; 3.6 / Vapor targeted when stable)
- `vue-router` → 4.x latest
- `vite` → 8.x latest
- `vitest` → 4.x latest
- `mitt` → 3.x latest
- `@playwright/test` → 1.x latest

### axios → native fetch

`ApiResource.js` uses axios for a single operation: `GET` with `Accept: application/json`. Replace with native `fetch` — removes axios as a dep and peerDep entirely.

**Intentional behavior change — document and test first:** The current `paramsSerializer` returns `''`, which means any `params` object passed to `getJsonWithParams` is silently dropped — query parameters are never sent. This appears to be an incomplete stub (the commented-out `Qs.stringify` confirms intent to fix it). The fetch replacement intentionally corrects this: params will now be serialized via `URLSearchParams` and appended to the URL.

Before implementing the migration, add unit tests to `ApiResource` covering:
1. No params → URL is unchanged, no `?` appended
2. Non-null params → serialized correctly as a query string
3. URL already starting with `/api` → prefix not doubled

These tests document the intended contract and prevent silent regressions if the behavior is revisited.

```typescript
// ApiResource.ts — after
async getJsonWithParams(url: string, params?: Record<string, string> | null): Promise<unknown> {
  let apiUrl = url.startsWith(API_PREFIX) ? url : API_PREFIX + url;
  if (params) apiUrl += '?' + new URLSearchParams(params).toString();
  const res = await fetch(apiUrl, { headers: { Accept: 'application/json' } });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}
```

`axios` removed from `dependencies` and `peerDependencies`.

### File renames

All `.js` → `.ts`:
- `src/components/constraint-modeler/model/*.js`
- `src/components/constraint-modeler/enum/*.js`
- `src/components/constraint-modeler/Property.js`
- `src/components/constraint-modeler/AbstractConstraintModelerResource.js`
- `src/components/constraint-modeler/ConstraintModelerResource.js`
- `src/components/constraint-modeler/StubConstraintModelerResource.js`
- `src/common/ApiResource.js`
- `src/common/LoggingFacade.js`
- `src/components/entry.js`
- `src/demo/router.js`
- `vite.config.js` → `vite.config.ts`

All `.vue` files (library + demo views): `<script>` / `<script lang="jsx">` → `<script setup lang="ts">`.

### TypeScript config

New `tsconfig.json` matching afa-client:

```json
{
  "compilerOptions": {
    "target": "ESNext",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": false,
    "noImplicitAny": false,
    "jsx": "preserve",
    "lib": ["ESNext", "DOM"],
    "paths": { "@/*": ["./src/*"] },
    "skipLibCheck": true,
    "isolatedModules": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

### provide/inject refactor

Currently `ConstraintModeler.vue` provides `modelListener: this` (the component instance) so children can call `this.modelListener.emitter.emit(...)`. With `<script setup>` there is no `this`.

**New pattern:** provide `emitter` directly via typed injection keys.

Two new files:

**`src/components/constraint-modeler/events.ts`** — mitt event map (all emitted event names + payload types):
```typescript
import type ConstraintGroupModel from './model/ConstraintGroupModel';
import type ConstraintModel from './model/ConstraintModel';
import type ProjectionModel from './model/ProjectionModel';
import type { JunctionEnum } from './enum/JunctionEnum';
import type Property from './Property';

export type Events = {
  apply: void;
  setJunction: [ConstraintGroupModel, JunctionEnum];
  addConstraint: ConstraintGroupModel;
  addConstraintGroup: ConstraintGroupModel;
  removeConstraintGroup: ConstraintGroupModel;
  setQueryFunctionEnum: [ConstraintModel, string];
  setProperty: [ConstraintModel, Property];
  setComparator: [ConstraintModel, unknown];
  updateValueArray: [ConstraintModel, unknown[]];
  removeConstraint: [ConstraintGroupModel, ConstraintModel];
  setProjectionQueryFunctionEnum: [ProjectionModel, string];
  setProjectionProperty: [ProjectionModel, Property];
};
```

**`src/components/constraint-modeler/keys.ts`** — typed injection keys:
```typescript
import type { InjectionKey } from 'vue';
import type { Emitter } from 'mitt';
import type { Events } from './events';
import type AbstractConstraintModelerResource from './AbstractConstraintModelerResource';

export const emitterKey: InjectionKey<Emitter<Events>> = Symbol('emitter');
export const resourceKey: InjectionKey<AbstractConstraintModelerResource> = Symbol('constraintModelerResource');
```

Children replace:
```typescript
// Before
inject: ['modelListener']
this.modelListener.emitter.emit('setJunction', [...])

// After
const emitter = inject(emitterKey)!
emitter.emit('setJunction', [...])
```

### Drop `extends: QueryElementGroup`

`QueryElementGroup.vue` is an empty shell (no props, no logic, no template content). The two components that extend it (`ConstraintGroup`, `ProjectionGroup`) stand alone after conversion. `QueryElementGroup.vue` can be deleted.

### ValueInput.vue: JSX → template

Convert the `render()` function to `<template>` with `v-for` + `v-if`/`v-else-if`/`v-else` branches. This is required for Vue Vapor compatibility.

Core structure:
```html
<template>
  <div>
    <template v-for="(_, i) in numberOfFields" :key="i">
      <span v-if="i === 1" class="...">AND</span>
      <select v-if="useSelectField" v-model="valueArray[i]" @change="updateValueArray">
        <option value=""></option>
        <option v-for="opt in selectableValueList" :key="findChoiceId(opt)"
                :value="findChoiceId(opt)">{{ findChoiceLabel(opt) }}</option>
      </select>
      <input v-else-if="isNumber" type="number" v-model="valueArray[i]" @input="updateValueArray" />
      <input v-else-if="isDate"   type="date"   v-model="valueArray[i]" @input="updateValueArray" />
      <input v-else-if="isUrl"    type="url"    v-model="valueArray[i]" @input="updateValueArray" />
      <input v-else               type="text"   v-model="valueArray[i]" @input="updateValueArray" />
    </template>
  </div>
</template>
```

### SASS → modern CSS

All `<style scoped lang="scss">` → `<style scoped>` (plain CSS). SASS features in use:

- **Nesting** → CSS nesting (native, supported by Vite's PostCSS)
- **`:deep()`** → unchanged (Vue scoped CSS, not SASS)
- No SASS variables or mixins used — straight conversion

`sass` devDependency removed.

### Lint/format parity with afa-client

**This must be completed first, before any code migrations begin.** ESLint's `vue/prefer-use-template-ref: error` and TypeScript parser rules need to be active from the first converted component so violations surface immediately rather than accumulating silently.

**New devDependencies:**
- `eslint`
- `eslint-plugin-vue`
- `@typescript-eslint/parser`
- `eslint-plugin-oxlint`
- `@vitest/eslint-plugin`
- `oxfmt`

**New config file:** `eslint.config.js` — copy afa-client's config verbatim. The shadcn-specific rule (`vue/require-default-prop: off` for `src/components/ui/**`) is already appropriate; it will apply once shadcn components are added in Phase 2.

**New config file:** `tsconfig.json` — as specified in the TypeScript config section above. Required before ESLint's TypeScript parser can resolve types.

**Updated scripts in `package.json`:**
```json
"lint": "oxlint src && eslint src",
"format": "oxfmt src/",
"format:check": "oxfmt --check src/"
```

**Verification:** Run `npm run lint` and `npm run format:check` against the unmodified codebase before touching any component. Fix any pre-existing violations first so the baseline is clean.

**Note:** `vue/prefer-use-template-ref` is set to `error` in the eslint config — use `useTemplateRef()` rather than string refs in all new `<script setup>` components.

### Playwright verification

Run `npm run test:e2e:pw` after each component batch:
1. After model/enum/JS file conversions
2. After ConstraintModeler.vue + ConstraintGroup.vue
3. After Constraint.vue + ValueInput.vue
4. After Projection.vue + ProjectionGroup.vue
5. After all shared components (PropertyMenu, QueryFunctionMenu, ComparisonMenu, JunctionMenu)

All 13 specs must be green before Phase 2 begins.

---

## Phase 2: Tailwind + ShadCN Vue

**Goal:** Swap the visual layer. Zero logic changes — `<script setup>` blocks are untouched. Only `<template>` and `<style>` change.

### Dependencies removed

| Package | Type | Note |
|---|---|---|
| `bootstrap` | dep + peerDep | replaced by Tailwind |
| `bootstrap-vue-next` | dep + peerDep | replaced by shadcn-vue |
| `@vitejs/plugin-vue-jsx` | devDep | no JSX anywhere after Phase 1 |

### Dependencies added

| Package | Type | Purpose |
|---|---|---|
| `tailwindcss` | devDep | Tailwind 4 |
| `@tailwindcss/vite` | devDep | Vite plugin (replaces postcss config) |
| `tw-animate-css` | devDep | Dropdown/dialog animations |
| `shadcn-vue` | dep | Component library |
| `reka-ui` | dep | shadcn-vue's headless UI layer |
| `class-variance-authority` | dep | Variant utilities |
| `clsx` | dep | Class merging |
| `tailwind-merge` | dep | Tailwind class deduplication |
| `lucide-vue-next` | dep | Icons (replaces accept.png + error.png) |

### Tailwind setup

`src/assets/css/tailwind.css` — new file matching afa-client's pattern:

```css
@import "tailwindcss";
@import "tw-animate-css";
@import "shadcn-vue/tailwind.css";

@custom-variant dark (&:is(.dark *));

@theme inline {
  /* token mappings */
}

:root {
  /* dark values as default — dark mode is the initial theme */
  --background: oklch(0.145 0 0);
  --foreground: oklch(0.985 0 0);
  /* ... full shadcn dark token set ... */
}

.light {
  /* light token overrides — unlocked in a future theming pass */
}
```

Dark is the default at `:root`, light is opt-in via `.light` class. This gives visual continuity with today while the token architecture is in place for future light mode support.

`vite.config.ts` gains `tailwindcss()` in the plugins array for both app and lib builds.

### ShadCN component installation

shadcn-vue components are copied (not imported from npm) into `src/components/ui/`. Required components:

- `Button` — replaces all `btn btn-sm` Bootstrap buttons
- `DropdownMenu` (Trigger, Content, Item, Label, Separator) — replaces all `b-nav-item-dropdown` + `b-dropdown-item`
- `Alert` — replaces `b-alert`

`src/lib/utils.ts` — standard shadcn `cn()` helper.

### Component mapping

| File | Current | Replacement |
|---|---|---|
| ComparisonMenu.vue | `b-nav-item-dropdown` + `b-dropdown-item` | `DropdownMenu` |
| JunctionMenu.vue | `b-nav-item-dropdown` + `b-dropdown-item` | `DropdownMenu` |
| PropertyMenu.vue | `b-nav-item-dropdown` + `b-dropdown-item` + divider/header | `DropdownMenu` with `DropdownMenuSeparator` + `DropdownMenuLabel` |
| QueryFunctionMenu.vue | `b-nav-item-dropdown` + `b-dropdown-item` + divider/header | `DropdownMenu` with `DropdownMenuSeparator` + `DropdownMenuLabel` |
| ConstraintModeler.vue | `b-alert` (3×), `btn btn-dark btn-sm` | `Alert` (3×), shadcn `Button` |
| Constraint.vue | Bootstrap navbar layout, `btn btn-sm`, icon `<img>` | Tailwind flex row, shadcn `Button`, lucide icons |
| ConstraintGroup.vue | Bootstrap navbar layout, `btn btn-sm` | Tailwind flex row, shadcn `Button` |
| Projection.vue | Bootstrap navbar layout, `btn btn-sm` | Tailwind flex row, shadcn `Button` |
| ProjectionGroup.vue | Bootstrap navbar layout, `btn btn-sm` | Tailwind flex row, shadcn `Button` |

### Library CSS delivery

The `build:lib` vite config includes `tailwindcss()` so Tailwind utility classes used by the library are scanned and bundled. Output is `dist/constraint-modeler.css`. Consumer import path unchanged.

### Playwright selector updates

BVN's `b-nav-item-dropdown` renders an `<a class="nav-link">` as its trigger — all Playwright tests targeting dropdowns use this selector. After Phase 2, the shadcn `DropdownMenuTrigger` renders a `<button>`. All 13 specs need selector updates. The `tests/playwright/CLAUDE.md` selector documentation is updated to reflect the new patterns.

---

## Out of scope

- Visual redesign (deferred)
- Light mode theme switcher (token architecture is ready; UI switch deferred)
- Vue 3.6 / Vapor upgrade (architecture is ready; upgrade deferred until 3.6 is stable)
- `vue-router` major version upgrade (stays at v4; minor bumps included in Phase 1)
