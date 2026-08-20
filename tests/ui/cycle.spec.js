const { test, expect } = require('@playwright/test');
const { gotoApp, reloadApp } = require('./helpers');
const { averagePeriodLengthDays, averageCycleLengthDays } = require('../../logic.js');

// Mismo criterio que streak.spec.js: seedeamos fechas relativas a "ahora" en
// vez de mockear Date, así el test no depende de qué día real sea corriendo
// en CI.
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
// Suma días a una fecha ISO por componentes (no new Date(isoString), que
// parsea como UTC y puede correr un día en husos negativos como ART).
function addDaysToIso(iso, days){
  const [y, m, d] = iso.split('-').map(Number);
  return isoDate(new Date(y, m - 1, d + days));
}

test.beforeEach(async ({ page }) => {
  await gotoApp(page);
  await page.evaluate(() => localStorage.clear());
  await reloadApp(page);
  await page.getByRole('tab', { name: 'Ciclo' }).click();
});

test('sin historial, "Inicio del período" crea una entrada abierta y muestra "Período en curso, día 1"', async ({ page }) => {
  await expect(page.getByText('Registrá tu primer período')).toBeVisible();

  await page.getByRole('button', { name: '🩸 Inicio del período' }).click();

  // getByText suelto matchea por substring: "Período en curso" también es
  // substring del botón "✏️ Cerrar período en curso (día N)" — se scopea al
  // eyebrow para desambiguar (mismo motivo en los tests de fase, abajo).
  await expect(page.locator('.eyebrow')).toHaveText('Período en curso');
  await expect(page.locator('.who')).toHaveText('Día 1');
  await expect(page.locator('.when')).toHaveText('🩸 Menstruación');
  await expect(page.getByText('– en curso')).toBeVisible(); // fila del historial
});

test('cerrar el período en curso muestra la duración derivada y libera "Inicio del período" de nuevo', async ({ page }) => {
  await page.getByRole('button', { name: '🩸 Inicio del período' }).click();
  await page.getByRole('button', { name: /Cerrar período en curso/ }).click();

  const startVal = await page.locator('#cycleStartInput').inputValue();
  await page.locator('#cycleEndInput').fill(addDaysToIso(startVal, 4)); // 5 días de período
  await page.getByRole('button', { name: '💾 Guardar cambios' }).click();

  await expect(page.locator('#cycleItemsList .lib-item', { hasText: '· 5 días' })).toBeVisible();
  await expect(page.getByRole('button', { name: '🩸 Inicio del período' })).toBeVisible();
  // Con un solo ciclo cargado (1 cerrado, 0 gaps entre inicios): la duración
  // de período ya es un promedio real, pero la de ciclo todavía no tiene
  // datos propios (necesita 2+ entradas) y sigue siendo el default clínico
  // — cada nota lo dice por separado (regresión: antes una sola nota
  // combinada implicaba que ambas eran "reales").
  await expect(page.getByText('Duración de período: promedio sobre los últimos 1 período registrado.')).toBeVisible();
  await expect(page.getByText('Duración de ciclo: estimado con el promedio clínico general')).toBeVisible();
});

test('con 2+ ciclos cerrados, Análisis muestra el promedio real (no el default clínico)', async ({ page }) => {
  const cycleA = { id: 'a', startDate: daysAgoIso(40), endDate: daysAgoIso(38) }; // 3 días
  const cycleB = { id: 'b', startDate: daysAgoIso(10), endDate: daysAgoIso(6) };  // 5 días, gap 30
  await page.evaluate((h) => localStorage.setItem('veronica-cycle-history', JSON.stringify(h)), [cycleA, cycleB]);
  await reloadApp(page);
  await page.getByRole('tab', { name: 'Ciclo' }).click();

  // No se hardcodea el número esperado por la misma razón que streak.spec.js:
  // este test verifica el cableado end-to-end (historial -> UI), la
  // matemática del promedio ya está cubierta exhaustivamente en
  // tests/logic.test.js.
  const expectedPeriod = averagePeriodLengthDays([cycleA, cycleB]).toFixed(1);
  const expectedCycle = averageCycleLengthDays([cycleA, cycleB]).toFixed(1);
  await expect(page.getByText(`${expectedPeriod} días`)).toBeVisible();
  await expect(page.getByText(`${expectedCycle} días`)).toBeVisible();
  // Con 2 ciclos cerrados hay 1 gap entre inicios: ambos promedios son
  // reales acá.
  await expect(page.getByText('Duración de período: promedio sobre los últimos 2 períodos registrados.')).toBeVisible();
  await expect(page.getByText('Duración de ciclo: promedio sobre los últimos 1 ciclo registrado.')).toBeVisible();
});

