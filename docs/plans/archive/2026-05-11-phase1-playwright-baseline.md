# Phase 1: Playwright E2E Baseline Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Install Playwright and port all 5 existing Cypress e2e specs to Playwright, establishing a green baseline against the current Vue 2 app before any migration work begins.

**Architecture:** Playwright tests live in `tests/playwright/`, configured via `playwright.config.ts` at the project root. We reuse existing `data-test` attributes (already present in source) by setting `testIdAttribute: 'data-test'` in the Playwright config. Hardcoded IDs like `#test_valueEntry-11000` are kept as-is — they are deterministic (generated from `templatePrefix: 'test'` + model objectIds) and will be replaced in Phase 3. Cypress is kept in place throughout this phase.

**Tech Stack:** `@playwright/test`, Chromium (default), Vue CLI dev server on port 8080

---

## File Map

| Action | File |
|--------|------|
| Create | `playwright.config.ts` |
| Create | `tests/playwright/simple.spec.ts` |
| Create | `tests/playwright/debug.spec.ts` |
| Create | `tests/playwright/with-projection.spec.ts` |
| Create | `tests/playwright/persistent.spec.ts` |
| Create | `tests/playwright/everything.spec.ts` |
| Modify | `package.json` — add `@playwright/test` dev dep + `test:e2e:pw` script |

---

### Task 1: Install Playwright

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Install the package**

```bash
npm install --save-dev @playwright/test
```

- [ ] **Step 2: Install Chromium browser binary**

```bash
npx playwright install chromium
```

- [ ] **Step 3: Add the test script to package.json**

In `package.json`, add to the `"scripts"` block:
```json
"test:e2e:pw": "playwright test"
```

- [ ] **Step 4: Verify installation**

```bash
npx playwright --version
```
Expected: prints a version string like `Version 1.x.x`

- [ ] **Step 5: Commit**

```bash
git add package.json package-lock.json
git commit -m "feat: install @playwright/test"
```

---

### Task 2: Configure Playwright

**Files:**
- Create: `playwright.config.ts`

- [ ] **Step 1: Create the config file**

Create `playwright.config.ts` at the project root:

```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/playwright',
  fullyParallel: false,
  reporter: [['html', { open: 'never' }]],
  use: {
    baseURL: 'http://localhost:8080',
    testIdAttribute: 'data-test',
    trace: 'on-first-retry',
    video: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'npm run serve',
    url: 'http://localhost:8080',
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },
});
```

- [ ] **Step 2: Verify config is valid**

```bash
npx playwright test --list
```
Expected: prints empty test list (no specs yet) without errors

- [ ] **Step 3: Commit**

```bash
git add playwright.config.ts
git commit -m "feat: add playwright.config.ts"
```

---

### Task 3: Port Simple spec

**Files:**
- Create: `tests/playwright/simple.spec.ts`

The Cypress original (`tests/e2e/specs/Simple.spec.js`) clicks +C, sets field=Age / operator=Greater Than / value=25, clicks Render Syntax, and asserts the syntax output.

- [ ] **Step 1: Create the spec**

```typescript
import { test, expect } from '@playwright/test';

test('Creates an Age Greater Than 25 constraint', async ({ page }) => {
  await page.goto('/simple');

  await expect(page.locator('div.projection-group')).not.toBeVisible();

  await page.getByTestId('add-constraint').click();

  await page.getByTestId('property-menu').click();
  await page.getByText('Age').click();

  await page.getByTestId('comparison-menu').click();
  await page.getByText('Greater Than').click();

  await page.locator('#test_valueEntry-11000').fill('25');
  await expect(page.locator('#test_valueEntry-11000')).toHaveValue('25');

  await page.getByText('Render Syntax').click();

  await expect(page.locator('div.alerts span.syntaxDisplay'))
    .toContainText('(age Greater Than 25)');
});
```

- [ ] **Step 2: Run the spec against the dev server**

Make sure `npm run serve` is running in another terminal first, then:
```bash
npx playwright test tests/playwright/simple.spec.ts --headed
```
Expected: 1 test passes

