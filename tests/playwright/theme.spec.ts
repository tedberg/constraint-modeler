import { test, expect } from '@playwright/test';

// ---------------------------------------------------------------------------
// Helper — runs in Node test context (not in browser)
// ---------------------------------------------------------------------------

/** Returns true when a computed backgroundColor string is dark.
 *  Handles both oklch(L C H) (modern Chromium) and rgb(R G B) formats.
 */
function isColorDark(color: string): boolean {
  // oklch(L C H) — L is perceptual lightness 0–1
  const oklchMatch = color.match(/^oklch\(\s*([\d.]+)/);
  if (oklchMatch) {
    return parseFloat(oklchMatch[1]) < 0.5;
  }
  // rgb(R G B) / rgba(R G B A) — values are 0–255
  const rgbMatch = color.match(/^rgba?\((\d+),?\s*(\d+),?\s*(\d+)/);
  if (rgbMatch) {
    const [, r, g, b] = rgbMatch.map(Number);
    return (0.299 * r + 0.587 * g + 0.114 * b) / 255 < 0.4;
  }
  return false;
}

// ---------------------------------------------------------------------------
// Shared setup — clear saved preferences before every test
// ---------------------------------------------------------------------------

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => {
    localStorage.removeItem('cm-dark');
    localStorage.removeItem('cm-theme');
  });
  await page.reload();
});

// ---------------------------------------------------------------------------
// Dark / light mode toggle (home page)
// ---------------------------------------------------------------------------

test.describe('dark/light mode toggle', () => {
  test('defaults to light mode', async ({ page }) => {
    await expect(page.locator('html')).toHaveClass(/\blight\b/);
    await expect(page.locator('button[title="Switch to dark mode"]')).toBeVisible();
  });

  test('toggle switches to dark mode', async ({ page }) => {
    await page.locator('button[title="Switch to dark mode"]').click();

    await expect(page.locator('html')).not.toHaveClass(/\blight\b/);
    await expect(page.locator('button[title="Switch to light mode"]')).toBeVisible();
  });

  test('toggle switches back to light mode', async ({ page }) => {
    await page.locator('button[title="Switch to dark mode"]').click();
    await page.locator('button[title="Switch to light mode"]').click();

    await expect(page.locator('html')).toHaveClass(/\blight\b/);
  });

  test('light and dark modes produce different page background colors', async ({ page }) => {
    const lightBg = await page.locator('[data-test="page-background"]').first().evaluate(
      el => getComputedStyle(el).backgroundColor,
    );

    await page.locator('button[title="Switch to dark mode"]').click();

    const darkBg = await page.locator('[data-test="page-background"]').first().evaluate(
      el => getComputedStyle(el).backgroundColor,
    );

    expect(lightBg).not.toBe(darkBg);
  });

  test('preference persists across navigation', async ({ page }) => {
    await page.locator('button[title="Switch to dark mode"]').click();
    await page.goto('/simple');
    await expect(page.locator('html')).not.toHaveClass(/\blight\b/);
  });
});

// ---------------------------------------------------------------------------
// Theme picker (home page)
// ---------------------------------------------------------------------------

test.describe('theme picker', () => {
  test('applies Midnight Bloom theme', async ({ page }) => {
    await page.locator('button[title="Choose theme"]').click();
    await page.getByRole('menuitem', { name: 'Midnight Bloom' }).click();

    await expect(page.locator('html')).toHaveClass(/theme-midnight/);

    const radius = await page.evaluate(() =>
      getComputedStyle(document.documentElement).getPropertyValue('--radius').trim(),
    );
    expect(radius).toBe('0.75rem');
  });

  test('applies Modern Minimal theme', async ({ page }) => {
    await page.locator('button[title="Choose theme"]').click();
    await page.getByRole('menuitem', { name: 'Modern Minimal' }).click();

    await expect(page.locator('html')).toHaveClass(/theme-minimal/);

    const radius = await page.evaluate(() =>
      getComputedStyle(document.documentElement).getPropertyValue('--radius').trim(),
    );
    expect(radius).toBe('0.25rem');
  });

  test('applies Solar Dusk theme', async ({ page }) => {
    await page.locator('button[title="Choose theme"]').click();
    await page.getByRole('menuitem', { name: 'Solar Dusk' }).click();

    await expect(page.locator('html')).toHaveClass(/theme-solar/);
  });

  test('resets to Default theme', async ({ page }) => {
    await page.locator('button[title="Choose theme"]').click();
    await page.getByRole('menuitem', { name: 'Midnight Bloom' }).click();
    await expect(page.locator('html')).toHaveClass(/theme-midnight/);

    await page.locator('button[title="Choose theme"]').click();
    await page.getByRole('menuitem', { name: /^Default$/ }).click();

    await expect(page.locator('html')).not.toHaveClass(/theme-/);
  });

  test('switching themes changes the --background CSS variable', async ({ page }) => {
    const defaultBg = await page.evaluate(() =>
      getComputedStyle(document.documentElement).getPropertyValue('--background').trim(),
    );

    await page.locator('button[title="Choose theme"]').click();
    await page.getByRole('menuitem', { name: 'Midnight Bloom' }).click();

    const midnightBg = await page.evaluate(() =>
      getComputedStyle(document.documentElement).getPropertyValue('--background').trim(),
    );

    expect(midnightBg).not.toBe(defaultBg);
  });

  test('active theme shows checkmark in dropdown', async ({ page }) => {
    await page.locator('button[title="Choose theme"]').click();
    await page.getByRole('menuitem', { name: 'Midnight Bloom' }).click();

    await page.locator('button[title="Choose theme"]').click();

    const midnightItem = page.getByRole('menuitem', { name: /Midnight Bloom/ });
    const defaultItem  = page.getByRole('menuitem', { name: /^Default$/ });

    await expect(midnightItem.locator('svg')).toBeVisible();
    await expect(defaultItem.locator('svg')).not.toBeVisible();
  });

  test('theme persists across navigation', async ({ page }) => {
    await page.locator('button[title="Choose theme"]').click();
    await page.getByRole('menuitem', { name: 'Midnight Bloom' }).click();

    await page.goto('/simple');
    await expect(page.locator('html')).toHaveClass(/theme-midnight/);
  });
});

