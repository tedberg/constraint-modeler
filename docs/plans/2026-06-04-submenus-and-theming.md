# Recursive Submenus + Demo Theming Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add recursive flyout submenus to the property picker and a four-preset dark/light theme picker to the demo app.

**Architecture:** Two independent tracks. Submenus: delete `PropertyMenuPartial.vue` and replace with a new recursive `PropertyMenuItem.vue` that renders either `DropdownMenuSub` (parent) or `DropdownMenuItem` (leaf); `PropertyMenu.vue` uses it as a flat loop. Theming: append three CSS token blocks to `tailwind.css` using `:root.theme-*` selectors, add a `useTheme` singleton composable in the demo, and wire two controls into `App.vue`'s nav bar.

**Tech Stack:** Vue 3.5, reka-ui, shadcn-vue (`DropdownMenuSub` / `DropdownMenuSubTrigger` / `DropdownMenuSubContent` already in barrel), Tailwind CSS 4, Vitest 4, Playwright

---

## File Map

| Action | Path |
|--------|------|
| Modify | `src/components/constraint-modeler/StubConstraintModelerResource.ts` |
| Create | `src/components/constraint-modeler/ui/shared/PropertyMenuItem.vue` |
| Modify | `src/components/constraint-modeler/ui/shared/PropertyMenu.vue` |
| Delete | `src/components/constraint-modeler/ui/shared/PropertyMenuPartial.vue` |
| Create | `tests/playwright/submenu.spec.ts` |
| Modify | `src/assets/css/tailwind.css` |
| Create | `src/demo/composables/useTheme.ts` |
| Create | `tests/unit/useTheme.spec.ts` |
| Modify | `src/demo/App.vue` |

---

## Part A — Recursive Submenus

---

### Task A1: Deepen stub data for multi-level nesting

**Files:**
- Modify: `src/components/constraint-modeler/StubConstraintModelerResource.ts`

The `alert` object in `multiPropertyList` currently has one level of nesting. Add a second object-type child (`alert.contact`) with its own `nestedPropertyList` so the demo shows a real two-level cascade. Also capitalize `"alert"` display name to `"Alert"`.

- [ ] **Step 1: Replace the `multiPropertyList` block**

In `StubConstraintModelerResource.ts`, replace:

```typescript
  multiPropertyList: [
    {
      path: "alert",
      displayName: "alert",
      simpleDataType: "object",
      dataType: "com.xyz.Alert",
      expectedDataMagnitude: 10000,
      keyDisplayPropertyPath: null,
      relationship: true,
      multiProperty: true,
      nestedPropertyList: [
        {
          path: "alert.message",
          displayName: "Message",
          simpleDataType: "string",
          dataType: "java.lang.String",
        },
      ],
    },
  ],
```

with:

```typescript
  multiPropertyList: [
    {
      path: "alert",
      displayName: "Alert",
      simpleDataType: "object",
      dataType: "com.xyz.Alert",
      expectedDataMagnitude: 10000,
      keyDisplayPropertyPath: null,
      relationship: true,
      multiProperty: true,
      nestedPropertyList: [
        {
          path: "alert.message",
          displayName: "Message",
          simpleDataType: "string",
          dataType: "java.lang.String",
        },
        {
          path: "alert.contact",
          displayName: "Contact",
          simpleDataType: "object",
          dataType: "com.xyz.Contact",
          relationship: true,
          nestedPropertyList: [
            {
              path: "alert.contact.email",
              displayName: "Email",
              simpleDataType: "string",
              dataType: "java.lang.String",
            },
            {
              path: "alert.contact.phone",
              displayName: "Phone",
              simpleDataType: "string",
              dataType: "java.lang.String",
            },
          ],
        },
      ],
    },
  ],
```

- [ ] **Step 2: Run existing unit tests to confirm no breakage**

```bash
npm run test:unit
```

Expected: all tests pass.

- [ ] **Step 3: Stage**

```bash
git add src/components/constraint-modeler/StubConstraintModelerResource.ts
```

---

### Task A2: Write failing Playwright test for submenu navigation

**Files:**
- Create: `tests/playwright/submenu.spec.ts`

