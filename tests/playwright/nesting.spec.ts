import { test, expect } from '@playwright/test';

test('Builds a nested constraint group with OR junction', async ({ page }) => {
  await page.goto('/debug');

  // Add root-level constraint: Status Equal ENABLED
  await page.locator('[data-test="add-constraint"]').first().click();
  const firstConstraint = page.locator('[data-test="constraint"]').first();
  await firstConstraint.locator('[data-test="property-menu"] .nav-link').click();
  await page.getByRole('menuitem', { name: /^Status$/ }).click();
  await firstConstraint.locator('[data-test="comparison-menu"] .nav-link').click();
  await page.getByRole('menuitem', { name: 'Equal', exact: true }).click();
  await firstConstraint.getByTestId('value-input').locator('select').selectOption({ label: 'Enabled' });

  // Add sub constraint group via root group's "+ CG" button
  await page.locator('div.constraint-group.root [data-test="add-constraint-group"]').click();
  const subGroup = page.locator('div.constraint-group:not(.root)');
  await expect(subGroup).toBeVisible();

  // Change sub-group junction to OR
  await subGroup.locator('.constraint-group-bar .nav-link').click();
  await page.getByRole('menuitem', { name: 'Or', exact: true }).click();

  // Add constraint inside sub-group: Age Greater Than 50
  await subGroup.locator('[data-test="add-constraint"]').click();
  const nestedConstraint = subGroup.locator('[data-test="constraint"]').first();
  await nestedConstraint.locator('[data-test="property-menu"] .nav-link').click();
  await page.getByRole('menuitem', { name: /^Age$/ }).click();
  await nestedConstraint.locator('[data-test="comparison-menu"] .nav-link').click();
  await page.getByRole('menuitem', { name: 'Greater Than', exact: true }).click();
  await nestedConstraint.getByTestId('value-input').locator('input').fill('50');

  // Render and assert
  await page.getByText('Render Syntax').click();
  await expect(page.locator('div.alerts span.syntaxDisplay'))
    .toContainText('(status Equal ENABLED And (age Greater Than 50))');
});
