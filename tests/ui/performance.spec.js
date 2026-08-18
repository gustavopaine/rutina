const { test, expect } = require('@playwright/test');
const { gotoApp } = require('./helpers');

test.beforeEach(async ({ page }) => {
  await gotoApp(page);
  await page.evaluate(() => localStorage.clear());
});

test('burstConfetti no deja elementos colgados en el DOM tras usar la app un rato', async ({ page }) => {
  await gotoApp(page);
  const checkbox = page.locator('.item .checkbox').first();

  // Tildar/destildar varias veces seguidas dispara confeti en cada
  // "hecho" (burstConfetti crea ~10 elementos por ráfaga que se
  // autodestruyen a los 1000ms). Simula un uso intenso de la app.
  for (let i = 0; i < 15; i++) {
    await checkbox.click();
  }
  await page.waitForTimeout(1500); // pasado el tiempo de autolimpieza

  const leftoverConfetti = await page.evaluate(
    () => document.querySelectorAll('[style*="z-index: 999"]').length
  );
  expect(leftoverConfetti).toBe(0);
});

test('guardar el progreso de una caminata larga (miles de puntos) sigue siendo rápido', async ({ page }) => {
  await page.getByRole('tab', { name: '📍 Caminata' }).click();

  const elapsedMs = await page.evaluate(() => {
    // Simula una caminata de varias horas con actualizaciones cada
    // pocos segundos: miles de puntos acumulados en el path guardado.
    const path = [];
    let lat = -40.8135;
    const lng = -62.9967;
    const now = Date.now();
    for (let i = 0; i < 3000; i++) {
      lat += 0.00001;
      path.push({ lat, lng, t: now + i * 3000 });
    }
    localStorage.setItem(
      'veronica-walk-inprogress',
      JSON.stringify({ startTime: now, path, mode: 'walking' })
    );

    const start = performance.now();
    // Mismo patrón que saveInProgressWalk(): releer, agregar un punto, regrabar.
    const parsed = JSON.parse(localStorage.getItem('veronica-walk-inprogress'));
    parsed.path.push({ lat: lat + 0.00001, lng, t: Date.now() });
    localStorage.setItem('veronica-walk-inprogress', JSON.stringify(parsed));
    return performance.now() - start;
  });

  expect(elapsedMs).toBeLessThan(300);
});

test('el uso normal de la app no genera un crecimiento de memoria fuera de lo razonable', async ({ page }) => {
  await gotoApp(page);

  const hasMemoryApi = await page.evaluate(() => !!performance.memory);
  test.skip(!hasMemoryApi, 'performance.memory no disponible en este navegador');

  const before = await page.evaluate(() => performance.memory.usedJSHeapSize);

  // Tildar/destildar repetidas veces obliga a renderDay() a rehacer todo
  // el DOM del panel del día una y otra vez (banner, progreso, bloques,
  // items) — es la operación que más se repite en un uso real de la app.
  const checkbox = page.locator('.item .checkbox').first();
  for (let i = 0; i < 15; i++) {
    await checkbox.click();
  }

  const after = await page.evaluate(() => performance.memory.usedJSHeapSize);
  const growthMb = (after - before) / (1024 * 1024);
  // Umbral generoso a propósito: esto no busca medir con precisión,
  // solo atajar una fuga grosera (nodos del DOM o listeners que no se
  // liberan nunca).
  expect(growthMb).toBeLessThan(30);
});
