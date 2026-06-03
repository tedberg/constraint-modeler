# Phase 2: Tailwind + ShadCN Vue Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Prerequisite:** Phase 1 plan is fully complete -- all `.ts` conversions done, all components on `<script setup lang="ts">`, 13/13 Playwright + 79 unit tests green.

**Goal:** Swap the visual layer from Bootstrap 5 + bootstrap-vue-next to Tailwind 4 + shadcn-vue with zero logic changes. Only `<template>` and `<style>` blocks change. All 13 Playwright + 79 unit tests remain green throughout. Visual output must be identical to today.

**Architecture:** Tailwind 4 is configured as a Vite plugin (no postcss config file). Dark is the default at `:root`, light is opt-in via `.light` class (matching current dark theme). shadcn-vue components are copied (not npm-imported) into `src/components/ui/`. The main challenge is the Playwright selector update: BVN's `b-nav-item-dropdown` renders `<a class="nav-link">` as its trigger; shadcn's `DropdownMenuTrigger` renders a `<button>`.

**Tech Stack:** Tailwind 4, `@tailwindcss/vite`, shadcn-vue, reka-ui, lucide-vue-next, clsx, tailwind-merge, class-variance-authority

---

## File Map

**Created:**
- `src/assets/css/tailwind.css`
- `src/lib/utils.ts`
- `src/components/ui/button/` (shadcn Button)
- `src/components/ui/dropdown-menu/` (shadcn DropdownMenu)
- `src/components/ui/alert/` (shadcn Alert)

**Modified (template + style only, script blocks untouched):**
- `src/components/constraint-modeler/ui/constraint/ComparisonMenu.vue`
- `src/components/constraint-modeler/ui/constraint/JunctionMenu.vue`
- `src/components/constraint-modeler/ui/shared/PropertyMenu.vue`
- `src/components/constraint-modeler/ui/shared/QueryFunctionMenu.vue`
- `src/components/constraint-modeler/ui/constraint/Constraint.vue`
- `src/components/constraint-modeler/ui/constraint/ConstraintGroup.vue`
- `src/components/constraint-modeler/ui/projection/Projection.vue`
- `src/components/constraint-modeler/ui/projection/ProjectionGroup.vue`
- `src/components/constraint-modeler/ui/ConstraintModeler.vue`
- `src/demo/App.vue` (BVN navbar → Tailwind nav + shadcn DropdownMenu)
- `src/demo/views/ListGrid.vue` (`b-table` → plain HTML table)
- `src/main.ts` (remove BVN imports/registration)
- `vite.config.ts` (add Tailwind plugin, remove BVN/axios externals)
- `package.json` (deps added/removed)
- `tests/playwright/CLAUDE.md` (selector documentation updated)
- All 13 Playwright spec files (selector updates)

**Deleted:**
- `src/assets/images/icons/accept.png`
- `src/assets/images/icons/error.png`

---

## Task 1: Install Tailwind 4 + shadcn-vue dependencies

- [ ] **Step 1: Install production dependencies**

```bash
npm install shadcn-vue reka-ui class-variance-authority clsx tailwind-merge lucide-vue-next
```

- [ ] **Step 2: Install dev dependencies**

```bash
npm install --save-dev tailwindcss @tailwindcss/vite tw-animate-css
```

- [ ] **Step 3: Run unit tests -- confirm no breakage**

```bash
npm run test:unit
```

Expected: 79 passing.

- [ ] **Step 4: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: add Tailwind 4 and shadcn-vue dependencies"
```

---

## Task 2: Tailwind CSS setup + Vite plugin

**Files:**
- Create: `src/assets/css/tailwind.css`
- Modify: `vite.config.ts`

- [ ] **Step 1: Create `src/assets/css/tailwind.css`**

```css
@import "tailwindcss";
@import "tw-animate-css";

@custom-variant dark (&:is(.dark *));

@theme inline {
  --radius-sm: calc(var(--radius) - 4px);
  --radius-md: calc(var(--radius) - 2px);
  --radius-lg: var(--radius);
  --radius-xl: calc(var(--radius) + 4px);
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-card: var(--card);
  --color-card-foreground: var(--card-foreground);
  --color-popover: var(--popover);
  --color-popover-foreground: var(--popover-foreground);
  --color-primary: var(--primary);
  --color-primary-foreground: var(--primary-foreground);
  --color-secondary: var(--secondary);
  --color-secondary-foreground: var(--secondary-foreground);
  --color-muted: var(--muted);
  --color-muted-foreground: var(--muted-foreground);
  --color-accent: var(--accent);
  --color-accent-foreground: var(--accent-foreground);
  --color-destructive: var(--destructive);
  --color-border: var(--border);
  --color-input: var(--input);
  --color-ring: var(--ring);
}

