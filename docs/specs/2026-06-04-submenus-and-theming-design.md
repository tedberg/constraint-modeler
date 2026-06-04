# Design: Recursive Submenus + Demo Theming

**Date:** 2026-06-04
**Status:** Approved

## Overview

Two independent features:
1. **Recursive submenus** — object-type properties in the property picker now cascade into `DropdownMenuSub` flyouts at arbitrary depth (2–4 levels in real apps).
2. **Demo theming** — the demo app gains a dark/light mode toggle and a four-preset theme picker (Default, Midnight Bloom, Modern Minimal, Solar Dusk). The library CSS is unchanged beyond what was already done; theming works via CSS custom property override.

---

## Feature 1: Recursive Submenus

### Background

`Property` objects have optional `nestedPropertyList` and `nestedMultiPropertyList` arrays. Properties with `simpleDataType === "object"` (i.e., `isObjectType()` returns true) have children. Nesting can go 2–4 levels deep in consuming apps.

Currently `PropertyMenuPartial.vue` renders nested items as a flat list embedded inside a `DropdownMenuItem` — the wrong pattern. The shadcn-vue `DropdownMenuSub` / `DropdownMenuSubTrigger` / `DropdownMenuSubContent` components are already in the project and ready to use.

### New component: `PropertyMenuItem.vue`

**Location:** `src/components/constraint-modeler/ui/shared/PropertyMenuItem.vue`

**Props:**
- `property` — a `Property` instance
- `templatePrefix` — String, passed through unchanged

**Emit:** `setProperty(property)` — emits the selected leaf property up to `PropertyMenu`

**Rendering logic:**
- If `property.nestedPropertyList` has entries → render `DropdownMenuSub`:
  - `DropdownMenuSubTrigger`: displays `property.displayName` (no manual `»` suffix — `DropdownMenuSubTrigger` renders a `ChevronRight` icon automatically)
  - `DropdownMenuSubContent`: contains a recursive `PropertyMenuItem` for each entry in `nestedPropertyList`; if `nestedMultiPropertyList` also has entries, append `DropdownMenuSeparator` + `DropdownMenuLabel "Multi Properties"` + recursive `PropertyMenuItem` instances for those
- If leaf (no `nestedPropertyList`) → render `DropdownMenuItem` with `@select` emitting `setProperty(property)`

Recursion terminates naturally when a property has no `nestedPropertyList`.

### Updated: `PropertyMenu.vue`

Replace the current loop (which embeds `PropertyMenuPartial` inside `DropdownMenuItem`) with:
- A `PropertyMenuItem` for each entry in `propertyList`
- If `multiPropertyList` has entries: `DropdownMenuSeparator` + `DropdownMenuLabel "Multi Properties"` + a `PropertyMenuItem` for each entry in `multiPropertyList`

Props and emits are unchanged. Remove the manual `»` suffix from display name rendering — the sub-trigger chevron icon replaces it.

### Deleted: `PropertyMenuPartial.vue`

Fully absorbed by `PropertyMenuItem`. No other component references it.

### Updated: `StubConstraintModelerResource.ts`

Add a second level of nesting to the existing `alert` object so the demo shows real multi-level cascade. Example:

```
alert (object)
  alert.message (string)
  alert.contact (object)
    alert.contact.email (string)
    alert.contact.phone (string)
```

### File changes

| Action | File |
|--------|------|
| Create | `src/components/constraint-modeler/ui/shared/PropertyMenuItem.vue` |
| Modify | `src/components/constraint-modeler/ui/shared/PropertyMenu.vue` |
| Delete | `src/components/constraint-modeler/ui/shared/PropertyMenuPartial.vue` |
| Modify | `src/components/constraint-modeler/StubConstraintModelerResource.ts` |

---

## Feature 2: Demo Theming

### Background

The library's compiled CSS (`constraint-modeler.css`) already ships:
- `:root` — dark zinc defaults (all shadcn semantic tokens)
- `.light` — light zinc overrides

