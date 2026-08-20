const { test, expect } = require('@playwright/test');
const { gotoApp, reloadApp } = require('./helpers');
const { clothingSuggestion } = require('../../logic.js');

test.describe('celebración de bloque completo', () => {
  test.beforeEach(async ({ page }) => {
    await gotoApp(page);
    await page.evaluate(() => localStorage.clear());
    await reloadApp(page);
  });

  test('completar un bloque entero dispara la celebración grande', async ({ page }) => {
    const checkboxes = page.locator('.block').first().locator('.item .checkbox');
    const total = await checkboxes.count();
    for (let i = 0; i < total; i++) await checkboxes.nth(i).click();

    await expect(page.locator('#blockCelebration')).toHaveClass(/visible/);
    // Nivel 23: el banner ya no muestra texto genérico ("... completa") sino
    // una frase motivacional al azar del banco.
    const phrases = await page.evaluate(() => JSON.parse(localStorage.getItem('veronica-motivational-phrases')));
    const bannerText = await page.locator('#blockCelebration').textContent();
    expect(phrases.some((p) => bannerText.includes(p.text))).toBe(true);
  });

  test('tildar un ítem que no completa el bloque no dispara la celebración', async ({ page }) => {
    const checkboxes = page.locator('.block').first().locator('.item .checkbox');
    const total = await checkboxes.count();
    test.skip(total < 2, 'el primer bloque del día necesita más de un ítem para probar esto');
    await checkboxes.first().click();
    // El banner se crea recién en su primer uso (mismo patrón lazy que
    // #saveErrorBanner) — si nunca disparó, ni siquiera existe en el DOM.
    await expect(page.locator('#blockCelebration')).toHaveCount(0);
  });
});

test.describe('canción del día', () => {
  test('es la misma durante todo el día, tras recargar, y abre un link real', async ({ page }) => {
    await gotoApp(page);
    await page.evaluate(() => localStorage.clear());
    await reloadApp(page);
    await page.getByRole('tab', { name: 'Biblioteca' }).click();

    const card = page.locator('.song-of-day');
    await expect(card).toBeVisible();
    const href = await card.getAttribute('href');
    expect(href).toMatch(/^https?:\/\//);
    const title1 = await card.locator('.lib-title').innerText();

    await reloadApp(page);
    await page.getByRole('tab', { name: 'Biblioteca' }).click();
    const title2 = await page.locator('.song-of-day .lib-title').innerText();
    expect(title2).toBe(title1);
  });
});

test.describe('resumen semanal', () => {
  test('aparece solo los domingos, con los números de la semana', async ({ page }) => {
    await page.clock.install({ time: new Date('2026-08-23T15:00:00-03:00') }); // domingo real
    await gotoApp(page);
    await page.evaluate(() => localStorage.clear());
    await reloadApp(page);

    await expect(page.locator('.weekly-summary')).toBeVisible();
    await expect(page.locator('.weekly-summary')).toContainText('0/7 días');
    await expect(page.locator('.weekly-summary')).toContainText('0.00 km');
  });

  test('no aparece un día que no es domingo', async ({ page }) => {
    await page.clock.install({ time: new Date('2026-08-19T15:00:00-03:00') }); // miércoles real
    await gotoApp(page);
    await page.evaluate(() => localStorage.clear());
    await reloadApp(page);

    await expect(page.locator('.weekly-summary')).toHaveCount(0);
  });
});

test.describe('sugerencia de vestimenta según el clima', () => {
  test('muestra temperatura y sugerencia según la respuesta de la API', async ({ page }) => {
    await page.route(/api\.open-meteo\.com/, (route) => route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ current: { temperature_2m: 5, precipitation: 2, wind_speed_10m: 40 } }),
    }));
    await gotoApp(page);
    await page.evaluate(() => localStorage.clear());
    await reloadApp(page);

    const expectedSuggestion = clothingSuggestion(5, 2, 40);
    await expect(page.locator('#weatherCard')).toBeVisible();
    await expect(page.locator('#weatherCard')).toHaveText(`🌤️ 5°C — ${expectedSuggestion}`);
  });

  test('si la API de clima falla, la card no aparece y el resto de la app sigue funcionando', async ({ page }) => {
    await page.route(/api\.open-meteo\.com/, (route) => route.fulfill({ status: 500, body: '' }));
    await gotoApp(page);
    await page.evaluate(() => localStorage.clear());
    await reloadApp(page);

    await expect(page.locator('#weatherCard')).toBeHidden();
    await expect(page.locator('.tab.active')).toBeVisible();
  });

  test('cachea el resultado por día calendario: no repite el fetch en un reload el mismo día', async ({ page }) => {
    let fetchCount = 0;
    await page.route(/api\.open-meteo\.com/, (route) => {
      fetchCount++;
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ current: { temperature_2m: 20, precipitation: 0, wind_speed_10m: 0 } }),
      });
    });
    await gotoApp(page);
    await page.evaluate(() => localStorage.clear());
    await reloadApp(page);
    await expect(page.locator('#weatherCard')).toBeVisible();
    // gotoApp() ya bootea la app una vez (con localStorage todavía sin
    // limpiar) antes de este punto, así que fetchCount ya viene en 2, no en
    // 1 — lo que importa es que NO suba más en el próximo reload del mismo día.
    const countAfterFirstLoad = fetchCount;

    await reloadApp(page);
    await expect(page.locator('#weatherCard')).toBeVisible();
    expect(fetchCount).toBe(countAfterFirstLoad);
  });
});