:root {
  --radius: 0.625rem;
  --background: oklch(0.145 0 0);
  --foreground: oklch(0.985 0 0);
  --card: oklch(0.205 0 0);
  --card-foreground: oklch(0.985 0 0);
  --popover: oklch(0.205 0 0);
  --popover-foreground: oklch(0.985 0 0);
  --primary: oklch(0.922 0 0);
  --primary-foreground: oklch(0.205 0 0);
  --secondary: oklch(0.269 0 0);
  --secondary-foreground: oklch(0.985 0 0);
  --muted: oklch(0.269 0 0);
  --muted-foreground: oklch(0.708 0 0);
  --accent: oklch(0.269 0 0);
  --accent-foreground: oklch(0.985 0 0);
  --destructive: oklch(0.704 0.191 22.216);
  --border: oklch(1 0 0 / 10%);
  --input: oklch(1 0 0 / 15%);
  --ring: oklch(0.556 0 0);
}

.light {
  --background: oklch(1 0 0);
  --foreground: oklch(0.145 0 0);
  --card: oklch(1 0 0);
  --card-foreground: oklch(0.145 0 0);
  --popover: oklch(1 0 0);
  --popover-foreground: oklch(0.145 0 0);
  --primary: oklch(0.205 0 0);
  --primary-foreground: oklch(0.985 0 0);
  --secondary: oklch(0.961 0 0);
  --secondary-foreground: oklch(0.205 0 0);
  --muted: oklch(0.961 0 0);
  --muted-foreground: oklch(0.556 0 0);
  --accent: oklch(0.961 0 0);
  --accent-foreground: oklch(0.205 0 0);
  --destructive: oklch(0.577 0.245 27.325);
  --border: oklch(0.922 0 0);
  --input: oklch(0.922 0 0);
  --ring: oklch(0.708 0 0);
}
```

- [ ] **Step 2: Add Tailwind plugin to `vite.config.ts`**

Add `import tailwindcss from '@tailwindcss/vite'` at the top, then add `tailwindcss()` to the `plugins` array in **both** the `lib` and the app build configs:

```typescript
import tailwindcss from '@tailwindcss/vite';

// lib build:
plugins: [tailwindcss(), vue()],

// app build:
plugins: [tailwindcss(), vue()],
```

Also remove `@vitejs/plugin-vue-jsx` from the import and plugins (no JSX anywhere after Phase 1).

- [ ] **Step 3: Add Tailwind CSS import to `src/main.ts` AND `src/components/entry.ts`**

Add at the top of `src/main.ts`:

```typescript
import '@/assets/css/tailwind.css';
```

Add the same import at the top of `src/components/entry.ts` so the lib build includes the stylesheet:

```typescript
import '@/assets/css/tailwind.css';
```

- [ ] **Step 4: Verify the lib build emits CSS**

```bash
npm run build:lib
```

Expected: `dist/constraint-modeler.css` is created and contains Tailwind utility classes. If the file is missing or empty, the `entry.ts` import is not in the Vite lib build graph — double-check the import was added.

- [ ] **Step 5: Start dev server and confirm dark background renders**

```bash
npm run dev
```

Open `http://localhost:8080` in a browser. Expected: page loads, dark background visible from Tailwind `:root` variables.

- [ ] **Step 6: Commit**

```bash
git add src/assets/css/tailwind.css src/main.ts src/components/entry.ts vite.config.ts package.json package-lock.json
git commit -m "feat: add Tailwind 4 CSS foundation with dark-default theme tokens"
```

---

## Task 3: Add shadcn-vue utilities + install components

**Files:**
- Create: `src/lib/utils.ts`
- Run shadcn-vue CLI to install Button, DropdownMenu, Alert components

- [ ] **Step 1: Create `src/lib/utils.ts`**