- [ ] **Step 1: Create the spec file**

```typescript
import { test, expect } from '@playwright/test';

test('navigates a two-level property submenu and selects a leaf', async ({ page }) => {
  await page.goto('/simple');

  // Add a constraint so the property menu appears
  await page.getByTestId('add-constraint').click();

  // Open the property menu
  await page.locator('[data-test="property-menu"] button').first().click();

  // Hover over "Alert" to reveal its submenu (it's in the Multi Properties section)
  await page.getByRole('menuitem', { name: /^Alert$/ }).hover();

  // Hover over "Contact" to reveal the second level
  await page.getByRole('menuitem', { name: /^Contact$/ }).hover();

  // Click "Email" in the deepest submenu
  await page.getByRole('menuitem', { name: /^Email$/ }).click();

  // The property menu button should now display "Email"
  await expect(
    page.locator('[data-test="property-menu"] button').first()
  ).toContainText('Email');
});
```

- [ ] **Step 2: Run test — confirm it fails**

```bash
npm run test:e2e:pw -- submenu.spec.ts
```

Expected: FAIL — the menu currently renders items flat inside `DropdownMenuItem` wrappers; there is no `DropdownMenuSub` flyout, so hovering "Alert" opens nothing.

---

### Task A3: Create `PropertyMenuItem.vue`

**Files:**
- Create: `src/components/constraint-modeler/ui/shared/PropertyMenuItem.vue`

This component renders one property at any depth. It is self-recursive.

- [ ] **Step 1: Create the file**

```vue
<template>
  <DropdownMenuSub v-if="hasChildren">
    <DropdownMenuSubTrigger>{{ property.displayName }}</DropdownMenuSubTrigger>
    <DropdownMenuSubContent>
      <PropertyMenuItem
        v-for="child in property.nestedPropertyList"
        :key="child.path"
        :property="child"
        :template-prefix="templatePrefix"
        @setProperty="(p: any) => emit('setProperty', p)"
      />
      <template v-if="property.nestedMultiPropertyList?.length">
        <DropdownMenuSeparator />
        <DropdownMenuLabel>Multi Properties</DropdownMenuLabel>
        <PropertyMenuItem
          v-for="child in property.nestedMultiPropertyList"
          :key="child.path"
          :property="child"
          :template-prefix="templatePrefix"
          @setProperty="(p: any) => emit('setProperty', p)"
        />
      </template>
    </DropdownMenuSubContent>
  </DropdownMenuSub>

  <DropdownMenuItem v-else @select="emit('setProperty', property)">
    {{ property.displayName }}
  </DropdownMenuItem>
</template>

<script setup lang="ts">
import { computed } from "vue";
import {
  DropdownMenuItem,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";

const props = defineProps<{
  property: any;
  templatePrefix: string;
}>();

const emit = defineEmits<{
  setProperty: [property: any];
}>();

const hasChildren = computed(
  () =>
    (Array.isArray(props.property.nestedPropertyList) &&
      props.property.nestedPropertyList.length > 0) ||
    (Array.isArray(props.property.nestedMultiPropertyList) &&
      props.property.nestedMultiPropertyList.length > 0),
);
</script>
```

> **Note:** `property` is typed `any` because top-level entries are `Property` instances while nested entries (`nestedPropertyList` items) are plain JSON objects — both have `displayName`, `path`, and `nestedPropertyList`. No `isObjectType()` call needed; `hasChildren` checks the array directly.

---

### Task A4: Update `PropertyMenu.vue` and delete `PropertyMenuPartial.vue`

**Files:**
- Modify: `src/components/constraint-modeler/ui/shared/PropertyMenu.vue`
- Delete: `src/components/constraint-modeler/ui/shared/PropertyMenuPartial.vue`

- [ ] **Step 1: Replace `PropertyMenu.vue` content**

