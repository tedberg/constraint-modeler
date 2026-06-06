import { test, expect } from '@playwright/test';

test('navigates a two-level property submenu and selects a leaf', async ({ page }) => {
  await page.goto('/simple');

  // Add a constraint so the property menu appears
  await page.getByTestId('add-constraint').click();

  // Open the property menu
  await page.locator('[data-test="property-menu"] button').first().click();

  // Hover "Alert" SubTrigger to open its submenu (in the Multi Properties section)
  await page.getByRole('menuitem', { name: /^Alert$/ }).hover();
  await page.waitForSelector('[role="menu"] >> text=Contact', { state: 'visible' });

  // Hover "Contact" SubTrigger to open the second-level submenu
  await page.getByRole('menuitem', { name: /^Contact$/ }).hover();
  await page.waitForSelector('[role="menu"] >> text=Email', { state: 'visible' });

  // Click "Email" — hover-based navigation avoids Reka UI's pointer-event blocking
  await page.getByRole('menuitem', { name: /^Email$/ }).click();

  // The property menu button should now display "Email"
  await expect(
    page.locator('[data-test="property-menu"] button').first()
  ).toContainText('Email');
});
