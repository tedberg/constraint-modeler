# Phase 2: Playwright Test Expansion Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Harden and expand the Playwright suite against the Vue 2 app, replacing fragile hardcoded selectors and adding comprehensive coverage. This expanded suite becomes the safety net for the Phase 3 Vue 3 migration.

**Architecture:** All tests run against the existing Vue 2 dev server. Selector hardening requires adding `data-testid` attributes to source Vue components. New test scenarios cover the full constraint modeler feature surface: nesting, removal, all operators, projections, save/load, and all output formats. Cypress is removed at the end of this phase.

**Tech Stack:** `@playwright/test`, existing Vue 2 dev server (`npm run serve`)

**Prerequisite:** Phase 1 Playwright baseline must be green before starting.

---

## File Map

| Action | File |
|--------|------|
| Modify | `src/components/constraint-modeler/ui/constraint/ConstraintGroup.vue` — add `data-testid` |
| Modify | `src/components/constraint-modeler/ui/constraint/Constraint.vue` — add `data-testid` |
| Modify | `src/components/constraint-modeler/ui/constraint/ValueInput.vue` — add `data-testid` |
| Modify | `src/components/constraint-modeler/ui/projection/Projection.vue` — add `data-testid` |
| Modify | `src/components/constraint-modeler/ui/projection/ProjectionGroup.vue` — add `data-testid` |
| Modify | `tests/playwright/simple.spec.ts` — replace hardcoded IDs |
| Modify | `tests/playwright/debug.spec.ts` — replace hardcoded IDs |
| Modify | `tests/playwright/with-projection.spec.ts` — replace hardcoded IDs |
| Create | `tests/playwright/nesting.spec.ts` |
| Create | `tests/playwright/removal.spec.ts` |
| Create | `tests/playwright/operators.spec.ts` |
| Create | `tests/playwright/persistent-save.spec.ts` |
| Delete | `tests/e2e/` (Cypress) |
| Modify | `package.json` — remove Cypress deps and scripts |

---

### Task 1: Add data-testid attrs to ValueInput

The hardcoded `#test_valueEntry-11000` ID comes from `ValueInput.vue` generating `id="${templatePrefix}_valueEntry-${objectId}"`. Add a `data-testid` that is stable and doesn't depend on numeric objectIds.

**Files:**
- Modify: `src/components/constraint-modeler/ui/constraint/ValueInput.vue`

- [ ] **Step 1: Read ValueInput.vue**

```bash
cat src/components/constraint-modeler/ui/constraint/ValueInput.vue
```

- [ ] **Step 2: Add data-testid to the value input element(s)**

In the JSX render function inside ValueInput.vue, each input element is rendered with a dynamic `id`. Add a `data-testid="value-input"` to the input wrapper or container `<form>` in `Constraint.vue` instead (simpler — the container already has `data-test="value-input"`).

In `src/components/constraint-modeler/ui/constraint/Constraint.vue`, update the value input form:

```html
<form class="form-inline navbar-search pull-left"
      :id="valueEntriesId"
      data-test="value-input"
      data-testid="value-input">
```

This gives a stable `getByTestId('value-input')` selector that works for any constraint row. For tests that need to target a specific row's input, scope it within a `getByTestId('constraint').nth(n)` parent locator.

- [ ] **Step 3: Run the Phase 1 specs to confirm no regression**

```bash
npx playwright test tests/playwright/simple.spec.ts tests/playwright/debug.spec.ts --headed
```
Expected: 2 tests pass

- [ ] **Step 4: Commit**

```bash
git add src/components/constraint-modeler/ui/constraint/Constraint.vue
git commit -m "feat: add data-testid to value-input container"
```

---

### Task 2: Add data-testid attrs to Projection components

**Files:**
- Modify: `src/components/constraint-modeler/ui/projection/Projection.vue`
- Modify: `src/components/constraint-modeler/ui/projection/ProjectionGroup.vue`

- [ ] **Step 1: Add data-testid to Projection.vue**

The projection bar already has a dynamic `:id="projectionId"` (e.g. `test_projection-bar-1100`). Add a static `data-testid="projection"` to the root div, and add `data-testid="projection-property-menu"` to the property menu `<li>`:

```html
<div class="navbar navbar-expand-lg navbar-dark bg-dark projection-bar mb-1"
     :id="projectionId"
     data-test="projection"
     data-testid="projection">
```

```html
<li class="nav-item active dropdown" :id="propertyId" data-testid="projection-property-menu">
```