// ---------------------------------------------------------------------------
// ConstraintModeler and dropdowns on /everything
// ---------------------------------------------------------------------------

test.describe('constraint modeler on /everything', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/everything');
    await page.locator('.constraint-modeler').waitFor();
  });

  // -- Page background responds to mode/theme --------------------------------

  test('page is light by default', async ({ page }) => {
    const bg = await page.locator('[data-test="page-background"]').first().evaluate(
      el => getComputedStyle(el).backgroundColor,
    );
    expect(isColorDark(bg)).toBe(false);
  });

  test('page goes dark when dark mode is toggled', async ({ page }) => {
    await page.locator('button[title="Switch to dark mode"]').click();

    const bg = await page.locator('[data-test="page-background"]').first().evaluate(
      el => getComputedStyle(el).backgroundColor,
    );
    expect(isColorDark(bg)).toBe(true);
  });

  test('page background changes with Solar Dusk theme (dark mode)', async ({ page }) => {
    await page.locator('button[title="Switch to dark mode"]').click();

    const defaultDarkBg = await page.locator('[data-test="page-background"]').first().evaluate(
      el => getComputedStyle(el).backgroundColor,
    );

    await page.locator('button[title="Choose theme"]').click();
    await page.getByRole('menuitem', { name: 'Solar Dusk' }).click();

    const solarDarkBg = await page.locator('[data-test="page-background"]').first().evaluate(
      el => getComputedStyle(el).backgroundColor,
    );

    expect(solarDarkBg).not.toBe(defaultDarkBg);
  });

  test('page background changes with Midnight Bloom theme (light mode)', async ({ page }) => {
    const defaultLightBg = await page.locator('[data-test="page-background"]').first().evaluate(
      el => getComputedStyle(el).backgroundColor,
    );

    await page.locator('button[title="Choose theme"]').click();
    await page.getByRole('menuitem', { name: 'Midnight Bloom' }).click();

    const midnightLightBg = await page.locator('[data-test="page-background"]').first().evaluate(
      el => getComputedStyle(el).backgroundColor,
    );

    expect(midnightLightBg).not.toBe(defaultLightBg);
  });

  // -- ConstraintModeler component follows page theme -----------------------

  test('component background is light in light mode', async ({ page }) => {
    const bg = await page.locator('.constraint-modeler').evaluate(
      el => getComputedStyle(el).backgroundColor,
    );
    expect(isColorDark(bg)).toBe(false);
  });

  test('component background is dark in dark mode', async ({ page }) => {
    await page.locator('button[title="Switch to dark mode"]').click();

    const bg = await page.locator('.constraint-modeler').evaluate(
      el => getComputedStyle(el).backgroundColor,
    );
    expect(isColorDark(bg)).toBe(true);
  });

  test('component background changes between light and dark modes', async ({ page }) => {
    const lightBg = await page.locator('.constraint-modeler').evaluate(
      el => getComputedStyle(el).backgroundColor,
    );

    await page.locator('button[title="Switch to dark mode"]').click();

    const darkBg = await page.locator('.constraint-modeler').evaluate(
      el => getComputedStyle(el).backgroundColor,
    );

    expect(darkBg).not.toBe(lightBg);
  });

  test('component background changes with Midnight Bloom theme in dark mode', async ({ page }) => {
    await page.locator('button[title="Switch to dark mode"]').click();

    const defaultDarkBg = await page.locator('.constraint-modeler').evaluate(
      el => getComputedStyle(el).backgroundColor,
    );

    await page.locator('button[title="Choose theme"]').click();
    await page.getByRole('menuitem', { name: 'Midnight Bloom' }).click();

    const midnightBg = await page.locator('.constraint-modeler').evaluate(
      el => getComputedStyle(el).backgroundColor,
    );

    expect(midnightBg).not.toBe(defaultDarkBg);
  });

  // -- Dropdown menus follow page theme --------------------------------------

  test('property dropdown is light in light mode', async ({ page }) => {
    await page.locator('[data-test="property-menu"] button').first().click();

    const menu = page.locator('[role="menu"]').first();
    await expect(menu).toBeVisible();

    const bg = await menu.evaluate(el => getComputedStyle(el).backgroundColor);
    expect(isColorDark(bg)).toBe(false);
  });

  test('property dropdown is dark in dark mode', async ({ page }) => {
    await page.locator('button[title="Switch to dark mode"]').click();
    await page.locator('[data-test="property-menu"] button').first().click();

    const menu = page.locator('[role="menu"]').first();
    await expect(menu).toBeVisible();

    const bg = await menu.evaluate(el => getComputedStyle(el).backgroundColor);
    expect(isColorDark(bg)).toBe(true);
  });

  test('property dropdown is dark with Midnight Bloom theme in dark mode', async ({ page }) => {
    await page.locator('button[title="Switch to dark mode"]').click();
    await page.locator('button[title="Choose theme"]').click();
    await page.getByRole('menuitem', { name: 'Midnight Bloom' }).click();

    await page.locator('[data-test="property-menu"] button').first().click();

    const menu = page.locator('[role="menu"]').first();
    await expect(menu).toBeVisible();

    const bg = await menu.evaluate(el => getComputedStyle(el).backgroundColor);
    expect(isColorDark(bg)).toBe(true);
  });

  test('comparison dropdown is light in light mode', async ({ page }) => {
    await page.locator('[data-test="comparison-menu"] button').first().click();

    const menu = page.locator('[role="menu"]').first();
    await expect(menu).toBeVisible();

    const bg = await menu.evaluate(el => getComputedStyle(el).backgroundColor);
    expect(isColorDark(bg)).toBe(false);
  });

  test('comparison dropdown is dark in dark mode', async ({ page }) => {
    await page.locator('button[title="Switch to dark mode"]').click();
    await page.locator('[data-test="comparison-menu"] button').first().click();

    const menu = page.locator('[role="menu"]').first();
    await expect(menu).toBeVisible();

    const bg = await menu.evaluate(el => getComputedStyle(el).backgroundColor);
    expect(isColorDark(bg)).toBe(true);
  });

  // -- Submenus follow page theme -------------------------------------------

  test('property submenu is light in light mode', async ({ page }) => {
    await page.locator('[data-test="property-menu"] button').first().click();

    await page.getByRole('menuitem', { name: /^Alert$/ }).hover();
    await page.waitForSelector('[role="menu"] >> text=Contact', { state: 'visible' });

    const menus = page.locator('[role="menu"]');
    expect(await menus.count()).toBe(2);

    for (const menu of await menus.all()) {
      const bg = await menu.evaluate(el => getComputedStyle(el).backgroundColor);
      expect(isColorDark(bg)).toBe(false);
    }
  });

  test('property submenu is dark in dark mode', async ({ page }) => {
    await page.locator('button[title="Switch to dark mode"]').click();
    await page.locator('[data-test="property-menu"] button').first().click();

    await page.getByRole('menuitem', { name: /^Alert$/ }).hover();
    await page.waitForSelector('[role="menu"] >> text=Contact', { state: 'visible' });

    for (const menu of await page.locator('[role="menu"]').all()) {
      const bg = await menu.evaluate(el => getComputedStyle(el).backgroundColor);
      expect(isColorDark(bg)).toBe(true);
    }
  });

  test('property submenu is dark with Solar Dusk theme in dark mode', async ({ page }) => {
    await page.locator('button[title="Switch to dark mode"]').click();
    await page.locator('button[title="Choose theme"]').click();
    await page.getByRole('menuitem', { name: 'Solar Dusk' }).click();

    await page.locator('[data-test="property-menu"] button').first().click();

    await page.getByRole('menuitem', { name: /^Alert$/ }).hover();
    await page.waitForSelector('[role="menu"] >> text=Contact', { state: 'visible' });

    for (const menu of await page.locator('[role="menu"]').all()) {
      const bg = await menu.evaluate(el => getComputedStyle(el).backgroundColor);
      expect(isColorDark(bg)).toBe(true);
    }
  });
});
