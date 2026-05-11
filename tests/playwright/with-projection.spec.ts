import { test, expect } from '@playwright/test';

test('Creates an Age Greater Than 25 constraint with projections', async ({ page }) => {
  await page.goto('/projection');

  await expect(page.locator('div.projection-group')).toBeVisible();

  await page.getByTestId('add-constraint').click();

  await page.getByTestId('property-menu').click();
  await page.getByRole('menuitem', { name: /^Age$/ }).click();

  await page.locator('[data-test="comparison-menu"] a.nav-link').click();
  await page.getByRole('menuitem', { name: 'Greater Than', exact: true }).click();

  const valueInput = page.getByTestId('constraint').first().getByTestId('value-input').locator('input');
  await valueInput.fill('25');
  await expect(valueInput).toHaveValue('25');

  await page.getByTestId('add-projection').click();
  const firstProjection = page.getByTestId('projection').nth(0);
  await expect(firstProjection).toBeVisible();
  await firstProjection.locator('[data-testid="projection-property-menu"] a.nav-link').click();
  await page.getByRole('menuitem', { name: 'Name', exact: true }).click();

  await page.getByTestId('add-projection').click();
  const secondProjection = page.getByTestId('projection').nth(1);
  await expect(secondProjection).toBeVisible();
  await secondProjection.locator('[data-testid="projection-property-menu"] a.nav-link').click();
  await page.getByRole('menuitem', { name: /^Age$/ }).click();

  await page.getByText('Render Syntax').click();
  await expect(page.locator('div.alerts span.syntaxDisplay'))
    .toContainText('(name,age)(age Greater Than 25)');
});
