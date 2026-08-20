const { test, expect } = require('@playwright/test');
const { gotoApp, reloadApp } = require('./helpers');

// Mismo criterio que streak.spec.js: seedeamos el historial con fechas
// relativas a "ahora" en vez de mockear Date, así el test no depende de
// qué día real sea corriendo en CI.
function isoDate(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}
function daysAgoIso(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return isoDate(d);
}

test.describe('hito de racha', () => {
  test.beforeEach(async ({ page }) => {
    await gotoApp(page);
    await page.evaluate(() => localStorage.clear());
  });

  test('al llegar a un hito (5 días seguidos) se ve el confetti/banner, una sola vez', async ({ page }) => {
    // 4 días consecutivos terminando ayer + hoy completado = racha de 5.
    const history = [4, 3, 2, 1].map(daysAgoIso);
    await page.evaluate((h) => localStorage.setItem('veronica-routine-history', JSON.stringify(h)), history);
    await reloadApp(page);

    const checkboxes = page.locator('.item .checkbox');
    const total = await checkboxes.count();
    for (let i = 0; i < total; i++) await checkboxes.nth(i).click();

    await expect(page.locator('#streakBadge')).toHaveText('🔥 5 días seguidos');
    await expect(page.locator('#blockCelebration')).toHaveClass(/visible/);
    await expect(page.locator('#blockCelebration')).toContainText('5 días seguidos');
  });

  test('recargar sin que la racha haya cambiado no repite la celebración del mismo hito', async ({ page }) => {
    const history = [4, 3, 2, 1].map(daysAgoIso);
    await page.evaluate((h) => localStorage.setItem('veronica-routine-history', JSON.stringify(h)), history);
    await reloadApp(page);

    const checkboxes = page.locator('.item .checkbox');
    const total = await checkboxes.count();
    for (let i = 0; i < total; i++) await checkboxes.nth(i).click();
    await expect(page.locator('#blockCelebration')).toHaveClass(/visible/);

    // El último ítem del día también completa el último bloque: la
    // celebración del hito puede quedar encolada 3s detrás de la de bloque
    // (ver "no pisa la celebración..." más abajo) y recién ahí se marca
    // "celebrado" en localStorage — a propósito, para no perderla si se
    // recarga durante la demora (ver comentario en celebrateStreakMilestone
    // en app.js). Hay que esperar a que efectivamente se muestre antes de
    // recargar, si no el test de "no repite" no prueba lo que dice probar.
    await expect(page.locator('#blockCelebration')).toContainText('5 días seguidos', { timeout: 5000 });

    // Recarga: el checklist de hoy persiste (mismo storage), la racha
    // sigue siendo 5 — no debería volver a crear/mostrar el banner.
    await reloadApp(page);
    await expect(page.locator('#blockCelebration')).toHaveCount(0);
    await expect(page.locator('#streakBadge')).toHaveText('🔥 5 días seguidos');
  });

  test('no celebra retroactivamente una racha ya larga la primera vez que corre este nivel', async ({ page }) => {
    // Sin la clave de "último hito celebrado" todavía en localStorage
    // (primera carga después de actualizar) pero con una racha que ya
    // superó varios hitos: no debe celebrar nada al arrancar.
    await page.evaluate(() => {
      window.celebrateStreakMilestone(30);
    });
    await expect(page.locator('#blockCelebration')).toHaveCount(0);
    const stored = await page.evaluate(() => JSON.parse(localStorage.getItem('veronica-last-streak-milestone')));
    expect(stored.value).toBe(30);

    // Con la marca ya inicializada en 30, una racha que sube a 60 sí
    // celebra ese hito nuevo.
    await page.evaluate(() => window.celebrateStreakMilestone(60));
    await expect(page.locator('#blockCelebration')).toHaveClass(/visible/);
    await expect(page.locator('#blockCelebration')).toContainText('60 días seguidos');
  });

  test('si la racha se corta y vuelve a subir en un día distinto, los hitos se pueden volver a celebrar', async ({ page }) => {
    const yesterday = daysAgoIso(1);
    await page.evaluate(
      (d) => localStorage.setItem('veronica-last-streak-milestone', JSON.stringify({ value: 5, date: d })),
      yesterday
    );

    // Nuevo día calendario y la racha bajó (2): es un corte real, no celebra
    // nada pero resetea la marca para poder volver a celebrar los hitos.
    await page.evaluate(() => window.celebrateStreakMilestone(2));
    await expect(page.locator('#blockCelebration')).toHaveCount(0);
    const afterReset = await page.evaluate(() => JSON.parse(localStorage.getItem('veronica-last-streak-milestone')));
    expect(afterReset.value).toBe(0);

    // La racha nueva vuelve a llegar a 5: se celebra de nuevo.
    await page.evaluate(() => window.celebrateStreakMilestone(5));
    await expect(page.locator('#blockCelebration')).toHaveClass(/visible/);
    await expect(page.locator('#blockCelebration')).toContainText('5 días seguidos');
  });

  test('una fluctuación de racha dentro del mismo día no repite ni resetea el hito', async ({ page }) => {
    // Primer llamado de la sesión: solo inicializa el estado (no celebra
    // retroactivo), para no confundirlo con el disparo real que sigue.
    await page.evaluate(() => window.celebrateStreakMilestone(0));

    // Regresión: destildar el último ítem por error, o agregar una tarea
    // nueva a un bloque ya completo, hace que la racha de HOY fluctúe hacia
    // abajo y para arriba sin que eso sea un corte real de racha.
    await page.evaluate(() => window.celebrateStreakMilestone(5));
    await expect(page.locator('#blockCelebration')).toHaveClass(/visible/);
    await page.evaluate(() => document.getElementById('blockCelebration').classList.remove('visible'));

    // La racha baja transitoriamente el mismo día: no debe celebrar nada,
    // y no debe resetear la marca (el hito 5 ya fue celebrado hoy).
    await page.evaluate(() => window.celebrateStreakMilestone(4));
    await expect(page.locator('#blockCelebration')).not.toHaveClass(/visible/);

    // Vuelve a 5 el mismo día: no debería volver a disparar el mismo hito.
    await page.evaluate(() => window.celebrateStreakMilestone(5));
    await expect(page.locator('#blockCelebration')).not.toHaveClass(/visible/);
  });

  test('no pisa la celebración de bloque completo si ambas caen en el mismo tilde', async ({ page }) => {
    // Primer llamado de la sesión: solo inicializa el estado (no celebra
    // retroactivo), para no confundirlo con el disparo real que sigue.
    await page.evaluate(() => window.celebrateStreakMilestone(0));

    // Regresión: celebrateBlockComplete() y celebrateStreakMilestone()
    // comparten el mismo banner — si el hito se dispara en el mismo tick
    // que la celebración de bloque (como pasa de verdad: el handler del
    // checkbox llama a ambas de forma síncrona vía renderDay()), debe
    // esperar en vez de pisarla. Las dos llamadas van en el MISMO
    // page.evaluate para reproducir eso — dos evaluate separados dejan un
    // round-trip de por medio cuya duración no está garantizada, y bajo
    // carga puede superar los 3s del banner y volver el test flaky sin que
    // haya ningún bug real.
    await page.evaluate(() => {
      window.celebrateBlockComplete('Mañana');
      window.celebrateStreakMilestone(5);
    });
    // Sigue mostrando la celebración de bloque mientras esa sigue vigente...
    await expect(page.locator('#blockCelebration')).toContainText('Mañana');
    // ...y después la reemplaza por la del hito, sin perderla.
    await expect(page.locator('#blockCelebration')).toContainText('5 días seguidos', { timeout: 5000 });
  });

  test('un llamado re-entrante mientras el hito está encolado no duplica la celebración', async ({ page }) => {
    // Regresión: mientras celebrateStreakMilestone() tiene un show() ya
    // encolado (banner de bloque todavía visible, ver test anterior), el
    // hito todavía no se marcó "celebrado" en localStorage (eso pasa recién
    // dentro de show()) — así que un segundo llamado con la misma racha,
    // disparado por cualquier interacción dentro de esos 3s (destildar y
    // volver a tildar, agregar una tarea, etc.), no debería encolar un
    // segundo show() y duplicar el confetti/banner/anuncio.
    await page.evaluate(() => window.celebrateStreakMilestone(0));

    const announceCount = await page.evaluate(() => {
      return new Promise((resolve) => {
        let count = 0;
        const original = window.announce;
        window.announce = (...args) => { count++; return original.apply(window, args); };

        window.celebrateBlockComplete('Mañana'); // ocupa el banner
        window.celebrateStreakMilestone(5); // se encola (banner ocupado)
        window.celebrateStreakMilestone(5); // re-entrante: no debería encolar otro

        setTimeout(() => resolve(count), 3500);
      });
    });

    // 1 anuncio de celebrateBlockComplete() + 1 del hito = 2. Si el llamado
    // re-entrante encoló un show() de más, serían 3.
    expect(announceCount).toBe(2);
  });
});

