const { test, expect } = require('@playwright/test');

test('muestra un aviso claro si app.js no llega a cargar, en vez de pantalla en blanco', async ({ page }) => {
  await page.route('**/app.js', (route) => route.abort());
  // No usamos el helper gotoApp: acá app.js nunca carga a propósito,
  // así que window.__appBooted nunca se pone en true.
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('#fatalError')).toBeVisible({ timeout: 8000 });
  await expect(page.locator('.fatal-error-title')).toHaveText('Algo no cargó bien');
});