- [ ] **Step 2: Add data-testid to ProjectionGroup.vue**

The `+ P` button already has `data-test="add-projection"`. Add `data-testid="add-projection"`:

```html
<button class="btn btn-sm btn-secondary"
        data-test="add-projection"
        data-testid="add-projection"
        @click.prevent="addProjection()">+ P</button>
```

- [ ] **Step 3: Run Phase 1 with-projection spec to confirm no regression**

```bash
npx playwright test tests/playwright/with-projection.spec.ts --headed
```
Expected: 1 test passes

- [ ] **Step 4: Commit**

```bash
git add src/components/constraint-modeler/ui/projection/Projection.vue \
        src/components/constraint-modeler/ui/projection/ProjectionGroup.vue
git commit -m "feat: add data-testid attrs to projection components"
```

---

### Task 3: Update Phase 1 specs to use stable selectors

Replace `#test_valueEntry-11000`, `#test_projection-bar-1100`, etc. with `getByTestId()` selectors scoped to the correct row.

**Files:**
- Modify: `tests/playwright/simple.spec.ts`
- Modify: `tests/playwright/debug.spec.ts`
- Modify: `tests/playwright/with-projection.spec.ts`

- [ ] **Step 1: Update simple.spec.ts**

Replace the value input selector:
```typescript
// Before:
await page.locator('#test_valueEntry-11000').fill('25');
await expect(page.locator('#test_valueEntry-11000')).toHaveValue('25');

// After — scoped to the first constraint row's value input:
const valueInput = page.getByTestId('constraint').first().getByTestId('value-input').locator('input');
await valueInput.fill('25');
await expect(valueInput).toHaveValue('25');
```

- [ ] **Step 2: Update debug.spec.ts**

Apply the same value input change as simple.spec.ts.

- [ ] **Step 3: Update with-projection.spec.ts**

Replace projection selectors:
```typescript
// Before:
await page.getByText('+ P').click();
await expect(page.locator('#test_projection-bar-1100')).toBeVisible();
await page.locator('#test_property-menu-1100').click();
await page.locator('#test_property-menu-1100').getByText('Name').click();

await page.getByText('+ P').click();
await expect(page.locator('#test_projection-bar-1200')).toBeVisible();
await page.locator('#test_property-menu-1200').click();
await page.locator('#test_property-menu-1200').getByText('Age').click();

// After:
await page.getByTestId('add-projection').click();
const firstProjection = page.getByTestId('projection').nth(0);
await expect(firstProjection).toBeVisible();
await firstProjection.getByTestId('projection-property-menu').click();
await firstProjection.getByText('Name').click();

await page.getByTestId('add-projection').click();
const secondProjection = page.getByTestId('projection').nth(1);
await expect(secondProjection).toBeVisible();
await secondProjection.getByTestId('projection-property-menu').click();
await secondProjection.getByText('Age').click();
```

Also replace the value input selector as in step 1.

- [ ] **Step 4: Run all 5 Phase 1 specs to confirm still green**

```bash
npm run test:e2e:pw
```
Expected: 5 tests pass

- [ ] **Step 5: Commit**

```bash
git add tests/playwright/simple.spec.ts tests/playwright/debug.spec.ts tests/playwright/with-projection.spec.ts
git commit -m "feat: replace hardcoded IDs with stable data-testid selectors in Phase 1 specs"
```

---

### Task 4: Add nesting spec

**Files:**
- Create: `tests/playwright/nesting.spec.ts`

Tests the constraint group nesting feature — adding a `+ CG` sub-group with OR junction, adding constraints inside it, and verifying the syntax output.

- [ ] **Step 1: Create the spec**

