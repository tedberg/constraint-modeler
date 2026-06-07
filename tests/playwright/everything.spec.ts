import { test, expect } from '@playwright/test';

test('Loads a predefined constraint definition with projections', async ({ page }) => {
  await page.goto('/everything');

  await expect(page.locator('div.projection-group')).toBeVisible();
  const initialLayout = await measureModelerLayout(page);

  await page.getByText('Render Syntax').click();
  await expect(page.locator('div.alerts span.syntaxDisplay'))
    .toContainText("(name,age)(status Equal ENABLED And age Greater Than 50 And (age Less Than or Equal 35 Or Upper(name) Like '*Y'))");

  let layout = await measureSyntaxAlertLayout(page);
  expect(layout.modelerWidthDeltaFromInitial).toBeLessThanOrEqual(1);
  expect(layout.alertRightDeltaFromModeler).toBeLessThanOrEqual(1);
  expect(layout.alertWidthDeltaFromGroupBar).toBeLessThanOrEqual(1);
  expect(layout.messageScrollOverflow).toBeLessThanOrEqual(1);

  await page.getByText('Render Query String').click();
  await expect(page.locator('div.alerts span.syntaxDisplay'))
    .toContainText('property=name;age&grouped=false&projectionAsMap=false&constraint[value]=status:eq:ENABLED;age:gt:50&constraint[sub1][junction]=or&constraint[sub1][value]=age:lte:35;upper(name):like:*Y');

  layout = await measureSyntaxAlertLayout(page);
  expect(layout.modelerWidthDeltaFromInitial).toBeLessThanOrEqual(1);
  expect(layout.alertRightDeltaFromModeler).toBeLessThanOrEqual(1);
  expect(layout.alertWidthDeltaFromGroupBar).toBeLessThanOrEqual(1);
  expect(layout.messageScrollOverflow).toBeLessThanOrEqual(1);

  await page.getByText('Render JSON').click();
  await expect(page.locator('div.alerts span.syntaxDisplay'))
    .toContainText('{"constraintGroup":{"constraint":{"value":"status:eq:ENABLED;age:gt:50","sub1":{"junction":"or","value":"age:lte:35;upper(name):like:*Y"}}},"projectionGroup":{"property":"name;age","grouped":false,"projectionAsMap":false}}');

  layout = await measureSyntaxAlertLayout(page);
  expect(layout.modelerWidthDeltaFromInitial).toBeLessThanOrEqual(1);
  expect(layout.alertRightDeltaFromModeler).toBeLessThanOrEqual(1);
  expect(layout.alertWidthDeltaFromGroupBar).toBeLessThanOrEqual(1);
  expect(layout.messageScrollOverflow).toBeLessThanOrEqual(1);

  async function measureSyntaxAlertLayout(page) {
    return page.locator('.constraint-modeler').evaluate((modeler, initialWidth) => {
      const alert = modeler.querySelector('div.alerts [role="alert"]');
      const groupBar = modeler.querySelector('.constraint-group-bar');
      const message = modeler.querySelector('div.alerts span.syntaxDisplay');

      if (!alert || !groupBar || !message) {
        throw new Error('Syntax alert layout targets were not rendered');
      }

      const modelerRect = modeler.getBoundingClientRect();
      const alertRect = alert.getBoundingClientRect();
      const groupBarRect = groupBar.getBoundingClientRect();

      return {
        modelerWidthDeltaFromInitial: Math.abs(modelerRect.width - initialWidth),
        alertRightDeltaFromModeler: Math.abs(alertRect.right - (modelerRect.right - 10)),
        alertWidthDeltaFromGroupBar: Math.abs(alertRect.width - groupBarRect.width),
        messageScrollOverflow: message.scrollWidth - message.clientWidth,
      };
    }, initialLayout.modelerWidth);
  }
});

test('Debug object-list render links do not throw', async ({ page }) => {
  const pageErrors = [];
  page.on('pageerror', (error) => pageErrors.push(error.message));

  await page.goto('/everything');

  await page.getByText('Render Flattened Object List').click();
  await expect(page.locator('div.alerts span.syntaxDisplay')).toContainText('status:eq:ENABLED');

  await page.getByText('Render Structured Object List').click();
  await expect(page.locator('div.alerts span.syntaxDisplay')).toContainText('status:eq:ENABLED');

  expect(pageErrors).toEqual([]);
});

async function measureModelerLayout(page) {
  return page.locator('.constraint-modeler').evaluate((modeler) => {
    const modelerRect = modeler.getBoundingClientRect();
    return {
      modelerWidth: modelerRect.width,
    };
  });
}
