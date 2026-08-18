const { test, expect } = require('@playwright/test');
const { gotoApp, reloadApp } = require('./helpers');

test.beforeEach(async ({ page }) => {
  await gotoApp(page);
  await page.evaluate(() => localStorage.clear());
  await reloadApp(page);
});

test('las pestañas se navegan con las flechas del teclado (roving tabindex)', async ({ page }) => {
  const tabs = page.locator('#tabs [role="tab"]');

  await page.locator('.tab.active').focus();

  await page.keyboard.press('ArrowRight');
  await expect(page.locator('#tabs [role="tab"][aria-selected="true"]')).toBeFocused();

  await page.keyboard.press('Home');
  await expect(tabs.first()).toHaveAttribute('aria-selected', 'true');
  await expect(tabs.first()).toBeFocused();

  await page.keyboard.press('End');
  await expect(tabs.last()).toHaveAttribute('aria-selected', 'true');
  await expect(tabs.last()).toBeFocused();

  // Roving tabindex: solo la pestaña activa es una parada de Tab (tabindex 0).
  const tabIndexes = await tabs.evaluateAll((els) => els.map((el) => el.tabIndex));
  expect(tabIndexes.filter((t) => t === 0)).toHaveLength(1);
});
