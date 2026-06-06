# Adding the Theme Picker and Dark/Light Toggle

This guide shows how to add the same theme controls that appear in the constraint modeler demo to your own app's navigation bar.

---

## What you'll end up with

- A sun/moon button that toggles dark and light mode
- A palette button that opens a dropdown with four built-in themes
- Preferences persisted to `localStorage` across page loads
- The constraint modeler component automatically follows whichever theme/mode is active

---

## Prerequisites

- Vue 3
- shadcn-vue (`DropdownMenu` components)
- `@lucide/vue` (or swap the icon components for your own)
- `@tedberg/constraint-modeler` installed and its CSS imported

---

## Step 1 — Copy the composable

Add this file to your project (e.g. `src/composables/useConstraintModelerTheme.ts`):

```ts
import { readonly, ref } from "vue";

export interface Theme {
  id: string;
  name: string;
}

export const themes: Theme[] = [
  { id: "default",  name: "Default" },
  { id: "midnight", name: "Midnight Bloom" },
  { id: "minimal",  name: "Modern Minimal" },
  { id: "solar",    name: "Solar Dusk" },
];

// Module-level singletons — shared across all useConstraintModelerTheme() calls.
const themeId = ref("default");
const isDark = ref(false);
let _initialized = false;

const VALID_IDS = new Set(themes.map((t) => t.id));

function applyToDOM() {
  const el = document.documentElement;
  [...el.classList].filter((c) => c.startsWith("theme-")).forEach((c) => el.classList.remove(c));
  if (themeId.value !== "default") {
    el.classList.add(`theme-${themeId.value}`);
  }
  isDark.value ? el.classList.remove("light") : el.classList.add("light");
}

export function useConstraintModelerTheme() {
  if (!_initialized) {
    _initialized = true;
    const savedTheme = localStorage.getItem("cm-theme");
    themeId.value = savedTheme && VALID_IDS.has(savedTheme) ? savedTheme : "default";
    const savedDark = localStorage.getItem("cm-dark");
    isDark.value = savedDark !== null ? savedDark === "true" : false;
    applyToDOM();
  }

  function setTheme(id: string) {
    if (!VALID_IDS.has(id)) return;
    themeId.value = id;
    localStorage.setItem("cm-theme", id);
    applyToDOM();
  }

  function toggleMode() {
    isDark.value = !isDark.value;
    localStorage.setItem("cm-dark", String(isDark.value));
    applyToDOM();
  }

  return { themes, themeId: readonly(themeId), isDark: readonly(isDark), setTheme, toggleMode };
}
```

> **How it works:** `applyToDOM` adds `theme-midnight` / `theme-minimal` / `theme-solar` (or nothing for Default) and `.light` (or removes it for dark) to `<html>`. The library's CSS reacts to those classes on any ancestor element.

---

## Step 2 — Add CSS for the named themes

The library's dist CSS already handles the default dark and light modes on `.constraint-modeler` automatically. For the three named themes you need to add these blocks to your app's CSS file:

