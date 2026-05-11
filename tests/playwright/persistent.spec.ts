import { test, expect } from '@playwright/test';

test('Loads a predefined constraint definition', async ({ page }) => {
  await page.goto('/persistent');

  await expect(page.locator('div.projection-group')).not.toBeVisible();

  await page.getByText('Render Syntax').click();
  await expect(page.locator('div.alerts span.syntaxDisplay'))
    .toContainText("(status Equal ENABLED And age Greater Than 50 And (age Less Than or Equal 35 Or Upper(name) Like '*Y'))");
});
