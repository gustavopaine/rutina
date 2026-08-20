const { test, expect } = require('@playwright/test');
const { gotoApp } = require('./helpers');

// Regresión: el texto descriptivo de estos banners usaba class="note",
// la misma clase que las notitas musicales decorativas de fondo
// (position:fixed + animación). Eso hacía que el texto se saliera del
// flujo normal y quedara flotando encima del título del banner. Se
// renombró a "banner-note"; este test evita que vuelva a colisionar.

test('el texto del banner de Caminata no se superpone al título', async ({ page }) => {
  await gotoApp(page);
  await page.getByRole('tab', { name: 'Caminata' }).click();

  const nameBox = await page.locator('.walk-banner .name').boundingBox();
  const noteBox = await page.locator('.walk-banner .banner-note').boundingBox();

  expect(noteBox.y).toBeGreaterThanOrEqual(nameBox.y + nameBox.height - 2);
});

test('el texto del banner de Biblioteca no se superpone al título', async ({ page }) => {
  await gotoApp(page);
  await page.getByRole('tab', { name: 'Biblioteca' }).click();

  const nameBox = await page.locator('.lib-banner .name').boundingBox();
  const noteBox = await page.locator('.lib-banner .banner-note').boundingBox();

  expect(noteBox.y).toBeGreaterThanOrEqual(nameBox.y + nameBox.height - 2);
});
