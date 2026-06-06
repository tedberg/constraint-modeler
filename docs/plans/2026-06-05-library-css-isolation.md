# Library CSS Isolation Plan

**Goal:** Make `@tedberg/constraint-modeler` safe to embed in any app — Tailwind/shadcn, Bootstrap, bare CSS — without style conflicts, token collisions, or cascade bleed.

**Motivation:** A consuming project (reef) reported that the library's `:root`-level design tokens clobber their own shadcn design system, and Tailwind utility classes from the library conflict with the host app's Tailwind build.

---

## Three Problems and Their Fixes

| Problem | Root Cause | Fix |
|---------|-----------|-----|
| Design token collision | Library writes `--primary`, `--background` etc. to `:root`, overriding the host app's own shadcn tokens | Scope all tokens to `.constraint-modeler` and namespace them `--cm-*` |
| Tailwind utility collision | Library ships a full Tailwind build; `.flex`, `.bg-primary` etc. duplicate the host's own utilities | Add `cm:` prefix to all Tailwind-generated utility classes |
| Host `@layer base` bleed-in | Host Tailwind's `* { border-color }`, `body { background }` etc. inherit into the library component | Add `all: revert-layer` on `.constraint-modeler` root |

---

## File Map

| Action | Path |
|--------|------|
| Modify | `src/assets/css/lib.css` ← library CSS (ships to npm) |
| Modify | `src/assets/css/tailwind.css` ← demo app CSS |
| Modify | `src/components/constraint-modeler/ui/ConstraintModeler.vue` |
| Modify | `src/components/constraint-modeler/ui/constraint/ConstraintGroup.vue` |
| Modify | `src/components/constraint-modeler/ui/constraint/Constraint.vue` |
| Modify | `src/components/constraint-modeler/ui/projection/ProjectionGroup.vue` |
| Modify | `src/components/constraint-modeler/ui/projection/Projection.vue` |
| Modify | `src/components/constraint-modeler/ui/shared/PropertyMenu.vue` |
| Modify | `src/components/constraint-modeler/ui/shared/PropertyMenuItem.vue` |
| Modify | All other component files using Tailwind utility classes |

---

## Phase 1 — Token Scoping ✅ COMPLETE

Move all design tokens out of `:root`/`html` and into `.constraint-modeler`, namespaced `--cm-*`.

Two separate CSS files now exist:

- **`src/assets/css/lib.css`** — library CSS, ships to npm. Tokens scoped to `.constraint-modeler` and `.constraint-modeler-portal`. The `@theme inline` block maps `--color-background: var(--cm-background)` etc. directly (no fallback needed — these variables are always defined on an ancestor `.constraint-modeler`).
- **`src/assets/css/tailwind.css`** — demo app CSS. The `@theme inline` block uses fallback chains `var(--cm-background, var(--background))` so unprefixed shadcn tokens work on demo pages that don't have a `.constraint-modeler` ancestor.

### 1.1 — Token selectors (implemented)

```css
/* lib.css — dark (default) */
.constraint-modeler,
.constraint-modeler-portal {
  --cm-background: oklch(0.145 0 0);
  --cm-primary: oklch(0.922 0 0);
  /* ... */
}

/* lib.css — light */
.light .constraint-modeler,
.light .constraint-modeler-portal {
  --cm-background: oklch(1 0 0);
  /* ... */
}
```

Theme variants (`theme-solar`, `theme-midnight`, `theme-minimal`) follow the same pattern in `tailwind.css`. The `useTheme` composable applies `.theme-*` and `.light` to `document.documentElement`; these classes cascade down to `.constraint-modeler` naturally.

### 1.2 — `@theme inline` block (implemented)

```css
@theme inline {
  --color-background: var(--cm-background);
  --color-primary: var(--cm-primary);
  /* ... all tokens */
}
```

- [x] Update all `:root`/`.light` token blocks → `.constraint-modeler` / `.light .constraint-modeler`
- [x] Update all `:root.theme-*` blocks → `.theme-* .constraint-modeler`
- [x] Update `@theme inline` to map `var(--cm-*)` names
- [x] Run `npm run dev` and verify all four themes + light/dark toggle still work
- [x] Run `npm run test:unit` and `npm run test:e2e:pw`

---

## Phase 2 — Tailwind Prefix `cm:` ✅ COMPLETE

Add a prefix to all Tailwind-generated utility classes so they can never conflict with a host app's Tailwind build.

### ⚠️ Tailwind v4 prefix syntax: colon, not dash

**Tailwind v4 uses a colon separator for prefixes, not a dash.** With `prefix(cm)`:

- Generated CSS selector: `.cm\:flex { display: flex }`
- Class name in source files: `cm:flex` (colon)
- NOT `cm-flex` (dash) — that is Tailwind v3 syntax

Variants compose left-to-right: `cm:hover:bg-accent`, `cm:focus:text-foreground`, `cm:data-[state=open]:animate-in`

### 2.1 — Configure prefix in the CSS entry point

The prefix is configured via `@import` in the CSS file. **The Vite plugin (`@tailwindcss/vite`) has no `prefix` option** — prefix is handled by the Oxide compiler, not the Vite plugin.

```css
/* lib.css — library build: no Preflight, prefixed variables + utilities */
@layer theme, base, components, utilities;

@import "tailwindcss/theme.css" layer(theme) prefix(cm);
@import "tailwindcss/utilities.css" layer(utilities) prefix(cm) source("../../components");
```