```typescript
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

- [ ] **Step 2: Initialize shadcn-vue (first-time setup)**

```bash
npx shadcn-vue@latest init
```

When prompted:
- Style: Default
- Base color: Neutral
- CSS file: `src/assets/css/tailwind.css` (existing file)
- Use CSS variables: Yes
- `components.json` location: project root

Review the generated `components.json` -- it should point to `src/components/ui` as the component destination.

- [ ] **Step 3: Install Button component**

```bash
npx shadcn-vue@latest add button
```

Expected: creates `src/components/ui/button/Button.vue` (and index).

- [ ] **Step 4: Install DropdownMenu component**

```bash
npx shadcn-vue@latest add dropdown-menu
```

Expected: creates `src/components/ui/dropdown-menu/` with DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator.

- [ ] **Step 5: Install Alert component**

```bash
npx shadcn-vue@latest add alert
```

Expected: creates `src/components/ui/alert/`.

- [ ] **Step 6: Run unit tests**

```bash
npm run test:unit
```

Expected: 79 passing.

- [ ] **Step 7: Commit**

```bash
git add src/lib/ src/components/ui/ components.json
git commit -m "feat: add shadcn-vue utility and install Button, DropdownMenu, Alert components"
```

---

## Task 4: Replace BVN dropdowns in menu components

Replace `b-nav-item-dropdown` + `b-dropdown-item` with shadcn `DropdownMenu` in all four menu components. Script blocks are untouched -- only template changes.

- [ ] **Step 1: Replace template in `JunctionMenu.vue`**

```html
<template>
  <DropdownMenu>
    <DropdownMenuTrigger as-child>
      <Button variant="secondary" size="sm">{{ junction.label }}</Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent>
      <DropdownMenuItem
        v-for="item in typesArray"
        :key="item.key"
        @click.prevent="setJunction(item.key)">
        {{ item.label }}
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
</template>
```

Add to the `<script setup>` imports (script block otherwise unchanged):

```typescript
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
```

Remove any `<style>` block with `lang="scss"` (already removed in Phase 1 Task 14; confirm it's plain or empty).

- [ ] **Step 2: Replace template in `ComparisonMenu.vue`**

```html
<template>
  <DropdownMenu>
    <DropdownMenuTrigger as-child>
      <Button variant="secondary" size="sm">{{ comparisonType.label }}</Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent>
      <DropdownMenuItem
        v-for="item in comparisonTypeArray"
        :key="item.key"
        @click.prevent="setComparator(item.key)">
        {{ item.label }}
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
</template>
```

Add shadcn imports to `<script setup>`:

```typescript
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
```

- [ ] **Step 3: Replace template in `QueryFunctionMenu.vue`**

```html
<template>
  <DropdownMenu>
    <DropdownMenuTrigger as-child>
      <Button variant="secondary" size="sm">{{ queryFunctionDisplay }}</Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent>
      <DropdownMenuLabel>Aggregates</DropdownMenuLabel>
      <DropdownMenuItem
        v-for="item in aggregateArray"
        :key="item.key"
        @click.prevent="setQueryFunction(item.key)">
        {{ item.label }}
      </DropdownMenuItem>
      <DropdownMenuSeparator />
      <DropdownMenuLabel>Functions</DropdownMenuLabel>
      <DropdownMenuItem
        v-for="item in queryFunctionArray"
        :key="item.key"
        @click.prevent="setQueryFunction(item.key)">
        {{ item.label }}
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
</template>
```

Add shadcn imports:

```typescript
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
```

- [ ] **Step 4: Replace template in `PropertyMenu.vue`**

```html
<template>
  <DropdownMenu>
    <DropdownMenuTrigger as-child>
      <Button variant="secondary" size="sm">{{ propertyDisplay }}</Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent>
      <DropdownMenuItem
        v-for="prop in propertyList"
        :key="prop.path"
        @click.prevent="setProperty(prop)">
        {{ prop.displayName }} {{ typeof prop.simpleDataType === 'object' ? '»' : '' }}
      </DropdownMenuItem>
      <template v-if="multiPropertyList">
        <DropdownMenuSeparator />
        <DropdownMenuLabel>Multi Properties</DropdownMenuLabel>
        <DropdownMenuItem
          v-for="prop in multiPropertyList"
          :key="prop.path"
          @click.prevent="setProperty(prop)">
          {{ prop.displayName }} {{ prop.isObjectType() ? '»' : '' }}
          <PropertyMenuPartial :property="prop" :template-prefix="templatePrefix" />
        </DropdownMenuItem>
      </template>
    </DropdownMenuContent>
  </DropdownMenu>
