const { test, expect } = require('@playwright/test');
const { gotoApp, reloadApp } = require('./helpers');

// No mockeamos Date: seedeamos el historial con fechas calculadas relativas
// a "ahora" (mismo reloj que usa la app), así el test no depende de qué día
// real sea corriendo en CI.
function isoDate(d){
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}
function daysAgoIso(n){
  const d = new Date();
  d.setDate(d.getDate() - n);
  return isoDate(d);
}

test.beforeEach(async ({ page }) => {
  await gotoApp(page);
  await page.evaluate(() => localStorage.clear());
});

test('sin nada completado todavía, el badge de racha no se muestra', async ({ page }) => {
  await reloadApp(page);
  await expect(page.locator('#streakBadge')).toBeHidden();
});

test('completar todos los items de hoy muestra la racha en vivo, sin recargar', async ({ page }) => {
  await reloadApp(page);
  const checkboxes = page.locator('.item .checkbox');
  const total = await checkboxes.count();
  for (let i = 0; i < total; i++) await checkboxes.nth(i).click();

  await expect(page.locator('#streakBadge')).toBeVisible();
  await expect(page.locator('#streakBadge')).toHaveText('🔥 1 día seguido');
});

test('una racha previa en el historial se suma a la de hoy', async ({ page }) => {
  const history = [3, 2, 1].map(daysAgoIso); // consecutivos, terminan ayer
  await page.evaluate((h) => localStorage.setItem('veronica-routine-history', JSON.stringify(h)), history);
  await reloadApp(page);

  const checkboxes = page.locator('.item .checkbox');
  const total = await checkboxes.count();
  for (let i = 0; i < total; i++) await checkboxes.nth(i).click();

  await expect(page.locator('#streakBadge')).toHaveText('🔥 4 días seguidos');
});

test('un hueco en el historial corta la racha antes de hoy', async ({ page }) => {
  const history = [daysAgoIso(5), daysAgoIso(2), daysAgoIso(1)]; // falta el de hace 3-4 días
  await page.evaluate((h) => localStorage.setItem('veronica-routine-history', JSON.stringify(h)), history);
  await reloadApp(page);

  const checkboxes = page.locator('.item .checkbox');
  const total = await checkboxes.count();
  for (let i = 0; i < total; i++) await checkboxes.nth(i).click();

  await expect(page.locator('#streakBadge')).toHaveText('🔥 3 días seguidos');
});