```vue
<template>
  <DropdownMenu>
    <DropdownMenuTrigger as-child>
      <Button variant="menu" size="xs">{{ propertyDisplay }} <ChevronDown :size="12" /></Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent>
      <PropertyMenuItem
        v-for="prop in propertyList"
        :key="(prop as any).path"
        :property="prop"
        :template-prefix="templatePrefix"
        @setProperty="setProperty"
      />
      <template v-if="multiPropertyList?.length">
        <DropdownMenuSeparator />
        <DropdownMenuLabel>Multi Properties</DropdownMenuLabel>
        <PropertyMenuItem
          v-for="prop in multiPropertyList"
          :key="(prop as any).path"
          :property="prop"
          :template-prefix="templatePrefix"
          @setProperty="setProperty"
        />
      </template>
    </DropdownMenuContent>
  </DropdownMenu>
</template>

<script setup lang="ts">
import { computed } from "vue";
import PropertyMenuItem from "./PropertyMenuItem.vue";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "@lucide/vue";

const props = defineProps({
  templatePrefix: { type: String, required: true },
  propertyList: { type: Array },
  multiPropertyList: { type: Array },
  property: { type: Object },
});

const emit = defineEmits(["setProperty"]);

const propertyDisplay = computed(() => (props.property as any)?.displayName ?? "Chosen Value");

function setProperty(property: any) {
  emit("setProperty", property);
}
</script>
```

- [ ] **Step 2: Delete `PropertyMenuPartial.vue`**

```bash
rm src/components/constraint-modeler/ui/shared/PropertyMenuPartial.vue
```

- [ ] **Step 3: Verify no other file imports `PropertyMenuPartial`**

```bash
grep -r "PropertyMenuPartial" src/
```

Expected: no output.

- [ ] **Step 4: Run the failing Playwright test — confirm it now passes**

```bash
npm run test:e2e:pw -- submenu.spec.ts
```

Expected: PASS.

- [ ] **Step 5: Run the full test suite**

```bash
npm run test:unit && npm run test:e2e:pw
```

Expected: all tests pass.

- [ ] **Step 6: Commit Part A**

```bash
git add src/components/constraint-modeler/StubConstraintModelerResource.ts \
        src/components/constraint-modeler/ui/shared/PropertyMenuItem.vue \
        src/components/constraint-modeler/ui/shared/PropertyMenu.vue \
        tests/playwright/submenu.spec.ts
git rm src/components/constraint-modeler/ui/shared/PropertyMenuPartial.vue
git commit -m "feat: recursive property submenu using DropdownMenuSub"
```

---

## Part B — Demo Theming

---

### Task B1: Add theme CSS variables to `tailwind.css`

**Files:**
- Modify: `src/assets/css/tailwind.css`

Append three theme blocks at the end of the file. Each uses `:root.theme-*` (specificity `0,2,0`) to override the bare `:root` default, and `:root.theme-*.light` (`0,3,0`) for light mode. The `--radius` value is part of each theme to reinforce its character.

- [ ] **Step 1: Append theme blocks to `src/assets/css/tailwind.css`**

Add the following at the bottom of the file:

```css
/* ─── Midnight Bloom ──────────────────────────────────────── */

:root.theme-midnight {
  --radius: 0.75rem;
  --background: oklch(0.112 0.028 278);
  --foreground: oklch(0.942 0.013 278);
  --card: oklch(0.158 0.033 278);
  --card-foreground: oklch(0.942 0.013 278);
  --popover: oklch(0.158 0.033 278);
  --popover-foreground: oklch(0.942 0.013 278);
  --primary: oklch(0.698 0.196 292);
  --primary-foreground: oklch(0.112 0.028 278);
  --secondary: oklch(0.215 0.038 278);
  --secondary-foreground: oklch(0.942 0.013 278);
  --muted: oklch(0.215 0.038 278);
  --muted-foreground: oklch(0.618 0.065 278);
  --accent: oklch(0.215 0.038 278);
  --accent-foreground: oklch(0.942 0.013 278);
  --destructive: oklch(0.648 0.218 22);
  --border: oklch(1 0 0 / 10%);
  --input: oklch(1 0 0 / 15%);
  --ring: oklch(0.698 0.196 292);
}

:root.theme-midnight.light {
  --radius: 0.75rem;
  --background: oklch(0.972 0.008 278);
  --foreground: oklch(0.178 0.028 278);
  --card: oklch(1 0 0);
  --card-foreground: oklch(0.178 0.028 278);
  --popover: oklch(1 0 0);
  --popover-foreground: oklch(0.178 0.028 278);
  --primary: oklch(0.482 0.218 292);
  --primary-foreground: oklch(0.972 0.008 278);
  --secondary: oklch(0.912 0.018 278);
  --secondary-foreground: oklch(0.178 0.028 278);
  --muted: oklch(0.912 0.018 278);
  --muted-foreground: oklch(0.518 0.058 278);
  --accent: oklch(0.912 0.018 278);
  --accent-foreground: oklch(0.178 0.028 278);
  --destructive: oklch(0.552 0.248 27);
  --border: oklch(0.178 0.028 278 / 20%);
  --input: oklch(0.178 0.028 278 / 15%);
  --ring: oklch(0.482 0.218 292);
}

/* ─── Modern Minimal ──────────────────────────────────────── */

:root.theme-minimal {
  --radius: 0.25rem;
  --background: oklch(0.108 0 0);
  --foreground: oklch(0.975 0 0);
  --card: oklch(0.158 0 0);
  --card-foreground: oklch(0.975 0 0);
  --popover: oklch(0.158 0 0);
  --popover-foreground: oklch(0.975 0 0);
  --primary: oklch(0.975 0 0);
  --primary-foreground: oklch(0.158 0 0);
  --secondary: oklch(0.218 0 0);
  --secondary-foreground: oklch(0.975 0 0);
  --muted: oklch(0.218 0 0);
  --muted-foreground: oklch(0.615 0 0);
  --accent: oklch(0.218 0 0);
  --accent-foreground: oklch(0.975 0 0);
  --destructive: oklch(0.648 0.218 22);
  --border: oklch(1 0 0 / 8%);
  --input: oklch(1 0 0 / 12%);
  --ring: oklch(0.615 0 0);
}

:root.theme-minimal.light {
  --radius: 0.25rem;
  --background: oklch(1 0 0);
  --foreground: oklch(0.088 0 0);
  --card: oklch(1 0 0);
  --card-foreground: oklch(0.088 0 0);
  --popover: oklch(1 0 0);
  --popover-foreground: oklch(0.088 0 0);
  --primary: oklch(0.088 0 0);
  --primary-foreground: oklch(1 0 0);
  --secondary: oklch(0.962 0 0);
  --secondary-foreground: oklch(0.088 0 0);
  --muted: oklch(0.962 0 0);
  --muted-foreground: oklch(0.448 0 0);
  --accent: oklch(0.962 0 0);
  --accent-foreground: oklch(0.088 0 0);
  --destructive: oklch(0.528 0.242 27);
  --border: oklch(0 0 0 / 12%);
  --input: oklch(0 0 0 / 10%);
  --ring: oklch(0.448 0 0);
}

/* ─── Solar Dusk ──────────────────────────────────────────── */

:root.theme-solar {
  --radius: 0.625rem;
  --background: oklch(0.128 0.022 55);
  --foreground: oklch(0.948 0.016 72);
  --card: oklch(0.178 0.028 55);
  --card-foreground: oklch(0.948 0.016 72);
  --popover: oklch(0.178 0.028 55);
  --popover-foreground: oklch(0.948 0.016 72);
  --primary: oklch(0.758 0.168 56);
  --primary-foreground: oklch(0.128 0.022 55);
  --secondary: oklch(0.238 0.038 55);
  --secondary-foreground: oklch(0.948 0.016 72);
  --muted: oklch(0.238 0.038 55);
  --muted-foreground: oklch(0.638 0.058 62);
  --accent: oklch(0.238 0.038 55);
  --accent-foreground: oklch(0.948 0.016 72);
  --destructive: oklch(0.648 0.218 22);
  --border: oklch(1 0 0 / 10%);
  --input: oklch(1 0 0 / 15%);
  --ring: oklch(0.758 0.168 56);
}

:root.theme-solar.light {
  --radius: 0.625rem;
  --background: oklch(0.978 0.012 78);
  --foreground: oklch(0.178 0.028 55);
  --card: oklch(1 0 0);
  --card-foreground: oklch(0.178 0.028 55);
  --popover: oklch(1 0 0);
  --popover-foreground: oklch(0.178 0.028 55);
  --primary: oklch(0.598 0.178 53);
  --primary-foreground: oklch(0.978 0.012 78);
  --secondary: oklch(0.928 0.032 72);
  --secondary-foreground: oklch(0.178 0.028 55);
  --muted: oklch(0.928 0.032 72);
  --muted-foreground: oklch(0.518 0.068 58);
  --accent: oklch(0.928 0.032 72);
  --accent-foreground: oklch(0.178 0.028 55);
  --destructive: oklch(0.528 0.242 27);
  --border: oklch(0.178 0.028 55 / 18%);
  --input: oklch(0.178 0.028 55 / 14%);
  --ring: oklch(0.598 0.178 53);
}
```