</template>
```

Add shadcn imports:

```typescript
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
```

- [ ] **Step 5: Start dev server and manually test dropdown menus**

```bash
npm run dev
```

Navigate to `/simple`, add a constraint. Click the property, comparison, and query function menus. Each should open and allow selection.

- [ ] **Step 6: Commit**

```bash
git add src/components/constraint-modeler/ui/
git commit -m "feat: replace b-nav-item-dropdown with shadcn DropdownMenu in all menu components"
```

---

## Task 5: Replace Bootstrap layout + buttons in constraint/projection bars

Replace Bootstrap navbar layout and `btn btn-sm` buttons with Tailwind flex rows and shadcn `Button`.

- [ ] **Step 1: Replace template in `ConstraintGroup.vue`**

Replace the Bootstrap navbar structure with a Tailwind flex row:

```html
<template>
  <div :class="['constraint-group', {'root': isRoot}]" data-test="constraint-group">
    <div class="flex items-center gap-1 bg-neutral-900 rounded-md mb-1 px-2 py-1 constraint-group-bar" :id="constraintGroupId">
      <div class="flex items-center gap-1">
        <junction-menu :junction="junction" @setJunction="setJunction" />
        <Button variant="secondary" size="sm" data-test="add-constraint" @click.prevent="addConstraint">+ C</Button>
        <Button variant="secondary" size="sm" data-test="add-constraint-group" @click.prevent="addConstraintGroup">+ CG</Button>
      </div>
      <div class="ml-auto">
        <Button v-if="isRoot" variant="secondary" size="sm" data-test="apply" @click.prevent="apply">Apply</Button>
        <Button v-else variant="secondary" size="sm" data-test="remove-constraint" @click.prevent="removeSelf">X</Button>
      </div>
    </div>

    <constraint v-for="constraint in constraintList"
                :key="constraint.getObjectId()"
                :constraint-model="constraint"
                :template-prefix="templatePrefix"
                :propertyList="propertyList"
                :multiPropertyList="multiPropertyList"
                :pathToPropertyMap="pathToPropertyMap"
                @removeConstraint="removeConstraint"/>

    <constraint-group v-for="constraintGroup in constraintGroupList"
                      :key="constraintGroup.getObjectId()"
                      :constraint-group-model="constraintGroup"
                      :template-prefix="templatePrefix"
                      :propertyList="propertyList"
                      :multiPropertyList="multiPropertyList"
                      :pathToPropertyMap="pathToPropertyMap"/>
  </div>
</template>
```

Add to `<script setup>` imports:

```typescript
import { Button } from '@/components/ui/button';
```

Replace `<style scoped>` with:

```css
<style scoped>
div.constraint-group:not(.root) {
  margin-left: 15px;
}
.constraint-group-bar {
  width: 225px;
}
</style>
```

- [ ] **Step 2: Replace template in `Constraint.vue`**

Replace Bootstrap navbar with Tailwind flex row. Replace `<img>` validity icons with lucide icons. Remove `acceptIcon` / `errorIcon` imports from script.

```html
<template>
  <div class="flex items-center gap-1 bg-neutral-900 rounded-md mb-1 px-2 py-1 ml-4 constraint-bar" :id="constraintId" data-test="constraint">
    <div class="flex items-center gap-1">
      <div :id="aggregateId" data-test="query-function-menu">
        <query-function-menu :query-function="queryFunctionEnum"
                             :template-prefix="templatePrefix"
                             @setQueryFunction="setQueryFunctionEnum"/>
      </div>
      <div :id="propertyId" data-test="property-menu">
        <property-menu :property="property"
                       :property-list="propertyList"
                       :multi-property-list="multiPropertyList"
                       :template-prefix="templatePrefix"
                       @setProperty="setProperty"/>
      </div>
      <div :id="comparisonId" data-test="comparison-menu">
        <comparison-menu :comparison-type="comparisonType"
                         :data-type="dataType"
                         :query-function="queryFunctionEnum"
                         :property="property"
                         :template-prefix="templatePrefix"
                         @setComparator="setComparator"/>
      </div>
    </div>

    <div :id="valueEntriesId" data-test="value-input" data-testid="value-input">
      <value-input :property="property"
                   :comparison-type="comparisonType"
                   :value-array="valueArray"
                   :template-prefix="templatePrefix"
                   :object-id="objectId"
                   @updateValueArray="updateValueArray"/>
    </div>

    <div class="ml-auto flex items-center gap-1">
      <div class="validity">
        <div v-if="isValid == null"></div>
        <div v-else-if="isValid" class="text-green-500"><CheckCircle2 :size="16" /></div>
        <div v-else class="text-red-500" :title="invalidReason"><XCircle :size="16" /></div>
      </div>
      <Button variant="secondary" size="sm" @click.prevent="removeConstraint">X</Button>
    </div>
  </div>
</template>
```

Add to `<script setup>` imports (remove `acceptIcon` / `errorIcon` imports):

```typescript
import { Button } from '@/components/ui/button';
import { CheckCircle2, XCircle } from 'lucide-vue-next';
```

Remove these lines from `<script setup>` (no longer needed):

```typescript
import acceptIcon from '@/assets/images/icons/accept.png';
import errorIcon from '@/assets/images/icons/error.png';
```

Update `<style scoped>`:

```css
<style scoped>
.constraint-bar {
  max-width: 800px;
}
</style>
```

- [ ] **Step 3: Replace template in `ProjectionGroup.vue`**

```html
<template>
  <div class="projection-group" data-test="projection-group">
    <div class="flex items-center gap-1 bg-neutral-900 rounded-md mb-1 px-2 py-1 projection-group-bar" :id="projectionGroupId">
      <Button variant="secondary" size="sm" data-test="add-projection" data-testid="add-projection" @click.prevent="addProjection()">+ P</Button>
    </div>

    <projection v-for="(projection, index) in projectionList"
                :key="projection.getObjectId()"
                :projection-model="projection"
                :template-prefix="templatePrefix"
                :propertyList="propertyList"
                :multiPropertyList="multiPropertyList"
                :pathToPropertyMap="pathToPropertyMap"
                @removeSelf="removeProjection(projection, index)"/>
  </div>