test.describe('canción del día editable', () => {
  test.beforeEach(async ({ page }) => {
    await gotoApp(page);
    await page.evaluate(() => localStorage.clear());
    await reloadApp(page);
    await page.getByRole('tab', { name: 'Biblioteca' }).click();
  });

  test('la primera vez siembra la rotación con las canciones existentes', async ({ page }) => {
    await expect(page.locator('#songItemsList .lib-item')).toHaveCount(5);
    await expect(page.locator('.song-of-day')).toBeVisible();
  });

  test('agregar, editar y borrar una canción de la rotación', async ({ page }) => {
    await page.locator('#songTitleInput').fill('Tema de prueba');
    await page.locator('#songUrlInput').fill('https://example.com/tema-test');
    await page.locator('#songAddBtn').click();
    await expect(page.getByText('Tema de prueba')).toBeVisible();

    const row = page.locator('#songItemsList .lib-item', { hasText: 'Tema de prueba' });
    await row.locator('.lib-edit').click();
    await expect(page.locator('#songTitleInput')).toHaveValue('Tema de prueba');
    await page.locator('#songTitleInput').fill('Tema editado');
    await page.locator('#songAddBtn').click();
    await expect(page.getByText('Tema editado')).toBeVisible();

    page.once('dialog', (dialog) => dialog.accept());
    await page.locator('#songItemsList .lib-item', { hasText: 'Tema editado' }).locator('.lib-del').click();
    await expect(page.getByText('Tema editado')).not.toBeVisible();
  });

  test('los cambios en la rotación persisten entre recargas', async ({ page }) => {
    await page.locator('#songTitleInput').fill('Tema persistente');
    await page.locator('#songUrlInput').fill('https://example.com/persistente');
    await page.locator('#songAddBtn').click();
    await expect(page.getByText('Tema persistente')).toBeVisible();

    await reloadApp(page);
    await page.getByRole('tab', { name: 'Biblioteca' }).click();
    await expect(page.getByText('Tema persistente')).toBeVisible();
  });
});
