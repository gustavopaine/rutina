const { test, expect } = require('@playwright/test');
const { gotoApp, reloadApp } = require('./helpers');

test.beforeEach(async ({ page }) => {
  await gotoApp(page);
  await page.evaluate(() => localStorage.clear());
  await reloadApp(page);
});

test('abre en la pestaña del día actual', async ({ page }) => {
  await expect(page.locator('.tab.active')).toBeVisible();
});

test('tildar una tarea actualiza el progreso y persiste tras recargar', async ({ page }) => {
  const progLabel = page.locator('#progLabel');
  const total = (await progLabel.textContent()).split('/')[1];

  // Clickeamos el ícono visible del checkbox, no el <input> real (que
  // está oculto visualmente a propósito por accesibilidad y por eso
  // Playwright no lo deja clickear en su propia posición) — así se
  // dispara el "label forwarding" nativo, igual que haría una persona.
  await page.locator('.item .checkbox').first().click();
  await expect(progLabel).toHaveText(`1/${total}`);
  await expect(page.locator('.item').first()).toHaveClass(/done/);

  await reloadApp(page);
  await expect(progLabel).toHaveText(`1/${total}`);
  await expect(page.locator('.item').first()).toHaveClass(/done/);
});

test('un día calendario nuevo reinicia el checklist de hoy', async ({ page }) => {
  const progLabel = page.locator('#progLabel');
  const total = (await progLabel.textContent()).split('/')[1];

  // Clickeamos el ícono visible del checkbox, no el <input> real (que
  // está oculto visualmente a propósito por accesibilidad y por eso
  // Playwright no lo deja clickear en su propia posición) — así se
  // dispara el "label forwarding" nativo, igual que haría una persona.
  await page.locator('.item .checkbox').first().click();
  await expect(progLabel).toHaveText(`1/${total}`);

  await page.evaluate(() => localStorage.setItem('veronica-checklist-last-active', '2000-01-01'));
  await reloadApp(page);

  await expect(progLabel).toHaveText(`0/${total}`);
});