</template>
```

Add to imports:

```typescript
import { Button } from '@/components/ui/button';
```

Update `<style scoped>`:

```css
<style scoped>
.projection-group-bar {
  width: 225px;
}
</style>
```

- [ ] **Step 4: Replace template in `Projection.vue`**

```html
<template>
  <div class="flex items-center gap-1 bg-neutral-900 rounded-md mb-1 px-2 py-1 ml-4 projection-bar" :id="projectionId" data-test="projection" data-testid="projection">
    <div class="flex items-center gap-1">
      <div :id="aggregateId">
        <query-function-menu :query-function="queryFunctionEnum"
                             :template-prefix="templatePrefix"
                             @setQueryFunction="setQueryFunctionEnum"/>
      </div>
      <div :id="propertyId" data-testid="projection-property-menu">
        <property-menu :property="property"
                       :property-list="propertyList"
                       :multi-property-list="multiPropertyList"
                       :template-prefix="templatePrefix"
                       @setProperty="setProperty"/>
      </div>
    </div>
    <div class="ml-auto">
      <Button variant="secondary" size="sm" @click.prevent="removeProjection">X</Button>
    </div>
  </div>
</template>
```

Add to imports:

```typescript
import { Button } from '@/components/ui/button';
```

Update `<style scoped>`:

```css
<style scoped>
.projection-bar {
  width: 400px;
}
</style>
```

- [ ] **Step 5: Start dev server and manually test constraint + projection bars**

```bash
npm run dev
```

Navigate to `/simple` and `/projection`. Add constraints and projections. Confirm buttons are functional and layout looks like the current dark-themed version.

- [ ] **Step 6: Commit**

```bash
git add src/components/constraint-modeler/ui/
git commit -m "feat: replace Bootstrap navbar layout with Tailwind flex rows, use shadcn Button and lucide icons"
```

---

## Task 6: Replace `b-alert` + root buttons in `ConstraintModeler.vue`

- [ ] **Step 1: Replace template in `ConstraintModeler.vue`**

Replace the three `b-alert` usages and the `btn btn-dark btn-sm` buttons. The overall structure remains the same:

```html
<template>
  <div class="constraint-modeler">

    <div v-if="title">
      <div class="title">{{ title }}</div>
    </div>

    <div v-if="componentReady">

      <constraint-group :constraint-group-model="rootConstraintGroup"
                        :templatePrefix="templatePrefix"
                        :propertyList="propertyList"
                        :multiPropertyList="multiPropertyList"
                        :pathToPropertyMap="pathToPropertyMap"/>

      <projection-group v-if="exposeProjectionModeler"
                        :projection-group-model="model.getProjectionGroup()"
                        :templatePrefix="templatePrefix"
                        :propertyList="propertyList"
                        :multiPropertyList="multiPropertyList"
                        :pathToPropertyMap="pathToPropertyMap"
                        @addProjection="addProjection"
                        @removeProjection="removeProjection"/>

      <div v-if="showDebug" style="width: 250px;" class="debug-panel">
        <div class="header" id="toggle-constraintModelerDebug">Debug Options</div>
        <ul class="constraintModelerDebug">
          <li><a @click.prevent="renderQueryString()">Render Query String</a></li>
          <li><a @click.prevent="renderSimpleJSON()">Render JSON</a></li>
          <li><a @click.prevent="renderFlattenedObjectList()">Render Flattened Object List</a></li>
          <li><a @click.prevent="renderStructuredObjectList()">Render Structured Object List</a></li>
        </ul>
      </div>

      <div class="alerts">
        <Alert v-if="syntaxDisplay !== ''" variant="default" class="mb-2">
          <AlertDescription>
            <span class="syntaxDisplay">{{ syntaxDisplay }}</span>
            <Button variant="ghost" size="sm" class="ml-2" @click="syntaxDisplay = ''">x</Button>
          </AlertDescription>
        </Alert>

        <Alert v-if="successDisplay !== ''" class="mb-2 border-green-600 text-green-400">
          <AlertDescription>
            {{ successDisplay }}
            <Button variant="ghost" size="sm" class="ml-2" @click="successDisplay = ''">x</Button>
          </AlertDescription>
        </Alert>

        <Alert v-if="errorDisplay !== ''" variant="destructive" class="mb-2">
          <AlertDescription>
            {{ errorDisplay }}
            <Button variant="ghost" size="sm" class="ml-2" @click="errorDisplay = ''">x</Button>
          </AlertDescription>
        </Alert>
      </div>

      <div class="buttons">
        <Button variant="default" size="sm" class="mt-2 me-2" @click.prevent="validateAndApply()">Apply</Button>
        <Button variant="default" size="sm" class="mt-2 me-2" @click.prevent="renderSyntax()">Render Syntax</Button>
        <Button v-if="isSaveSupported" variant="default" size="sm" class="mt-2 me-2" @click.prevent="save()">Save</Button>
      </div>

    </div>

  </div>