- [ ] **Step 2: Stage**

```bash
git add src/assets/css/tailwind.css
```

---

### Task B2: Write failing `useTheme` Vitest tests

**Files:**
- Create: `tests/unit/useTheme.spec.ts`

- [ ] **Step 1: Create the test file**

```typescript
import { beforeEach, describe, expect, it, vi } from "vitest";

// Each test gets a fresh module instance via vi.resetModules() + dynamic import
// so the singleton state doesn't bleed between tests.

function mockMatchMedia(matches: boolean) {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: vi.fn().mockReturnValue({ matches }),
  });
}

describe("useTheme", () => {
  beforeEach(async () => {
    localStorage.clear();
    document.documentElement.className = "";
    mockMatchMedia(true); // default: system prefers dark
    vi.resetModules();
  });

  it("initialises with default theme id", async () => {
    const { useTheme } = await import("@/demo/composables/useTheme");
    const { themeId } = useTheme();
    expect(themeId.value).toBe("default");
  });

  it("initialises dark when system prefers dark and no localStorage value", async () => {
    mockMatchMedia(true);
    const { useTheme } = await import("@/demo/composables/useTheme");
    const { isDark } = useTheme();
    expect(isDark.value).toBe(true);
  });

  it("initialises light when system prefers light and no localStorage value", async () => {
    mockMatchMedia(false);
    const { useTheme } = await import("@/demo/composables/useTheme");
    const { isDark } = useTheme();
    expect(isDark.value).toBe(false);
  });

  it("restores themeId from localStorage", async () => {
    localStorage.setItem("cm-theme", "solar");
    const { useTheme } = await import("@/demo/composables/useTheme");
    const { themeId } = useTheme();
    expect(themeId.value).toBe("solar");
  });

  it("restores dark mode from localStorage regardless of system preference", async () => {
    localStorage.setItem("cm-dark", "false");
    mockMatchMedia(true); // system says dark, localStorage says light
    const { useTheme } = await import("@/demo/composables/useTheme");
    const { isDark } = useTheme();
    expect(isDark.value).toBe(false);
  });

  it("setTheme adds the correct class to documentElement", async () => {
    const { useTheme } = await import("@/demo/composables/useTheme");
    const { setTheme } = useTheme();
    setTheme("midnight");
    expect(document.documentElement.classList.contains("theme-midnight")).toBe(true);
  });

  it("setTheme removes previous theme class when switching", async () => {
    const { useTheme } = await import("@/demo/composables/useTheme");
    const { setTheme } = useTheme();
    setTheme("midnight");
    setTheme("solar");
    expect(document.documentElement.classList.contains("theme-midnight")).toBe(false);
    expect(document.documentElement.classList.contains("theme-solar")).toBe(true);
  });

  it("setTheme default removes all theme classes", async () => {
    const { useTheme } = await import("@/demo/composables/useTheme");
    const { setTheme } = useTheme();
    setTheme("minimal");
    setTheme("default");
    expect(
      [...document.documentElement.classList].some((c) => c.startsWith("theme-")),
    ).toBe(false);
  });

  it("setTheme persists to localStorage", async () => {
    const { useTheme } = await import("@/demo/composables/useTheme");
    const { setTheme } = useTheme();
    setTheme("solar");
    expect(localStorage.getItem("cm-theme")).toBe("solar");
  });

  it("toggleMode flips isDark", async () => {
    const { useTheme } = await import("@/demo/composables/useTheme");
    const { isDark, toggleMode } = useTheme();
    const initial = isDark.value;
    toggleMode();
    expect(isDark.value).toBe(!initial);
  });

  it("toggleMode adds .light class when switching to light", async () => {
    localStorage.setItem("cm-dark", "true"); // start dark
    const { useTheme } = await import("@/demo/composables/useTheme");
    const { toggleMode } = useTheme();
    toggleMode(); // dark → light
    expect(document.documentElement.classList.contains("light")).toBe(true);
  });

  it("toggleMode removes .light class when switching to dark", async () => {
    localStorage.setItem("cm-dark", "false"); // start light
    const { useTheme } = await import("@/demo/composables/useTheme");
    const { toggleMode } = useTheme();
    toggleMode(); // light → dark
    expect(document.documentElement.classList.contains("light")).toBe(false);
  });

  it("toggleMode persists to localStorage", async () => {
    const { useTheme } = await import("@/demo/composables/useTheme");
    const { isDark, toggleMode } = useTheme();
    toggleMode();
    expect(localStorage.getItem("cm-dark")).toBe(String(isDark.value));
  });

  it("themes list contains all four entries", async () => {
    const { themes } = await import("@/demo/composables/useTheme");
    expect(themes.map((t) => t.id)).toEqual(["default", "midnight", "minimal", "solar"]);
  });
});
```

