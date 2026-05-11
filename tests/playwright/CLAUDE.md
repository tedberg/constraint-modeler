# Playwright Tests — Selector Patterns

## Bootstrap-Vue dropdown toggles

Cypress clicks the outer `<li>` wrapper and propagates to the first interactable child.
Playwright clicks the exact center of the given element, which may miss the toggle `<a>` inside.

**Pattern for Bootstrap-Vue `b-nav-item-dropdown` toggles:**

```typescript
// BAD — Playwright's center-click on the <li> may miss the toggle <a>
await page.getByTestId('comparison-menu').click();
await page.getByTestId('comparison-menu').locator('.dropdown-toggle').click();

// GOOD — combined CSS selector targets the <a> directly
await page.locator('[data-test="comparison-menu"] a.nav-link').click();
await page.locator('#test_property-menu-1100 a.nav-link').click();
```

The rendered DOM for `b-nav-item-dropdown` is:
```
<li data-test="comparison-menu">           ← outer wrapper (data-test or id)
  <li class="nav-item b-nav-item-dropdown">
    <a class="nav-link dropdown-toggle">…</a>  ← actual toggle; click this
    <ul class="dropdown-menu">…</ul>
  </li>
</li>
```

## Dropdown item selection

Use `getByRole('menuitem')` with exact matching to avoid strict-mode violations
from items whose names are substrings of each other (e.g. "Greater Than" vs
"Greater Than or Equal"):

```typescript
// Property menu — regex anchor prevents matching "Average", etc.
await page.getByRole('menuitem', { name: /^Age$/ }).click();

// Comparison menu — exact: true prevents matching "Greater Than or Equal"
await page.getByRole('menuitem', { name: 'Greater Than', exact: true }).click();
```
