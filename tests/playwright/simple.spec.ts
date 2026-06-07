import { test, expect } from '@playwright/test';

test('Creates an Age Greater Than 25 constraint', async ({ page }) => {
  await page.goto('/simple');

  await expect(page.locator('div.projection-group')).not.toBeVisible();

  await page.getByTestId('add-constraint').click();

  await page.locator('[data-test="property-menu"] button').click();
  await page.getByRole('menuitem', { name: /^Age$/ }).click();

  await page.locator('[data-test="comparison-menu"] button').click();
  await page.getByRole('menuitem', { name: 'Greater Than', exact: true }).click();

  const valueInput = page.getByTestId('constraint').first().getByTestId('value-input').locator('input');
  await valueInput.fill('25');
  await expect(valueInput).toHaveValue('25');

  await page.getByText('Render Syntax').click();

  await expect(page.locator('div.alerts span.syntaxDisplay'))
    .toContainText('(age Greater Than 25)');
});

test('Keeps action buttons centered under consumer button styles', async ({ page }) => {
  await page.goto('/simple');
  await page.addStyleTag({
    content: `
      .buttons { text-align: left !important; }
      .constraint-modeler button { text-align: left; }
    `,
  });

  const actionRow = page.locator('.constraint-modeler-actions');
  await expect(actionRow).toHaveCSS('display', 'flex');
  await expect(actionRow).toHaveCSS('justify-content', 'center');

  const centers = await actionRow.evaluate((row) => {
    const rowRect = row.getBoundingClientRect();
    const buttons = Array.from(row.querySelectorAll('button'));
    const firstRect = buttons[0]?.getBoundingClientRect();
    const lastRect = buttons.at(-1)?.getBoundingClientRect();

    if (!firstRect || !lastRect) {
      throw new Error('Action buttons were not rendered');
    }

    return {
      rowCenter: rowRect.left + rowRect.width / 2,
      buttonGroupCenter: firstRect.left + (lastRect.right - firstRect.left) / 2,
    };
  });

  expect(Math.abs(centers.rowCenter - centers.buttonGroupCenter)).toBeLessThan(1);
});
