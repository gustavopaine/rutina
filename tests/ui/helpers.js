// La página carga fuentes de Google y Leaflet desde CDNs externos que no
// hacen falta para estos tests. Esperar el evento "load" por defecto de
// Playwright cuelga el test si no hay internet o esos CDNs están lentos/
// caídos. Estos helpers solo esperan a que la app misma esté lista.

async function waitAppReady(page) {
  await page.waitForFunction(() => window.__appBooted === true, null, { timeout: 15000 });
}

async function gotoApp(page, path = '/') {
  // Nada de lo que testeamos acá necesita las fuentes de Google ni el
  // mapa (Leaflet/OpenStreetMap) — los bloqueamos para que los tests no
  // dependan de la conexión a internet real ni de la latencia de esos CDNs.
  await page.route(/fonts\.googleapis\.com|fonts\.gstatic\.com|cdnjs\.cloudflare\.com|tile\.openstreetmap\.org/, (route) => route.abort());
  await page.goto(path, { waitUntil: 'domcontentloaded' });
  await waitAppReady(page);
}

async function reloadApp(page) {
  await page.reload({ waitUntil: 'domcontentloaded' });
  await waitAppReady(page);
}

module.exports = { gotoApp, reloadApp, waitAppReady };