</template>
```

Add to `<script setup>` imports:

```typescript
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
```

Update `<style scoped>`:

```css
<style scoped>
:deep(div.nest) {
  margin-left: 25px;
}

div.constraint-modeler {
  & :deep(input[type='text']) {
    width: 100px;
  }
  & :deep(.buttons) {
    text-align: center;
  }
}

ul.constraintModelerDebug {
  & a {
    text-decoration: #0000cc;
    text-decoration-line: underline;
    cursor: pointer;
  }
}
</style>
```

- [ ] **Step 2: Start dev server and test Apply button + alerts**

```bash
npm run dev
```

Navigate to `/simple`. Add a constraint and click Apply. Confirm validation runs and success/error alerts display and dismiss correctly.

- [ ] **Step 3: Commit**

```bash
git add src/components/constraint-modeler/ui/ConstraintModeler.vue
git commit -m "feat: replace b-alert and Bootstrap buttons with shadcn Alert and Button in ConstraintModeler"
```

---

## Task 7: Migrate demo shell — `App.vue` and `ListGrid.vue`

**Files:**
- Modify: `src/demo/App.vue`
- Modify: `src/demo/views/ListGrid.vue`

- [ ] **Step 1: Replace BVN navbar in `App.vue` with Tailwind nav + shadcn DropdownMenu**

Replace the entire `App.vue` content:

```vue
<template>
  <div id="app">
    <nav class="flex items-center justify-between px-4 py-2 bg-zinc-900 text-white">
      <span class="font-semibold text-sm">Constraint Modeler Demo</span>
      <div class="flex items-center gap-4 text-sm">
        <RouterLink to="/" class="hover:text-zinc-300">Home</RouterLink>
        <RouterLink to="/simple" class="hover:text-zinc-300">Simple</RouterLink>
        <RouterLink to="/debug" class="hover:text-zinc-300">Debug</RouterLink>
        <RouterLink to="/projection" class="hover:text-zinc-300">Projection</RouterLink>
        <RouterLink to="/persistent" class="hover:text-zinc-300">Persistent</RouterLink>
        <RouterLink to="/everything" class="hover:text-zinc-300">Everything</RouterLink>

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
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
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

- [ ] **Step 2: Replace `b-table` in `ListGrid.vue` with plain HTML table**

The replacement must preserve two behaviors that all five demo views rely on:
- `sortable: true` fields — clicking the column header sorts rows client-side (ascending → descending → unsorted)
- `formatter: (value) => string` — the function is called when rendering the cell value (e.g. `ENABLED` → `Yep`, `DISABLED` → `Nope`)

Replace the entire `ListGrid.vue` content:

```vue
<template>
  <div class="overflow-x-auto">
    <table class="w-full text-sm border-collapse border border-zinc-700">
      <thead>
        <tr class="bg-zinc-800">
          <th
            v-for="field in normalizedFields"
            :key="field.key"
            class="border border-zinc-700 px-3 py-2 text-left font-medium text-zinc-200"
            :class="{ 'cursor-pointer select-none': field.sortable }"
            @click="field.sortable ? toggleSort(field.key) : undefined"
          >
            {{ field.label ?? field.key }}
            <span v-if="sortKey === field.key">{{ sortDir === 'asc' ? ' ↑' : ' ↓' }}</span>
          </th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="(row, i) in sortedItems"
          :key="i"
          class="odd:bg-zinc-900 even:bg-zinc-800/50 hover:bg-zinc-700/50"
        >
          <td
            v-for="field in normalizedFields"
            :key="field.key"
            class="border border-zinc-700 px-3 py-2 text-zinc-300"
          >
            {{ field.formatter ? field.formatter(row[field.key]) : row[field.key] }}
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';

type FieldDef = {
  key: string;
  label?: string;
  sortable?: boolean;
  formatter?: (value: unknown) => string;
};

const props = defineProps<{
  objectName: string;
  maxRowsPerPage?: number;
  name?: string;
  fields: (string | FieldDef)[];
  items: Record<string, unknown>[];
}>();

const normalizedFields = computed<FieldDef[]>(() =>
  props.fields.map((f) => (typeof f === 'string' ? { key: f } : f)),
);

const sortKey = ref<string | null>(null);
const sortDir = ref<'asc' | 'desc'>('asc');

function toggleSort(key: string) {
  if (sortKey.value === key) {
    if (sortDir.value === 'asc') {
      sortDir.value = 'desc';
    } else {
      sortKey.value = null;
    }
  } else {
    sortKey.value = key;
    sortDir.value = 'asc';
  }
}

const sortedItems = computed(() => {
  if (!sortKey.value) return props.items;
  const key = sortKey.value;
  const dir = sortDir.value === 'asc' ? 1 : -1;
  return [...props.items].sort((a, b) => {
    const av = a[key];
    const bv = b[key];
    if (av == null) return 1;
    if (bv == null) return -1;
    return av < bv ? -dir : av > bv ? dir : 0;
  });
});
</script>
```

