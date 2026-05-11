import { test, expect } from '@playwright/test';

test('Loads a predefined constraint definition with projections', async ({ page }) => {
  await page.goto('/everything');

  await expect(page.locator('div.projection-group')).toBeVisible();

  await page.getByText('Render Syntax').click();
  await expect(page.locator('div.alerts span.syntaxDisplay'))
    .toContainText("(name,age)(status Equal ENABLED And age Greater Than 50 And (age Less Than or Equal 35 Or Upper(name) Like '*Y'))");

  await page.getByText('Render Query String').click();
  await expect(page.locator('div.alerts span.syntaxDisplay'))
    .toContainText('property=name;age&grouped=false&projectionAsMap=false&constraint[value]=status:eq:ENABLED;age:gt:50&constraint[sub1][junction]=or&constraint[sub1][value]=age:lte:35;upper(name):like:*Y');

  await page.getByText('Render JSON').click();
  await expect(page.locator('div.alerts span.syntaxDisplay'))
    .toContainText('{"constraintGroup":{"constraint":{"value":"status:eq:ENABLED;age:gt:50","sub1":{"junction":"or","value":"age:lte:35;upper(name):like:*Y"}}},"projectionGroup":{"property":"name;age","grouped":false,"projectionAsMap":false}}');
});
