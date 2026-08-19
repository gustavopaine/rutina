const { test, expect } = require('@playwright/test');
const { gotoApp, reloadApp } = require('./helpers');
const { computeStreak, weeklyForgivesRemaining, STREAK_FORGIVE_PER_WEEK: FORGIVE_PER_WEEK } = require('../../logic.js');

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

test('un hueco de varios días en el historial corta la racha (con el perdón semanal ya aplicado)', async ({ page }) => {
  const history = [daysAgoIso(5), daysAgoIso(2), daysAgoIso(1)]; // falta hace 3-4 días
  await page.evaluate((h) => localStorage.setItem('veronica-routine-history', JSON.stringify(h)), history);
  await reloadApp(page);

  const checkboxes = page.locator('.item .checkbox');
  const total = await checkboxes.count();
  for (let i = 0; i < total; i++) await checkboxes.nth(i).click();

  // Decisión deliberada, no un atajo: no se hardcodea el número porque con
  // el perdón semanal activo el resultado exacto depende de si el hueco de
  // 3-4 días atrás cruza un límite de semana (lunes), algo que varía según
  // qué día real sea "hoy" cuando corre el test. Este test verifica el
  // cableado end-to-end (historial en localStorage -> badge en pantalla),
  // no la matemática de computeStreak() en sí — eso ya está cubierto de
  // forma exhaustiva y determinística (fechas fijas) en tests/logic.test.js.
  const today = isoDate(new Date());
  const expectedStreak = computeStreak(history, today, true, FORGIVE_PER_WEEK);
  await expect(page.locator('#streakBadge')).toHaveText(
    `🔥 ${expectedStreak} día${expectedStreak === 1 ? '' : 's'} seguido${expectedStreak === 1 ? '' : 's'}`
  );
});

test('el indicador de perdón semanal (❄️) refleja el estado real, disponible o usado (Nivel 18)', async ({ page }) => {
  await reloadApp(page);
  const checkboxes = page.locator('.item .checkbox');
  const total = await checkboxes.count();
  for (let i = 0; i < total; i++) await checkboxes.nth(i).click();

  // Sin historial de racha guardado: el estado del perdón esta semana
  // depende de cuántos días ya pasaron desde el lunes, algo que varía
  // según qué día real sea "hoy" — se calcula con la misma función que
  // usa la app en vez de asumir un estado fijo.
  const today = isoDate(new Date());
  const remaining = weeklyForgivesRemaining([], today, FORGIVE_PER_WEEK);
  const expectedText = remaining > 0 ? '❄️ 1 perdón disponible esta semana' : '❄️ Perdón usado esta semana';
  await expect(page.locator('#streakForgiveHint')).toBeVisible();
  await expect(page.locator('#streakForgiveHint')).toHaveText(expectedText);
});