These use the same token names tweakcn.com generates. A consuming app can override both blocks by importing its own tweakcn CSS after the library CSS — cascade handles it. The library itself needs no changes for theming.

The demo app needs: a `useTheme` composable + CSS preset definitions + UI controls in the nav.

### CSS structure (`src/assets/css/tailwind.css`)

Add three additional theme presets using tweakcn-generated values. Zinc (the current `:root` / `.light`) is the default and requires no new class.

```
:root                             Default (dark)  — already defined
.light                            Default (light) — already defined
:root.theme-midnight              Midnight Bloom (dark)
:root.theme-midnight.light        Midnight Bloom (light)
:root.theme-minimal               Modern Minimal (dark)
:root.theme-minimal.light         Modern Minimal (light)
:root.theme-solar                 Solar Dusk (dark)
:root.theme-solar.light           Solar Dusk (light)
```

**Theme palette intent:**
- **Midnight Bloom** — deep indigo/violet base with a bloom accent (purple tones); dramatic dark, soft light
- **Modern Minimal** — near-zero chroma neutrals; very clean and desaturated in both modes
- **Solar Dusk** — warm amber/orange accent on a warm-neutral base; rich dark, warm light

Values are generated from tweakcn.com matching these aesthetics and defined as CSS custom properties using the same shadcn token names.

Using `:root.theme-midnight` (specificity `0,2,0`) rather than `.theme-midnight` (`0,1,0`) ensures theme blocks correctly override `:root` (`0,1,0`) regardless of source order. Combined selectors like `:root.theme-midnight.light` (`0,3,0`) correctly win over the plain `.light` default block.

### `useTheme` composable

**Location:** `src/demo/composables/useTheme.ts`

**State (both persisted to `localStorage`):**
- `themeId: Ref<string>` — one of `'default' | 'midnight' | 'minimal' | 'solar'`, default `'default'`
- `isDark: Ref<boolean>` — initialized from `localStorage` if present, otherwise from `window.matchMedia('prefers-color-scheme: dark')`

**Exported:**
- `themes` — static `{ id, name }[]` array for the picker to iterate
- `themeId`, `isDark` — reactive refs (read-only to consumers)
- `setTheme(id)` — removes all `.theme-*` classes from `document.documentElement`, adds `.theme-{id}` unless id is `'default'` (default uses the bare `:root` block), persists to `localStorage`
- `toggleMode()` — flips `isDark`, toggles `.light` on `document.documentElement`, persists to `localStorage`

Composable is a singleton (module-level refs) so state is shared across any component that calls `useTheme()`.

### Demo nav (`src/demo/App.vue`)

Two controls added to the right side of the nav bar, left of the User dropdown:

1. **Mode toggle button** — sun icon when dark, moon icon when light; calls `toggleMode()` on click
2. **Theme picker dropdown** — uses `DropdownMenu`; trigger shows a palette icon; menu lists Default, Midnight Bloom, Modern Minimal, Solar Dusk as `DropdownMenuItem`s; selecting one calls `setTheme(id)`; active theme gets a checkmark

### File changes

| Action | File |
|--------|------|
| Create | `src/demo/composables/useTheme.ts` |
| Modify | `src/assets/css/tailwind.css` (add three theme preset blocks) |
| Modify | `src/demo/App.vue` (add mode toggle + theme picker to nav) |

---

## What does NOT change

- `src/components/entry.ts` — no new exports; theming is demo-only
- `src/assets/css/lib.css` — library CSS is already correct
- All domain model classes, enum, and resource interface — untouched
- Existing Playwright selectors — `PropertyMenu` props and emits are unchanged; only internal rendering changes

---

## Consumer theming contract

A consuming app that wants to override the default theme:
1. Imports `constraint-modeler.css` first
2. Imports its own tweakcn-generated CSS afterward (overrides `:root` and `.light`)
3. Toggles `.light` on `<html>` to switch modes

No configuration of the library is required.