```css
/* ─── Midnight Bloom ──────────────────────────────────────── */

.theme-midnight .constraint-modeler,
.theme-midnight .constraint-modeler-portal {
  --cm-radius: 0.75rem;
  --cm-background: oklch(0.112 0.028 278);
  --cm-foreground: oklch(0.942 0.013 278);
  --cm-card: oklch(0.158 0.033 278);
  --cm-card-foreground: oklch(0.942 0.013 278);
  --cm-popover: oklch(0.158 0.033 278);
  --cm-popover-foreground: oklch(0.942 0.013 278);
  --cm-primary: oklch(0.698 0.196 292);
  --cm-primary-foreground: oklch(0.112 0.028 278);
  --cm-secondary: oklch(0.215 0.038 278);
  --cm-secondary-foreground: oklch(0.942 0.013 278);
  --cm-muted: oklch(0.215 0.038 278);
  --cm-muted-foreground: oklch(0.618 0.065 278);
  --cm-accent: oklch(0.215 0.038 278);
  --cm-accent-foreground: oklch(0.942 0.013 278);
  --cm-destructive: oklch(0.648 0.218 22);
  --cm-border: oklch(1 0 0 / 10%);
  --cm-input: oklch(1 0 0 / 15%);
  --cm-ring: oklch(0.698 0.196 292);
  --cm-bar: var(--cm-primary);
  --cm-bar-foreground: var(--cm-primary-foreground);
}

.theme-midnight.light .constraint-modeler,
.theme-midnight.light .constraint-modeler-portal {
  --cm-radius: 0.75rem;
  --cm-background: oklch(0.972 0.008 278);
  --cm-foreground: oklch(0.178 0.028 278);
  --cm-card: oklch(1 0 0);
  --cm-card-foreground: oklch(0.178 0.028 278);
  --cm-popover: oklch(1 0 0);
  --cm-popover-foreground: oklch(0.178 0.028 278);
  --cm-primary: oklch(0.482 0.218 292);
  --cm-primary-foreground: oklch(0.972 0.008 278);
  --cm-secondary: oklch(0.912 0.018 278);
  --cm-secondary-foreground: oklch(0.178 0.028 278);
  --cm-muted: oklch(0.912 0.018 278);
  --cm-muted-foreground: oklch(0.518 0.058 278);
  --cm-accent: oklch(0.912 0.018 278);
  --cm-accent-foreground: oklch(0.178 0.028 278);
  --cm-destructive: oklch(0.552 0.248 27);
  --cm-border: oklch(0.178 0.028 278 / 20%);
  --cm-input: oklch(0.178 0.028 278 / 15%);
  --cm-ring: oklch(0.482 0.218 292);
  --cm-bar: var(--cm-primary);
  --cm-bar-foreground: var(--cm-primary-foreground);
}

/* ─── Modern Minimal ──────────────────────────────────────── */

.theme-minimal .constraint-modeler,
.theme-minimal .constraint-modeler-portal {
  --cm-radius: 0.25rem;
  --cm-background: oklch(0.108 0 0);
  --cm-foreground: oklch(0.975 0 0);
  --cm-card: oklch(0.158 0 0);
  --cm-card-foreground: oklch(0.975 0 0);
  --cm-popover: oklch(0.158 0 0);
  --cm-popover-foreground: oklch(0.975 0 0);
  --cm-primary: oklch(0.975 0 0);
  --cm-primary-foreground: oklch(0.158 0 0);
  --cm-secondary: oklch(0.218 0 0);
  --cm-secondary-foreground: oklch(0.975 0 0);
  --cm-muted: oklch(0.218 0 0);
  --cm-muted-foreground: oklch(0.615 0 0);
  --cm-accent: oklch(0.218 0 0);
  --cm-accent-foreground: oklch(0.975 0 0);
  --cm-destructive: oklch(0.648 0.218 22);
  --cm-border: oklch(1 0 0 / 8%);
  --cm-input: oklch(1 0 0 / 12%);
  --cm-ring: oklch(0.615 0 0);
  --cm-bar: oklch(0.218 0 0);
  --cm-bar-foreground: oklch(0.975 0 0);
}

.theme-minimal.light .constraint-modeler,
.theme-minimal.light .constraint-modeler-portal {
  --cm-radius: 0.25rem;
  --cm-background: oklch(1 0 0);
  --cm-foreground: oklch(0.088 0 0);
  --cm-card: oklch(1 0 0);
  --cm-card-foreground: oklch(0.088 0 0);
  --cm-popover: oklch(1 0 0);
  --cm-popover-foreground: oklch(0.088 0 0);
  --cm-primary: oklch(0.088 0 0);
  --cm-primary-foreground: oklch(1 0 0);
  --cm-secondary: oklch(0.962 0 0);
  --cm-secondary-foreground: oklch(0.088 0 0);
  --cm-muted: oklch(0.962 0 0);
  --cm-muted-foreground: oklch(0.448 0 0);
  --cm-accent: oklch(0.962 0 0);
  --cm-accent-foreground: oklch(0.088 0 0);
  --cm-destructive: oklch(0.528 0.242 27);
  --cm-border: oklch(0 0 0 / 12%);
  --cm-input: oklch(0 0 0 / 10%);
  --cm-ring: oklch(0.448 0 0);
  --cm-bar: oklch(0.088 0 0);
  --cm-bar-foreground: oklch(1 0 0);
}

/* ─── Solar Dusk ──────────────────────────────────────────── */

.theme-solar .constraint-modeler,
.theme-solar .constraint-modeler-portal {
  --cm-radius: 0.625rem;
  --cm-background: oklch(0.128 0.022 55);
  --cm-foreground: oklch(0.948 0.016 72);
  --cm-card: oklch(0.178 0.028 55);
  --cm-card-foreground: oklch(0.948 0.016 72);
  --cm-popover: oklch(0.178 0.028 55);
  --cm-popover-foreground: oklch(0.948 0.016 72);
  --cm-primary: oklch(0.758 0.168 56);
  --cm-primary-foreground: oklch(0.128 0.022 55);
  --cm-secondary: oklch(0.238 0.038 55);
  --cm-secondary-foreground: oklch(0.948 0.016 72);
  --cm-muted: oklch(0.238 0.038 55);
  --cm-muted-foreground: oklch(0.638 0.058 62);
  --cm-accent: oklch(0.238 0.038 55);
  --cm-accent-foreground: oklch(0.948 0.016 72);
  --cm-destructive: oklch(0.648 0.218 22);
  --cm-border: oklch(1 0 0 / 10%);
  --cm-input: oklch(1 0 0 / 15%);
  --cm-ring: oklch(0.758 0.168 56);
  --cm-bar: var(--cm-primary);
  --cm-bar-foreground: var(--cm-primary-foreground);
}

.theme-solar.light .constraint-modeler,
.theme-solar.light .constraint-modeler-portal {
  --cm-radius: 0.625rem;
  --cm-background: oklch(0.978 0.012 78);
  --cm-foreground: oklch(0.178 0.028 55);
  --cm-card: oklch(1 0 0);
  --cm-card-foreground: oklch(0.178 0.028 55);
  --cm-popover: oklch(1 0 0);
  --cm-popover-foreground: oklch(0.178 0.028 55);
  --cm-primary: oklch(0.598 0.178 53);
  --cm-primary-foreground: oklch(0.978 0.012 78);
  --cm-secondary: oklch(0.928 0.032 72);
  --cm-secondary-foreground: oklch(0.178 0.028 55);
  --cm-muted: oklch(0.928 0.032 72);
  --cm-muted-foreground: oklch(0.518 0.068 58);
  --cm-accent: oklch(0.928 0.032 72);
  --cm-accent-foreground: oklch(0.178 0.028 55);
  --cm-destructive: oklch(0.528 0.242 27);
  --cm-border: oklch(0.178 0.028 55 / 18%);
  --cm-input: oklch(0.178 0.028 55 / 14%);
  --cm-ring: oklch(0.598 0.178 53);
  --cm-bar: var(--cm-primary);
  --cm-bar-foreground: var(--cm-primary-foreground);
}
```

