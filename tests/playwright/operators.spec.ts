import { test, expect } from '@playwright/test';

test('Number field shows numeric operators and generates correct syntax', async ({ page }) => {
  await page.goto('/simple');

  await page.getByTestId('add-constraint').click();
  const constraint = page.getByTestId('constraint').first();

  await constraint.locator('[data-test="property-menu"] a.nav-link').click();
  await page.getByRole('menuitem', { name: /^Age$/ }).click();

  // Open comparison menu and verify numeric operators are visible
  await constraint.locator('[data-test="comparison-menu"] a.nav-link').click();
  await expect(page.getByRole('menuitem', { name: 'Less Than', exact: true })).toBeVisible();
  await expect(page.getByRole('menuitem', { name: 'Less Than or Equal', exact: true })).toBeVisible();
  await expect(page.getByRole('menuitem', { name: 'Greater Than', exact: true })).toBeVisible();
  await expect(page.getByRole('menuitem', { name: 'Greater Than or Equal', exact: true })).toBeVisible();
  await expect(page.getByRole('menuitem', { name: 'Equal', exact: true })).toBeVisible();
  await expect(page.getByRole('menuitem', { name: 'Not Equal', exact: true })).toBeVisible();

  await page.getByRole('menuitem', { name: 'Less Than or Equal', exact: true }).click();
  await constraint.getByTestId('value-input').locator('input').fill('30');

  await page.getByText('Render Syntax').click();
  await expect(page.locator('div.alerts span.syntaxDisplay'))
    .toContainText('(age Less Than or Equal 30)');
});

test('String field shows string operators and generates correct syntax', async ({ page }) => {
  await page.goto('/simple');

  await page.getByTestId('add-constraint').click();
  const constraint = page.getByTestId('constraint').first();

  await constraint.locator('[data-test="property-menu"] a.nav-link').click();
  await page.getByRole('menuitem', { name: /^Name$/ }).click();

  await constraint.locator('[data-test="comparison-menu"] a.nav-link').click();
  await expect(page.getByRole('menuitem', { name: 'Like', exact: true })).toBeVisible();
  await expect(page.getByRole('menuitem', { name: 'Not Like', exact: true })).toBeVisible();

  await page.getByRole('menuitem', { name: 'Like', exact: true }).click();
  await constraint.getByTestId('value-input').locator('input').fill('*Smith');

  await page.getByText('Render Syntax').click();
  await expect(page.locator('div.alerts span.syntaxDisplay'))
    .toContainText("(name Like '*Smith')");
});

test('Enum field shows Equal/Not Equal operators and generates correct syntax', async ({ page }) => {
  await page.goto('/simple');

  await page.getByTestId('add-constraint').click();
  const constraint = page.getByTestId('constraint').first();

  await constraint.locator('[data-test="property-menu"] a.nav-link').click();
  await page.getByRole('menuitem', { name: /^Status$/ }).click();

  await constraint.locator('[data-test="comparison-menu"] a.nav-link').click();
  await page.getByRole('menuitem', { name: 'Equal', exact: true }).click();

  // Status is an enum — value input renders a <select>
  await constraint.getByTestId('value-input').locator('select').selectOption({ label: 'Disabled' });

  await page.getByText('Render Syntax').click();
  await expect(page.locator('div.alerts span.syntaxDisplay'))
    .toContainText('(status Equal DISABLED)');
});
