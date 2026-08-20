const { test, expect } = require('@playwright/test');
const { gotoApp, reloadApp } = require('./helpers');

test.beforeEach(async ({ page }) => {
  await gotoApp(page);
  await page.evaluate(() => localStorage.clear());
  await reloadApp(page);
});

// Nivel 22: la navegación se separó en 2 grupos independientes — el
// selector de día (#dayTabs, 7 días, solo visible dentro de Rutina) y la
// barra de secciones (#bottomNav, 5 ítems, siempre visible). Antes era un
// único grupo de 11 — cada uno se testea por separado, con el mismo
// patrón de teclado (flechas/Home/End/roving tabindex) que ya se probaba.

test('el selector de día se navega con las flechas del teclado (roving tabindex)', async ({ page }) => {
  const tabs = page.locator('#dayTabs [role="tab"]');

  await page.locator('#dayTabs .tab.active').focus();

  await page.keyboard.press('ArrowRight');
  await expect(page.locator('#dayTabs [role="tab"][aria-selected="true"]')).toBeFocused();

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

test('la barra de navegación de secciones se navega con las flechas del teclado (roving tabindex)', async ({ page }) => {
  const navItems = page.locator('#bottomNav [role="tab"]');

  await page.locator('#bottomNav .nav-item.active').focus();

  await page.keyboard.press('ArrowRight');
  await expect(page.locator('#bottomNav [role="tab"][aria-selected="true"]')).toBeFocused();

  await page.keyboard.press('Home');
  await expect(navItems.first()).toHaveAttribute('aria-selected', 'true');
  await expect(navItems.first()).toBeFocused();

  await page.keyboard.press('End');
  await expect(navItems.last()).toHaveAttribute('aria-selected', 'true');
  await expect(navItems.last()).toBeFocused();

  const tabIndexes = await navItems.evaluateAll((els) => els.map((el) => el.tabIndex));
  expect(tabIndexes.filter((t) => t === 0)).toHaveLength(1);
});

test('activar una sección desde la barra inferior oculta el selector de día (grupos independientes, sin mezclar foco/selección)', async ({ page }) => {
  await page.getByRole('tab', { name: 'Biblioteca' }).click();
  await expect(page.locator('#dayTabsWrap')).toBeHidden();
  await expect(page.locator('#bottomNav [role="tab"][aria-selected="true"]')).toHaveText(/Biblioteca/);

  // Volver a Rutina desde la barra inferior muestra el selector de día de nuevo.
  await page.getByRole('tab', { name: 'Rutina' }).click();
  await expect(page.locator('#dayTabsWrap')).toBeVisible();
  await expect(page.locator('#bottomNav [role="tab"][aria-selected="true"]')).toHaveText(/Rutina/);
});

test('volver a "Rutina" desde una sección respeta el último día elegido, no siempre reinicia a hoy', async ({ page }) => {
  const dayTabs = page.locator('#dayTabs [role="tab"]');
  const todayLabel = await page.locator('#dayTabs .tab.active').textContent();

  // Elegimos cualquier día distinto al de hoy (el que ya está activo).
  const otherDay = dayTabs.filter({ hasNotText: todayLabel }).first();
  const otherDayLabel = await otherDay.textContent();
  await otherDay.click();
  await expect(page.locator('#dayTabs .tab.active')).toHaveText(otherDayLabel);

  await page.getByRole('tab', { name: 'Biblioteca' }).click();
  await page.getByRole('tab', { name: 'Rutina' }).click();

  await expect(page.locator('#dayTabs .tab.active')).toHaveText(otherDayLabel);
});