- [ ] **Step 2: Run tests — confirm they fail**

```bash
npx vitest run tests/unit/useTheme.spec.ts
```

Expected: FAIL with "Cannot find module '@/demo/composables/useTheme'".

---

### Task B3: Create `useTheme` composable

**Files:**
- Create: `src/demo/composables/useTheme.ts`

- [ ] **Step 1: Create the directory and file**

```bash
mkdir -p src/demo/composables
```

Create `src/demo/composables/useTheme.ts`:

```typescript
import { readonly, ref } from "vue";

export interface Theme {
  id: string;
  name: string;
}

export const themes: Theme[] = [
  { id: "default", name: "Default" },
  { id: "midnight", name: "Midnight Bloom" },
  { id: "minimal", name: "Modern Minimal" },
  { id: "solar", name: "Solar Dusk" },
];

// Singleton refs — shared across all useTheme() calls.
const themeId = ref("default");
const isDark = ref(true);
let _initialized = false;

const VALID_THEME_IDS = new Set(themes.map((t) => t.id));

function validatedThemeId(raw: string | null): string {
  return raw && VALID_THEME_IDS.has(raw) ? raw : "default";
}

function applyToDOM() {
  const el = document.documentElement;
  // Remove any existing theme class
  [...el.classList]
    .filter((c) => c.startsWith("theme-"))
    .forEach((c) => el.classList.remove(c));
  // Add the new theme class (default uses bare :root — no class needed)
  if (themeId.value !== "default") {
    el.classList.add(`theme-${themeId.value}`);
  }
  // Toggle .light for mode
  if (isDark.value) {
    el.classList.remove("light");
  } else {
    el.classList.add("light");
  }
}

export function useTheme() {
  if (!_initialized) {
    _initialized = true;
    themeId.value = validatedThemeId(localStorage.getItem("cm-theme"));
    const saved = localStorage.getItem("cm-dark");
    const prefersDark = window.matchMedia?.("(prefers-color-scheme: dark)").matches ?? true;
    isDark.value = saved !== null ? saved === "true" : prefersDark;
    applyToDOM();
  }

  function setTheme(id: string) {
    if (!VALID_THEME_IDS.has(id)) return;
    themeId.value = id;
    localStorage.setItem("cm-theme", id);
    applyToDOM();
  }

  function toggleMode() {
    isDark.value = !isDark.value;
    localStorage.setItem("cm-dark", String(isDark.value));
    applyToDOM();
  }

  return {
    themes,
    themeId: readonly(themeId),
    isDark: readonly(isDark),
    setTheme,
    toggleMode,
  };
}
```

