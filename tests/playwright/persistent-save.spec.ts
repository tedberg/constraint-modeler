import { test, expect } from '@playwright/test';

test('Save button saves and shows success message', async ({ page }) => {
  await page.goto('/everything');

  // The Everything page pre-loads a constraint — just click Save
  await page.getByRole('button', { name: 'Save' }).click();

  await expect(page.locator('div.alerts'))
    .toContainText('This constraint model was saved.');
});
