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