```typescript
import { test, expect } from '@playwright/test';

test('Builds a nested constraint group with OR junction', async ({ page }) => {
  await page.goto('/debug');

  // Add root-level constraint: status Equal (no value — just set field and operator)
  await page.getByTestId('add-constraint').click();
  const firstConstraint = page.getByTestId('constraint').first();
  await firstConstraint.getByTestId('property-menu').click();
  await page.getByText('Status').click();
  await firstConstraint.getByTestId('comparison-menu').click();
  await page.getByText('Equal').click();
  const firstInput = firstConstraint.getByTestId('value-input').locator('input, select').first();
  // Status is an enum — select the Enabled option from the dropdown
  await firstInput.selectOption({ label: 'Enabled' });

  // Add a constraint group (+ CG)
  await page.getByTestId('add-constraint-group').click();

  // The sub-group appears — change its junction to OR
  const subGroup = page.locator('div.constraint-group:not(.root)');
  await expect(subGroup).toBeVisible();
  await subGroup.locator('button.dropdown-toggle').first().click(); // junction menu
  await page.getByText('Or').click();

  // Add a constraint inside the sub-group
  await subGroup.getByTestId('add-constraint').click();
  const nestedConstraint = subGroup.getByTestId('constraint').first();
  await nestedConstraint.getByTestId('property-menu').click();
  await page.getByText('Age').click();
  await nestedConstraint.getByTestId('comparison-menu').click();
  await page.getByText('Greater Than').click();
  const nestedInput = nestedConstraint.getByTestId('value-input').locator('input').first();
  await nestedInput.fill('50');

  // Render syntax and verify nested structure
  await page.getByText('Render Syntax').click();
  await expect(page.locator('div.alerts span.syntaxDisplay'))
    .toContainText('(status Equal ENABLED And (age Greater Than 50))');
});
```

- [ ] **Step 2: Run the spec**

```bash
npx playwright test tests/playwright/nesting.spec.ts --headed
```
Expected: 1 test passes. If the Status enum renders as `ENABLED` vs `Enabled`, check the syntax output and adjust the assertion to match the actual value.

- [ ] **Step 3: Commit**

```bash
git add tests/playwright/nesting.spec.ts
git commit -m "feat: add nesting constraint group spec"
```

---

### Task 5: Add removal spec

**Files:**
- Create: `tests/playwright/removal.spec.ts`

Tests removing constraints and constraint groups.

- [ ] **Step 1: Create the spec**

```typescript
import { test, expect } from '@playwright/test';

test('Removes a constraint row', async ({ page }) => {
  await page.goto('/simple');

  // Add two constraints
  await page.getByTestId('add-constraint').click();
  await page.getByTestId('add-constraint').click();
  await expect(page.getByTestId('constraint')).toHaveCount(2);

  // Remove the first constraint (X button on the constraint bar)
  await page.getByTestId('constraint').first().getByRole('button', { name: 'X' }).click();
  await expect(page.getByTestId('constraint')).toHaveCount(1);
});

test('Removes a constraint group', async ({ page }) => {
  await page.goto('/simple');

  // Add a sub constraint group
  await page.getByTestId('add-constraint-group').click();
  await expect(page.locator('div.constraint-group:not(.root)')).toBeVisible();

  // Remove the sub-group (X button on the sub-group bar)
  await page.locator('div.constraint-group:not(.root)').getByRole('button', { name: 'X' }).click();
  await expect(page.locator('div.constraint-group:not(.root)')).not.toBeVisible();
});

test('Removes a projection', async ({ page }) => {
  await page.goto('/projection');

  // Add two projections
  await page.getByTestId('add-projection').click();
  await page.getByTestId('add-projection').click();
  await expect(page.getByTestId('projection')).toHaveCount(2);

  // Remove the first projection
  await page.getByTestId('projection').first().getByRole('button', { name: 'X' }).click();
  await expect(page.getByTestId('projection')).toHaveCount(1);
});
```

- [ ] **Step 2: Run the spec**

```bash
npx playwright test tests/playwright/removal.spec.ts --headed
```
Expected: 3 tests pass

- [ ] **Step 3: Commit**

```bash
git add tests/playwright/removal.spec.ts
git commit -m "feat: add removal spec for constraints, groups, and projections"
```

---

### Task 6: Add operators spec

**Files:**
- Create: `tests/playwright/operators.spec.ts`

Verifies that the comparison operator dropdown shows the correct operators for each data type (string, number, enum) and that selecting them generates correct syntax.

- [ ] **Step 1: Create the spec**