- [ ] **Step 3: Add Playwright assertion for formatter output**

The existing Playwright suite does not assert the formatted `status` cell values (`Yep`/`Nope`), so this regression can ship green without this step. Add an assertion to at least one debug/results spec:

```typescript
// In an existing spec that loads a results table (e.g. tests/playwright/debug.spec.ts or similar)
// After triggering a query that returns results:
const statusCells = page.locator('td').filter({ hasText: /^(Yep|Nope)$/ });
await expect(statusCells.first()).toBeVisible();
```

Locate the right spec file and add this check after the existing results assertion.

- [ ] **Step 4: Start dev server and verify demo nav and table render**

```bash
npm run dev
```

Open `http://localhost:8080`. Check:
- Nav bar renders with dark Tailwind background and white links
- Active route link is green
- User dropdown opens and shows Profile / Signout items
- Navigate to the Debug or Everything route, run a query, and confirm:
  - Results grid renders with correct column headers and rows
  - Status column shows `Yep` / `Nope` (not `ENABLED` / `DISABLED`)
  - Clicking a sortable column header sorts the rows; clicking again reverses; clicking a third time clears the sort

- [ ] **Step 5: Run Playwright tests**

```bash
npm run test:e2e:pw
```

Expected: 13/13 passing (plus the new formatter assertion).

- [ ] **Step 6: Commit**

```bash
git add src/demo/App.vue src/demo/views/ListGrid.vue tests/playwright/
git commit -m "feat: migrate demo shell to Tailwind nav and plain HTML table"
```

---

## Task 8: Remove Bootstrap/BVN from `main.ts`; remove deps

**Files:**
- Modify: `src/main.ts`
- Modify: `package.json`

- [ ] **Step 1: Clean up `main.ts`**

Remove all BVN imports and registrations. The file should become:

```typescript
import { createApp } from 'vue';
import App from './demo/App.vue';
import router from './demo/router';
import '@/assets/css/tailwind.css';

const app = createApp(App);
app.use(router);
app.mount('#app');
```

- [ ] **Step 2: Remove Bootstrap + BVN from dependencies and peerDependencies**

```bash
npm uninstall bootstrap bootstrap-vue-next
```

Edit `package.json` manually to also remove them from `peerDependencies`.

- [ ] **Step 3: Remove BVN from `vite.config.ts` rollup externals**

In the lib build config, change externals to:

```typescript
external: ['vue', 'vue-router'],
output: {
  globals: { vue: 'Vue' },
},
```

- [ ] **Step 4: Remove `@vitejs/plugin-vue-jsx` devDependency**

```bash
npm uninstall @vitejs/plugin-vue-jsx
```

Remove its import from `vite.config.ts` and remove `vueJsx()` from both plugin arrays.

- [ ] **Step 5: Run unit tests**

```bash
npm run test:unit
```

Expected: 79 passing.

- [ ] **Step 6: Run full dev build**

```bash
npm run build
```

Expected: successful build with no import errors.

- [ ] **Step 7: Commit**

```bash
git add src/main.ts vite.config.ts package.json package-lock.json
git commit -m "chore: remove Bootstrap, BVN, and vue-jsx dependencies"
```

---

## Task 9: Update Playwright selectors

The dropdown trigger changes from `<a class="nav-link">` (BVN) to `<button>` (shadcn DropdownMenuTrigger). All 13 specs that interact with dropdowns need selector updates.

- [ ] **Step 1: Audit what selectors need to change**

```bash
grep -r "nav-link\|nav-item-dropdown\|dropdown-item" tests/playwright/
```

Expected: hits in multiple spec files for comparison-menu, property-menu, junction-menu, query-function-menu interactions.