> **Critical:** Do not import `tailwindcss/preflight.css` in the library build. Preflight emits global element selectors like `button, input, select...`; a component library should not reset the consuming app's page. The split imports above are the current Tailwind v4 pattern for disabling Preflight while keeping prefixed utilities.

The source path is relative to the CSS file and belongs on the utilities import:

```css
@import "tailwindcss/utilities.css" layer(utilities) prefix(cm) source("../../components");
```

`@source inline(...)` still force-generates specific utilities that the scanner might miss (e.g. classes in dynamic `:class` bindings):

```css
@source inline("cm:bg-neutral-900 cm:border-zinc-600 cm:text-zinc-400");
```

### 2.2 — Class names in source files

All Tailwind utility classes in `.vue` and `.ts` files use the `cm:` colon prefix:

```
flex          → cm:flex
items-center  → cm:items-center
gap-1         → cm:gap-1
bg-primary    → cm:bg-primary
text-foreground → cm:text-foreground
rounded-md    → cm:rounded-md
hover:bg-accent → cm:hover:bg-accent
focus:ring-2  → cm:focus:ring-2
data-[state=open]:animate-in → cm:data-[state=open]:animate-in
[&>svg]:size-4 → cm:[&>svg]:size-4
```

This applies to all library components and vendored shadcn-vue components in `src/components/ui/`.

### 2.3 — Scoped CSS and `:deep()` selectors

Authored CSS in `<style>` blocks (e.g. `ConstraintModeler.vue`) references `--cm-*` variables directly and uses plain CSS property names — no Tailwind utilities — so no changes needed there.

- [x] Configure split Tailwind imports with `prefix(cm)` in `lib.css`
- [x] Omit Tailwind Preflight from the library build
- [x] Batch-replace all utility class names in all `.vue` and `.ts` component files (`cm-X` → `cm:X`, `{variant}:cm-X` → `cm:{variant}:X`)
- [x] Update shadcn-vue vendored components in `src/components/ui/`
- [x] Run dev server and visual-check all routes
- [x] Run full test suite — 43/43 Playwright tests pass

---

## Phase 3 — `all: revert-layer` Isolation ✅ COMPLETE

Prevent the host app's `@layer base` styles (border-color, background, font) from bleeding into the component.

### 3.1 — Add to `.constraint-modeler` scoped CSS

In `ConstraintModeler.vue` scoped styles:

```css
div.constraint-modeler {
  all: revert-layer;   /* ← add this line */
  box-sizing: border-box;
  font-family: system-ui, sans-serif;

  /* existing styles follow unchanged */
  border-radius: 7px;
  font-size: 0.9em;
  /* ... */
}
```

`all: revert-layer` reverts every property to what it would be below `@layer base` — effectively undoing the host's `@layer base` resets for the component subtree, while the library's own `@layer constraint-modeler` (if used) still applies.

> **Caveat:** `revert-layer` only affects *layered* styles. Host styles written outside any `@layer` block (including inline styles) are unaffected. For most Tailwind-based consumers this is complete protection; for others it is best-effort.

- [x] Add `all: revert-layer` + explicit `box-sizing` and `font-family` to `.constraint-modeler` in `ConstraintModeler.vue`
- [x] Visual-check that internal layout is unchanged in the demo
- [x] Run full test suite — 43/43 Playwright tests pass

---

## Consumer Integration Guide

> **For consuming project maintainers — what changes on your side after this is shipped:**

### What the library now provides

- All design tokens scoped to `.constraint-modeler` — no `:root` pollution
- All Tailwind utilities prefixed `cm:*` — no class name conflicts with the host's Tailwind build
- Component isolates itself from host `@layer base` styles via `all: revert-layer` (Phase 3)

### Minimal setup (any CSS framework)

```ts
// main.ts
import "@tedberg/constraint-modeler/dist/constraint-modeler.css";
```

The component ships its own design tokens scoped to `.constraint-modeler`. It works out of the box with the library's built-in themes (dark default, Solar Dusk, Midnight Bloom, Modern Minimal).

### Bridging to your design system (shadcn / Tailwind apps)

If you want the constraint modeler to match your app's design system, override the `--cm-*` tokens on `.constraint-modeler` in your app CSS:

```css
/* your app's CSS — bridge your tokens to the library's API */
.constraint-modeler {
  --cm-primary: var(--primary);
  --cm-primary-foreground: var(--primary-foreground);
  --cm-background: var(--background);
  --cm-foreground: var(--foreground);
  --cm-secondary: var(--secondary);
  --cm-secondary-foreground: var(--secondary-foreground);
  --cm-muted: var(--muted);
  --cm-muted-foreground: var(--muted-foreground);
  --cm-popover: var(--popover);
  --cm-popover-foreground: var(--popover-foreground);
  --cm-border: var(--border);
  --cm-input: var(--input);
  --cm-ring: var(--ring);
  --cm-destructive: var(--destructive);
  /* optional: override bar color separately from primary */
  --cm-bar: var(--primary);
  --cm-bar-foreground: var(--primary-foreground);
}
```

### Layer ordering (shadcn / Tailwind apps only)

No custom `constraint-modeler` layer is required. The library emits only prefixed Tailwind theme variables/utilities and component-scoped CSS; it does not emit Preflight. Consuming apps can import the CSS from JavaScript or from their app CSS without giving the library global reset power.

### What you can remove after upgrading

- Any `all: revert-layer` workarounds in your `@layer base` targeting `.constraint-modeler` children
- Any wrapper class like `.cm-scope` used to re-scope the component's token resolution
- Any `@layer constraint-modeler` pre-declaration