- [ ] **Step 2: Run the Vitest tests — confirm they pass**

```bash
npx vitest run tests/unit/useTheme.spec.ts
```

Expected: all 13 tests pass.

- [ ] **Step 3: Run full unit suite**

```bash
npm run test:unit
```

Expected: all tests pass.

---

### Task B4: Update `App.vue` with mode toggle and theme picker

**Files:**
- Modify: `src/demo/App.vue`

- [ ] **Step 1: Replace `App.vue` with the updated version**

```vue
<template>
  <div id="app">
    <nav class="flex items-center gap-4 px-4 py-2 bg-zinc-900 text-white text-sm">
      <span class="font-semibold">Constraint Modeler Demo</span>
      <RouterLink to="/" class="hover:text-zinc-300">Home</RouterLink>
      <RouterLink to="/simple" class="hover:text-zinc-300">Simple</RouterLink>
      <RouterLink to="/debug" class="hover:text-zinc-300">Debug</RouterLink>
      <RouterLink to="/projection" class="hover:text-zinc-300">Projection</RouterLink>
      <RouterLink to="/persistent" class="hover:text-zinc-300">Persistent</RouterLink>
      <RouterLink to="/everything" class="hover:text-zinc-300">Everything</RouterLink>

      <div class="ml-auto flex items-center gap-2">
        <!-- Dark / light mode toggle -->
        <button
          class="hover:text-zinc-300 p-1"
          :title="isDark ? 'Switch to light mode' : 'Switch to dark mode'"
          @click="toggleMode"
        >
          <Sun v-if="!isDark" :size="16" />
          <Moon v-else :size="16" />
        </button>

        <!-- Theme picker -->
        <DropdownMenu>
          <DropdownMenuTrigger as-child>
            <button class="hover:text-zinc-300 p-1" title="Choose theme">
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

        <!-- User menu -->
        <DropdownMenu>
          <DropdownMenuTrigger as-child>
            <button class="hover:text-zinc-300"><em>User</em></button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem as-child><a href="#">Profile</a></DropdownMenuItem>
            <DropdownMenuItem as-child><a href="#">Signout</a></DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </nav>

    <div class="p-4">
      <RouterView />
    </div>
  </div>
</template>

<script setup lang="ts">
import { Check, Moon, Palette, Sun } from "@lucide/vue";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTheme } from "./composables/useTheme";

const { themes, themeId, isDark, setTheme, toggleMode } = useTheme();
</script>

<style>
body {
  overflow-y: scroll;
}

a.router-link-exact-active {
  color: #42b983;
}
</style>
```

---

### Task B5: Run full suite, build, and commit Part B

- [ ] **Step 1: Start the dev server and manually verify theme switching**

```bash
npm run dev
```

Open `http://localhost:8080`. In the nav:
- Click the moon icon → page switches to light mode; icon changes to sun
- Click the sun icon → page switches to dark mode
- Click the palette icon → dropdown shows Default, Midnight Bloom, Modern Minimal, Solar Dusk
- Select each theme and confirm the constraint modeler's colors change

Close the dev server (`Ctrl+C`).

- [ ] **Step 2: Run unit tests**

```bash
npm run test:unit
```

Expected: all tests pass.

- [ ] **Step 3: Run Playwright tests**

```bash
npm run test:e2e:pw
```

Expected: all 14 tests pass (13 existing + 1 new submenu spec).

- [ ] **Step 4: Build the library and verify CSS output**

```bash
npm run build:lib
```

Expected: build succeeds, `dist/constraint-modeler.css` is generated (theme CSS is NOT in the lib output — it's in `tailwind.css` which is demo-only; the lib CSS comes from `lib.css`).

- [ ] **Step 5: Commit Part B**

```bash
git add src/assets/css/tailwind.css \
        src/demo/composables/useTheme.ts \
        tests/unit/useTheme.spec.ts \
        src/demo/App.vue
git commit -m "feat: demo theme picker (Midnight Bloom, Modern Minimal, Solar Dusk) + dark/light toggle"
```
