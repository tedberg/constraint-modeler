import { test, expect } from '@playwright/test';

test('Removes a constraint row', async ({ page }) => {
  await page.goto('/simple');

  await page.getByTestId('add-constraint').click();
  await page.getByTestId('add-constraint').click();
  await expect(page.getByTestId('constraint')).toHaveCount(2);

  // Remove button is inside the constraint row
  await page.getByTestId('constraint').first().getByRole('button', { name: 'X' }).click();
  await expect(page.getByTestId('constraint')).toHaveCount(1);
});

test('Removes a constraint group', async ({ page }) => {
  await page.goto('/simple');

  await page.locator('[data-test="add-constraint-group"]').click();
  await expect(page.locator('div.constraint-group:not(.root)')).toBeVisible();

  await page.locator('[data-test="remove-constraint"]').click();
  await expect(page.locator('div.constraint-group:not(.root)')).not.toBeVisible();
});

test('Removes a projection', async ({ page }) => {
  await page.goto('/projection');

  await page.getByTestId('add-projection').click();
  await page.getByTestId('add-projection').click();
  await expect(page.getByTestId('projection')).toHaveCount(2);

  await page.getByTestId('projection').first().getByRole('button', { name: 'X' }).click();
  await expect(page.getByTestId('projection')).toHaveCount(1);
});