- [ ] **Step 2: Update all dropdown trigger selectors**

The old pattern was:
```typescript
page.locator('[data-test="comparison-menu"] a.nav-link').click()
```

The new pattern (shadcn DropdownMenuTrigger renders a `<button>`):
```typescript
page.locator('[data-test="comparison-menu"] button').click()
```

Apply this across all 13 spec files. Specific patterns to find and replace:

| Old | New |
|-----|-----|
| `[data-test="comparison-menu"] a.nav-link` | `[data-test="comparison-menu"] button` |
| `[data-test="property-menu"] a.nav-link` | `[data-test="property-menu"] button` |
| `[data-test="query-function-menu"] a.nav-link` | `[data-test="query-function-menu"] button` |
| `.constraint-group-bar a.nav-link` | `.constraint-group-bar button:first-child` |
| `[data-testid="projection-property-menu"] a.nav-link` | `[data-testid="projection-property-menu"] button` |

- [ ] **Step 3: Run Playwright tests**

```bash
npm run test:e2e:pw
```

Expected: 13/13 passing. If any test fails, open Playwright UI to inspect the failing selector:

```bash
npm run test:e2e:pw:ui
```

- [ ] **Step 4: Update `tests/playwright/CLAUDE.md`**

Replace the selector documentation section. The new rules:

- DropdownMenu triggers are `<button>` elements rendered by shadcn `DropdownMenuTrigger`:
  ```typescript
  page.locator('[data-test="comparison-menu"] button').click()   // correct
  page.getByTestId('comparison-menu').click()                    // still wrong -- targets wrapper div
  ```
- Junction menu: `subGroup.locator('.constraint-group-bar button:first-child').click()`
- Projection property menu: `projection.locator('[data-testid="projection-property-menu"] button').click()`

- [ ] **Step 5: Commit**

```bash
git add tests/playwright/
git commit -m "test: update Playwright selectors for shadcn DropdownMenuTrigger (button, not a.nav-link)"
```

---

## Task 10: Delete icon assets + final validation

- [ ] **Step 1: Delete the Bootstrap icon image assets**

```bash
git rm src/assets/images/icons/accept.png src/assets/images/icons/error.png
```

- [ ] **Step 2: Confirm no remaining Bootstrap class references in component files**

```bash
grep -r "btn-sm\|navbar\|nav-item\|nav-link\|b-alert\|b-dropdown\|b-nav" src/components/constraint-modeler/ui/
```

Expected: no hits. Fix any remaining references.

- [ ] **Step 3: Run full unit suite**

```bash
npm run test:unit
```

Expected: 79 passing.

- [ ] **Step 4: Run Playwright**

```bash
npm run test:e2e:pw
```

Expected: 13/13 passing.

- [ ] **Step 5: Run lint**

```bash
npm run lint
```

Expected: clean.

- [ ] **Step 6: Build library**

```bash
npm run build:lib
```

Expected: `dist/constraint-modeler.css` contains Tailwind utilities. `dist/constraint-modeler.umd.js` and `dist/constraint-modeler.common.js` produced.

- [ ] **Step 7: Final commit**

```bash
git add -A
git commit -m "chore: delete Bootstrap icon assets, Phase 2 complete"
```

---

## Self-Review

- Tailwind 4 via `@tailwindcss/vite` plugin (no postcss config) -- matches spec
- Dark default at `:root`, light opt-in via `.light` class -- matches spec
- `b-nav-item-dropdown` replaced with shadcn `DropdownMenu` in all 4 menus (Task 4) -- matches spec
- `b-alert` replaced with shadcn `Alert` (Task 6) -- matches spec
- `btn btn-sm` replaced with shadcn `Button` in all bars (Task 5-6) -- matches spec
- `<img>` validity icons replaced with lucide `CheckCircle2`/`XCircle` (Task 5) -- matches spec
- Demo shell (`App.vue`, `ListGrid.vue`) migrated to Tailwind nav and plain HTML table before BVN removal (Task 7) -- matches spec (no orphan BVN tags after Task 8)
- BVN + Bootstrap removed from `main.ts`, deps, peerDeps, vite externals (Task 8) -- matches spec
- `@vitejs/plugin-vue-jsx` removed (Task 8) -- matches spec
- Playwright selectors updated for `<button>` trigger (Task 9) -- matches spec
- `tests/playwright/CLAUDE.md` updated (Task 9) -- matches spec
- Library CSS delivered via `dist/constraint-modeler.css` with Tailwind (Task 10) -- matches spec
- `entry.ts` imports `tailwind.css` so lib build emits CSS (Task 2, Step 4) -- matches spec
- All 13 Playwright + 79 unit tests confirmed green
- Script blocks untouched throughout -- only template + style changed