```typescript
import { test, expect } from '@playwright/test';

test('Number field shows numeric operators and generates correct syntax', async ({ page }) => {
  await page.goto('/simple');

  await page.getByTestId('add-constraint').click();
  const constraint = page.getByTestId('constraint').first();

  await constraint.getByTestId('property-menu').click();
  await page.getByText('Age').click();

  // Verify numeric operators are available
  await constraint.getByTestId('comparison-menu').click();
  await expect(page.getByText('Less Than')).toBeVisible();
  await expect(page.getByText('Less Than or Equal')).toBeVisible();
  await expect(page.getByText('Greater Than')).toBeVisible();
  await expect(page.getByText('Greater Than or Equal')).toBeVisible();
  await expect(page.getByText('Equal')).toBeVisible();
  await expect(page.getByText('Not Equal')).toBeVisible();

  await page.getByText('Less Than or Equal').click();
  await constraint.getByTestId('value-input').locator('input').first().fill('30');

  await page.getByText('Render Syntax').click();
  await expect(page.locator('div.alerts span.syntaxDisplay'))
    .toContainText('(age Less Than or Equal 30)');
});

test('String field shows string operators and generates correct syntax', async ({ page }) => {
  await page.goto('/simple');

  await page.getByTestId('add-constraint').click();
  const constraint = page.getByTestId('constraint').first();

  await constraint.getByTestId('property-menu').click();
  await page.getByText('Name').click();

  await constraint.getByTestId('comparison-menu').click();
  await expect(page.getByText('Like')).toBeVisible();
  await expect(page.getByText('Not Like')).toBeVisible();

  await page.getByText('Like').click();
  await constraint.getByTestId('value-input').locator('input').first().fill('*Smith');

  await page.getByText('Render Syntax').click();
  await expect(page.locator('div.alerts span.syntaxDisplay'))
    .toContainText("(name Like '*Smith')");
});

test('Enum field shows Equal/Not Equal operators and generates correct syntax', async ({ page }) => {
  await page.goto('/simple');

  await page.getByTestId('add-constraint').click();
  const constraint = page.getByTestId('constraint').first();

  await constraint.getByTestId('property-menu').click();
  await page.getByText('Status').click();

  await constraint.getByTestId('comparison-menu').click();
  await page.getByText('Equal').click();

  const input = constraint.getByTestId('value-input').locator('select, input').first();
  await input.selectOption({ label: 'Disabled' });

  await page.getByText('Render Syntax').click();
  await expect(page.locator('div.alerts span.syntaxDisplay'))
    .toContainText('(status Equal DISABLED)');
});
```

- [ ] **Step 2: Run the spec**

```bash
npx playwright test tests/playwright/operators.spec.ts --headed
```
Expected: 3 tests pass. Adjust enum assertions to match actual syntax output values if they differ.

- [ ] **Step 3: Commit**

```bash
git add tests/playwright/operators.spec.ts
git commit -m "feat: add operators spec covering numeric, string, and enum fields"
```

---

### Task 7: Add persistent save spec

**Files:**
- Create: `tests/playwright/persistent-save.spec.ts`

Tests the Save button on the Everything page (which has a `saveFunction` wired to `ModelPersistence`).

- [ ] **Step 1: Create the spec**

```typescript
import { test, expect } from '@playwright/test';

test('Save button saves and shows success message', async ({ page }) => {
  await page.goto('/everything');

  // The Everything page pre-loads a constraint — just click Save
  await page.getByRole('button', { name: 'Save' }).click();

  await expect(page.locator('div.alerts'))
    .toContainText('This constraint model was saved.');
});
```

- [ ] **Step 2: Run the spec**

```bash
npx playwright test tests/playwright/persistent-save.spec.ts --headed
```
Expected: 1 test passes

- [ ] **Step 3: Commit**

```bash
git add tests/playwright/persistent-save.spec.ts
git commit -m "feat: add persistent save spec"
```

---

### Task 8: Run full expanded suite, then remove Cypress

- [ ] **Step 1: Run all Playwright specs**

```bash
npm run test:e2e:pw
```
Expected: all tests pass (5 original + nesting + removal + operators + persistent-save)

- [ ] **Step 2: Remove Cypress**

```bash
npm uninstall cypress @vue/cli-plugin-e2e-cypress eslint-plugin-cypress
git rm -r tests/e2e cypress.json
```

- [ ] **Step 3: Remove Cypress scripts from package.json**

Remove the `test:e2e`, `cypress`, and `test` scripts (or update `test` to use Playwright only):
```json
"test": "npm run test:unit && npm run test:e2e:pw"
```

- [ ] **Step 4: Confirm suite still green**

```bash
npm run test:e2e:pw
```
Expected: all tests pass

- [ ] **Step 5: Commit**

```bash
git add package.json package-lock.json
git commit -m "feat: Phase 2 complete — expanded Playwright suite green, Cypress removed"
```

---

## Exit Gate

All Playwright specs (ported + new) pass against `npm run serve` (Vue 2 dev server). Cypress removed.

**Next:** Phase 3 plan — `.claude/superpowers/plans/2026-05-11-phase3-vue3-vite-migration.md`