- [ ] **Step 3: Commit**

```bash
git add tests/playwright/simple.spec.ts
git commit -m "feat: port Simple cypress spec to Playwright"
```

---

### Task 4: Port Debug spec

**Files:**
- Create: `tests/playwright/debug.spec.ts`

The Cypress original adds Age > 25, then clicks Render Syntax, Render Query String, and Render JSON in sequence, asserting each output.

- [ ] **Step 1: Create the spec**

```typescript
import { test, expect } from '@playwright/test';

test('Creates an Age Greater Than 25 constraint with debug output', async ({ page }) => {
  await page.goto('/debug');

  await expect(page.locator('div.projection-group')).not.toBeVisible();

  await page.getByTestId('add-constraint').click();

  await page.getByTestId('property-menu').click();
  await page.getByText('Age').click();

  await page.getByTestId('comparison-menu').click();
  await page.getByText('Greater Than').click();

  await page.locator('#test_valueEntry-11000').fill('25');

  await page.getByText('Render Syntax').click();
  await expect(page.locator('div.alerts span.syntaxDisplay'))
    .toContainText('(age Greater Than 25)');

  await page.getByText('Render Query String').click();
  await expect(page.locator('div.alerts span.syntaxDisplay'))
    .toContainText('constraint[value]=age:gt:25');

  await page.getByText('Render JSON').click();
  await expect(page.locator('div.alerts span.syntaxDisplay'))
    .toContainText('{"constraintGroup":{"constraint":{"value":"age:gt:25"}}}');
});
```

- [ ] **Step 2: Run the spec**

```bash
npx playwright test tests/playwright/debug.spec.ts --headed
```
Expected: 1 test passes

- [ ] **Step 3: Commit**

```bash
git add tests/playwright/debug.spec.ts
git commit -m "feat: port Debug cypress spec to Playwright"
```

---

### Task 5: Port WithProjection spec

**Files:**
- Create: `tests/playwright/with-projection.spec.ts`

The Cypress original adds Age > 25 constraint, then adds 2 projections (Name, Age) via the `+ P` button, and asserts syntax output.

Note: projection bar IDs (`#test_projection-bar-1100`, `#test_property-menu-1100`, etc.) are deterministic — `templatePrefix` is `'test'` (hardcoded in ConstraintModeler.vue) and projection objectIds start at 1100.

- [ ] **Step 1: Create the spec**

```typescript
import { test, expect } from '@playwright/test';

test('Creates an Age Greater Than 25 constraint with Name and Age projections', async ({ page }) => {
  await page.goto('/projection');

  await expect(page.locator('div.projection-group')).toBeVisible();

  await page.getByTestId('add-constraint').click();

  await page.getByTestId('property-menu').click();
  await page.getByText('Age').click();

  await page.getByTestId('comparison-menu').click();
  await page.getByText('Greater Than').click();

  await page.locator('#test_valueEntry-11000').fill('25');

  // Add first projection
  await page.getByText('+ P').click();
  await expect(page.locator('#test_projection-bar-1100')).toBeVisible();
  await page.locator('#test_property-menu-1100').click();
  await page.locator('#test_property-menu-1100').getByText('Name').click();

  // Add second projection
  await page.getByText('+ P').click();
  await expect(page.locator('#test_projection-bar-1200')).toBeVisible();
  await page.locator('#test_property-menu-1200').click();
  await page.locator('#test_property-menu-1200').getByText('Age').click();

  await page.getByText('Render Syntax').click();
  await expect(page.locator('div.alerts span.syntaxDisplay'))
    .toContainText('(name,age)(age Greater Than 25)');
});
```

- [ ] **Step 2: Run the spec**

```bash
npx playwright test tests/playwright/with-projection.spec.ts --headed
```
Expected: 1 test passes

- [ ] **Step 3: Commit**

```bash
git add tests/playwright/with-projection.spec.ts
git commit -m "feat: port WithProjection cypress spec to Playwright"
```

---

### Task 6: Port Persistent spec