If you only need the component to respond to dark/light and don't need the named themes, skip these blocks entirely.

---

## Step 3 — Add the controls to your nav bar

```vue
<script setup lang="ts">
import { Check, Moon, Palette, Sun } from "@lucide/vue";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useConstraintModelerTheme } from "@/composables/useConstraintModelerTheme";

const { themes, themeId, isDark, setTheme, toggleMode } = useConstraintModelerTheme();
</script>

<template>
  <nav>
    <!-- ... your existing nav content ... -->

    <div class="ml-auto flex items-center gap-2">

      <!-- Dark / light toggle -->
      <button
        :title="isDark ? 'Switch to light mode' : 'Switch to dark mode'"
        @click="toggleMode"
      >
        <Sun v-if="!isDark" :size="16" />
        <Moon v-else :size="16" />
      </button>

      <!-- Theme picker -->
      <DropdownMenu>
        <DropdownMenuTrigger as-child>
          <button title="Choose theme">
            <Palette :size="16" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem
            v-for="theme in themes"
            :key="theme.id"
            class="flex items-center gap-2"
            @select="setTheme(theme.id)"
          >
            <Check v-if="themeId === theme.id" :size="12" />
            <span v-else class="inline-block w-3" />
            {{ theme.name }}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

    </div>
  </nav>
</template>
```

---

## Customising the theme list

To remove themes you don't want, edit the `themes` array in the composable. The `id` values (`midnight`, `minimal`, `solar`) must match the CSS class prefixes — if you remove a theme from the array, you can also remove its CSS blocks.

To add a custom theme, add an entry to `themes` and a pair of CSS blocks (dark + light) following the same `--cm-*` variable names.

---

## Applying themes to your own app UI (optional)

The composable only controls what the constraint modeler component looks like. If you also want your app's nav bar, cards, etc. to respond to the same theme and mode toggle, add `:root.theme-*` CSS variable blocks mirroring your design system's shadcn tokens alongside the `.constraint-modeler` blocks above. The `useConstraintModelerTheme` composable applies the same classes to `<html>` that would drive both.
