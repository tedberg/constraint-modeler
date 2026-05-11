import { test, expect } from '@playwright/test';

test('Creates an Age Greater Than 25 constraint with projections', async ({ page }) => {
  await page.goto('/projection');

  await expect(page.locator('div.projection-group')).toBeVisible();

  await page.getByTestId('add-constraint').click();

  await page.getByTestId('property-menu').click();
  await page.getByRole('menuitem', { name: /^Age$/ }).click();

  await page.locator('[data-test="comparison-menu"] a.nav-link').click();
  await page.getByRole('menuitem', { name: 'Greater Than', exact: true }).click();

  await page.locator('#test_valueEntry-11000').fill('25');
  await expect(page.locator('#test_valueEntry-11000')).toHaveValue('25');

  await page.getByText('+ P', { exact: true }).click();
  await expect(page.locator('#test_projection-bar-1100')).toBeVisible();
  await page.locator('#test_property-menu-1100 a.nav-link').click();
  await page.getByRole('menuitem', { name: 'Name', exact: true }).click();

  await page.getByText('+ P', { exact: true }).click();
  await expect(page.locator('#test_projection-bar-1200')).toBeVisible();
  await page.locator('#test_property-menu-1200 a.nav-link').click();
  await page.getByRole('menuitem', { name: /^Age$/ }).click();

  await page.getByText('Render Syntax').click();
  await expect(page.locator('div.alerts span.syntaxDisplay'))
    .toContainText('(name,age)(age Greater Than 25)');
});