test('fase actual: menstruación mientras el período sigue abierto', async ({ page }) => {
  const entry = { id: 'a', startDate: daysAgoIso(1), endDate: null };
  await page.evaluate((h) => localStorage.setItem('veronica-cycle-history', JSON.stringify(h)), [entry]);
  await reloadApp(page);
  await page.getByRole('tab', { name: 'Ciclo' }).click();
  await expect(page.locator('.when')).toHaveText('🩸 Menstruación');
});

test('fase actual: fértil dentro de la ventana estimada', async ({ page }) => {
  // Único ciclo cerrado hace 14 días -> con el default de 28 días de ciclo,
  // el próximo período estimado cae en 14 días, la ovulación estimada
  // (próximo período - 14) cae hoy, y hoy queda dentro de la ventana
  // fértil (ovulación ±5/+1).
  const entry = { id: 'a', startDate: daysAgoIso(14), endDate: daysAgoIso(10) };
  await page.evaluate((h) => localStorage.setItem('veronica-cycle-history', JSON.stringify(h)), [entry]);
  await reloadApp(page);
  await page.getByRole('tab', { name: 'Ciclo' }).click();
  await expect(page.locator('.when')).toHaveText('🌱 Ventana fértil');
});

test('fase actual: otro fuera de menstruación y de la ventana fértil', async ({ page }) => {
  const entry = { id: 'a', startDate: daysAgoIso(20), endDate: daysAgoIso(16) };
  await page.evaluate((h) => localStorage.setItem('veronica-cycle-history', JSON.stringify(h)), [entry]);
  await reloadApp(page);
  await page.getByRole('tab', { name: 'Ciclo' }).click();
  await expect(page.locator('.when')).toHaveText('🗓️ Otro');
});

test('editar una entrada cerrada para borrarle la fecha de fin no reabre un segundo período si ya hay uno en curso', async ({ page }) => {
  const oldEntry = { id: 'old', startDate: daysAgoIso(20), endDate: daysAgoIso(16) };
  await page.evaluate((h) => localStorage.setItem('veronica-cycle-history', JSON.stringify(h)), [oldEntry]);
  await reloadApp(page);
  await page.getByRole('tab', { name: 'Ciclo' }).click();

  await page.getByRole('button', { name: '🩸 Inicio del período' }).click(); // abre un período nuevo, hoy

  // Editar la entrada VIEJA (ya cerrada, no la que se acaba de abrir hoy) y
  // borrarle la fecha de fin — sin el guard, esto reabriría un segundo
  // período mientras ya hay uno en curso.
  const oldRow = page.locator('#cycleItemsList .lib-item').filter({ hasNotText: 'en curso' });
  await oldRow.locator('.lib-edit').click();
  await page.locator('#cycleEndInput').fill('');

  let alertMessage = '';
  page.once('dialog', async (dialog) => { alertMessage = dialog.message(); await dialog.accept(); });
  await page.getByRole('button', { name: '💾 Guardar cambios' }).click();
  await expect.poll(() => alertMessage).toContain('Ya hay un período en curso');

  const historyAfter = await page.evaluate(() => JSON.parse(localStorage.getItem('veronica-cycle-history')));
  const stillOld = historyAfter.find((e) => e.id === 'old');
  expect(stillOld.endDate).toBe(oldEntry.endDate); // no se reabrió
  expect(historyAfter.filter((e) => !e.endDate).length).toBe(1); // sigue habiendo una sola entrada abierta
});

// Dato sensible (salud): este es el test central del nivel. Verifica que
// ninguna acción del Calendario Menstrual — a diferencia de Cumpleaños, que
// sí sincroniza al Worker — dispare jamás una request de red hacia el
// Worker de Cloudflare.
test('el flujo completo de Inicio del período -> editar -> borrar nunca hace ninguna request al Worker', async ({ page }) => {
  const workerRequests = [];
  page.on('request', (req) => {
    if (/workers\.dev/.test(req.url())) workerRequests.push(req.url());
  });

  await page.getByRole('button', { name: '🩸 Inicio del período' }).click();
  await page.getByRole('button', { name: /Cerrar período en curso/ }).click();
  const startVal = await page.locator('#cycleStartInput').inputValue();
  await page.locator('#cycleEndInput').fill(addDaysToIso(startVal, 4));
  await page.getByRole('button', { name: '💾 Guardar cambios' }).click();

  page.once('dialog', (dialog) => dialog.accept());
  await page.locator('#cycleItemsList .lib-item').first().locator('.lib-del').click();
  await expect(page.getByText('Registrá tu primer período')).toBeVisible();

  expect(workerRequests).toEqual([]);
});