**Files:**
- Create: `tests/playwright/persistent.spec.ts`

The Cypress original loads the `/persistent` route (which pre-loads a constraint via `initialModelJsonObject`) and asserts the rendered syntax without any interaction.

- [ ] **Step 1: Create the spec**

```typescript
import { test, expect } from '@playwright/test';

test('Loads a predefined constraint definition', async ({ page }) => {
  await page.goto('/persistent');

  await expect(page.locator('div.projection-group')).not.toBeVisible();

  await page.getByText('Render Syntax').click();
  await expect(page.locator('div.alerts span.syntaxDisplay'))
    .toContainText("(status Equal ENABLED And age Greater Than 50 And (age Less Than or Equal 35 Or Upper(name) Like '*Y'))");
});
```

- [ ] **Step 2: Run the spec**

```bash
npx playwright test tests/playwright/persistent.spec.ts --headed
```
Expected: 1 test passes

- [ ] **Step 3: Commit**

```bash
git add tests/playwright/persistent.spec.ts
git commit -m "feat: port Persistent cypress spec to Playwright"
```

---

### Task 7: Port Everything spec

**Files:**
- Create: `tests/playwright/everything.spec.ts`

The Cypress original loads `/everything` (pre-loaded constraint + projections) and asserts syntax, query string, and JSON outputs.

- [ ] **Step 1: Create the spec**

```typescript
import { test, expect } from '@playwright/test';

test('Loads a predefined constraint with projections and verifies all output formats', async ({ page }) => {
  await page.goto('/everything');

  await expect(page.locator('div.projection-group')).toBeVisible();

  await page.getByText('Render Syntax').click();
  await expect(page.locator('div.alerts span.syntaxDisplay'))
    .toContainText("(name,age)(status Equal ENABLED And age Greater Than 50 And (age Less Than or Equal 35 Or Upper(name) Like '*Y'))");

  await page.getByText('Render Query String').click();
  await expect(page.locator('div.alerts span.syntaxDisplay'))
    .toContainText('property=name;age&grouped=false&projectionAsMap=false&constraint[value]=status:eq:ENABLED;age:gt:50&constraint[sub1][junction]=or&constraint[sub1][value]=age:lte:35;upper(name):like:*Y');

  await page.getByText('Render JSON').click();
  await expect(page.locator('div.alerts span.syntaxDisplay'))
    .toContainText('{"constraintGroup":{"constraint":{"value":"status:eq:ENABLED;age:gt:50","sub1":{"junction":"or","value":"age:lte:35;upper(name):like:*Y"}}},"projectionGroup":{"property":"name;age","grouped":false,"projectionAsMap":false}}');
});
```

- [ ] **Step 2: Run the spec**

```bash
npx playwright test tests/playwright/everything.spec.ts --headed
```
Expected: 1 test passes

- [ ] **Step 3: Commit**

```bash
git add tests/playwright/everything.spec.ts
git commit -m "feat: port Everything cypress spec to Playwright"
```

---

### Task 8: Run full suite and verify exit gate

**Files:** none

- [ ] **Step 1: Run all 5 Playwright specs**

```bash
npm run test:e2e:pw
```
Expected: 5 tests pass, 0 failures

- [ ] **Step 2: Run with Playwright's HTML reporter to confirm clean output**

```bash
npx playwright show-report
```
Expected: report opens showing 5 green tests across `simple`, `debug`, `with-projection`, `persistent`, `everything`

- [ ] **Step 3: Confirm Cypress still works (don't break the existing suite)**

Start the dev server in one terminal (`npm run serve`), then in another:
```bash
npm run cypress
```
Expected: Cypress opens and all 5 existing specs pass

- [ ] **Step 4: Final commit**

```bash
git add .
git commit -m "feat: Phase 1 complete — Playwright e2e baseline green"
```

---

## Exit Gate

All 5 Playwright specs pass against `npm run serve`. Cypress suite still intact and green.

**Next:** Phase 2 plan — `.claude/superpowers/plans/2026-05-11-phase2-test-expansion.md`