# Playwright Tests — Selector Patterns

## Dropdown triggers (shadcn DropdownMenuTrigger)

shadcn's `DropdownMenuTrigger` renders a `<button>` element. Always target the `<button>` inside the wrapper div, not the wrapper div itself.

```typescript
// GOOD — targets the <button> rendered by DropdownMenuTrigger
await page.locator('[data-test="comparison-menu"] button').click();
await page.locator('[data-test="property-menu"] button').click();
await page.locator('[data-test="query-function-menu"] button').click();

// BAD — getByTestId targets the wrapper <div>, not the trigger button
await page.getByTestId('comparison-menu').click();
await page.getByTestId('property-menu').click();
```

The rendered DOM for a shadcn DropdownMenu is:
```
<div data-test="comparison-menu">          ← wrapper div
  <button>Equal</button>                   ← DropdownMenuTrigger: click this
  <div role="menu">…</div>                 ← DropdownMenuContent (portal)
</div>
```

## Junction menu

```typescript
// Junction button is the first button in the constraint-group-bar
// Use Playwright's .first() — CSS :first-child matches multiple elements due to nested parents
await subGroup.locator('.constraint-group-bar button').first().click();
```

## Projection property menu

```typescript
await projection.locator('[data-testid="projection-property-menu"] button').click();
```

Note: uses `data-testid` (not `data-test`) because the Playwright config's `testIdAttribute` is set to `data-test`, so `getByTestId` won't match `data-testid`.

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
