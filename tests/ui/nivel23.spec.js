const { test, expect } = require('@playwright/test');
const { gotoApp, reloadApp } = require('./helpers');

test.describe('nombre editable', () => {
  test.beforeEach(async ({ page }) => {
    await gotoApp(page);
    await page.evaluate(() => localStorage.clear());
    await reloadApp(page);
  });

  test('muestra "Verónica" por defecto la primera vez', async ({ page }) => {
    await expect(page.locator('#userNameDisplay')).toHaveText('Verónica');
  });

  test('editar el nombre lo guarda y persiste tras recargar', async ({ page }) => {
    await page.locator('#userNameEditBtn').click();
    await expect(page.locator('#userNameInput')).toBeVisible();
    await expect(page.locator('#userNameRow')).toBeHidden();

    await page.locator('#userNameInput').fill('Gustavo');
    await page.locator('#userNameInput').press('Enter');

    await expect(page.locator('#userNameDisplay')).toHaveText('Gustavo');
    await expect(page.locator('#userNameRow')).toBeVisible();

    await reloadApp(page);
    await expect(page.locator('#userNameDisplay')).toHaveText('Gustavo');
  });

  test('Escape cancela la edición sin guardar cambios', async ({ page }) => {
    await page.locator('#userNameEditBtn').click();
    await page.locator('#userNameInput').fill('Nombre que no se guarda');
    await page.locator('#userNameInput').press('Escape');

    await expect(page.locator('#userNameInput')).toBeHidden();
    await expect(page.locator('#userNameDisplay')).toHaveText('Verónica');
  });

  test('dejar el campo vacío no borra el nombre', async ({ page }) => {
    await page.locator('#userNameEditBtn').click();
    await page.locator('#userNameInput').fill('   ');
    await page.locator('#userNameInput').press('Enter');

    await expect(page.locator('#userNameDisplay')).toHaveText('Verónica');
  });
});

test.describe('frases motivacionales', () => {
  test.beforeEach(async ({ page }) => {
    await gotoApp(page);
    await page.evaluate(() => localStorage.clear());
    await reloadApp(page);
  });

  test('la primera vez siembra el banco con las frases curadas', async ({ page }) => {
    const count = await page.locator('#phraseItemsList .lib-item').count();
    expect(count).toBeGreaterThan(20);
  });

  test('agregar, editar y borrar una frase propia', async ({ page }) => {
    // Nivel 23.1: la edición vive colapsada por defecto — hay que abrirla.
    await page.locator('#phrasesDetails summary').click();
    await page.locator('#phraseTextInput').fill('Frase de prueba nivel 23');
    await page.locator('#phraseFormSubmit').click();
    await expect(page.getByText('Frase de prueba nivel 23')).toBeVisible();

    const row = page.locator('#phraseItemsList .lib-item', { hasText: 'Frase de prueba nivel 23' });
    await row.locator('.lib-edit').click();
    await expect(page.locator('#phraseTextInput')).toHaveValue('Frase de prueba nivel 23');
    await page.locator('#phraseTextInput').fill('Frase editada nivel 23');
    await page.locator('#phraseFormSubmit').click();
    await expect(page.getByText('Frase editada nivel 23')).toBeVisible();

    page.once('dialog', (dialog) => dialog.accept());
    await page.locator('#phraseItemsList .lib-item', { hasText: 'Frase editada nivel 23' }).locator('.lib-del').click();
    await expect(page.getByText('Frase editada nivel 23')).not.toBeVisible();
  });

  test('los cambios en el banco persisten entre recargas', async ({ page }) => {
    await page.locator('#phrasesDetails summary').click();
    await page.locator('#phraseTextInput').fill('Frase persistente');
    await page.locator('#phraseFormSubmit').click();
    await expect(page.getByText('Frase persistente')).toBeVisible();

    await reloadApp(page);
    // El desplegable vuelve a arrancar cerrado en cada carga fresca.
    await page.locator('#phrasesDetails summary').click();
    await expect(page.getByText('Frase persistente')).toBeVisible();
  });

  test('el banco vacío deja el fallback genérico en la celebración', async ({ page }) => {
    // Vaciar el banco por localStorage en vez de borrar cada frase por la
    // UI: la mecánica de borrado ya está cubierta por el test anterior, y
    // borrar las ~34 frases seed una por una (con su diálogo confirm())
    // es lento y no aporta nada nuevo a este caso, que solo prueba el
    // fallback de celebrateBlockComplete() cuando la lista queda vacía.
    await page.evaluate(() => localStorage.setItem('veronica-motivational-phrases', JSON.stringify([])));
    await reloadApp(page);
    await expect(page.locator('#phraseItemsList .lib-item')).toHaveCount(0);

    const checkboxes = page.locator('.block').first().locator('.item .checkbox');
    const total = await checkboxes.count();
    for (let i = 0; i < total; i++) await checkboxes.nth(i).click();

    await expect(page.locator('#blockCelebration')).toHaveClass(/visible/);
    await expect(page.locator('#blockCelebration')).toContainText('¡Bloque completo!');
  });
});

test.describe('edición del banco de frases: colapsada, no ocupa espacio visible (Nivel 23.1)', () => {
  test.beforeEach(async ({ page }) => {
    await gotoApp(page);
    await page.evaluate(() => localStorage.clear());
    await reloadApp(page);
  });

  test('el listado y el formulario de frases no están visibles por defecto en Rutina', async ({ page }) => {
    await expect(page.locator('#phraseItemsList')).toBeHidden();
    await expect(page.locator('#phraseTextInput')).toBeHidden();
  });

  test('tampoco están visibles en otras pestañas (Biblioteca)', async ({ page }) => {
    await page.getByRole('tab', { name: 'Biblioteca' }).click();
    await expect(page.locator('#phraseItemsList')).toBeHidden();
    await expect(page.locator('#phraseTextInput')).toBeHidden();
  });

  test('tocar el resumen "Editar banco de frases" abre el listado y el formulario', async ({ page }) => {
    await page.locator('#phrasesDetails summary').click();
    await expect(page.locator('#phraseItemsList .lib-item').first()).toBeVisible();
    await expect(page.locator('#phraseTextInput')).toBeVisible();
  });
});

test.describe('celebración de bloque usa una frase del banco', () => {
  test.beforeEach(async ({ page }) => {
    await gotoApp(page);
    await page.evaluate(() => localStorage.clear());
    await reloadApp(page);
  });

  test('el banner muestra el texto de una frase real del banco, no el texto genérico', async ({ page }) => {
    const checkboxes = page.locator('.block').first().locator('.item .checkbox');
    const total = await checkboxes.count();
    for (let i = 0; i < total; i++) await checkboxes.nth(i).click();

    await expect(page.locator('#blockCelebration')).toHaveClass(/visible/);
    const bannerText = await page.locator('#blockCelebration').textContent();
    expect(bannerText).not.toContain('¡Mañana completa!');
    expect(bannerText).not.toContain('¡Bloque completo!');

    const phrases = await page.evaluate(() => JSON.parse(localStorage.getItem('veronica-motivational-phrases')));
    const shown = phrases.some((p) => bannerText.includes(p.text));
    expect(shown).toBe(true);
  });
});

test.describe('celebración de bloque: se cierra tocándola, sin timer', () => {
  test.beforeEach(async ({ page }) => {
    await gotoApp(page);
    await page.evaluate(() => localStorage.clear());
    await reloadApp(page);
  });

  test('queda visible más de lo que duraba el viejo timer de 3s, hasta que se toca', async ({ page }) => {
    const checkboxes = page.locator('.block').first().locator('.item .checkbox');
    const total = await checkboxes.count();
    for (let i = 0; i < total; i++) await checkboxes.nth(i).click();

    await expect(page.locator('#blockCelebration')).toHaveClass(/visible/);
    await page.waitForTimeout(4000);
    await expect(page.locator('#blockCelebration')).toHaveClass(/visible/);

    await page.locator('#blockCelebration').click();
    await expect(page.locator('#blockCelebration')).not.toHaveClass(/visible/);
  });

  test('también se puede cerrar con teclado (Enter o Espacio)', async ({ page }) => {
    const checkboxes = page.locator('.block').first().locator('.item .checkbox');
    const total = await checkboxes.count();
    for (let i = 0; i < total; i++) await checkboxes.nth(i).click();

    await expect(page.locator('#blockCelebration')).toHaveClass(/visible/);
    await page.locator('#blockCelebration').focus();
    await page.keyboard.press('Enter');
    await expect(page.locator('#blockCelebration')).not.toHaveClass(/visible/);
  });
});

test.describe('exportar / importar incluye nombre y frases', () => {
  test.beforeEach(async ({ page }) => {
    await gotoApp(page);
    await page.evaluate(() => localStorage.clear());
    await reloadApp(page);
  });

  test('exportData incluye el nombre y las frases actuales', async ({ page }) => {
    await page.locator('#userNameEditBtn').click();
    await page.locator('#userNameInput').fill('Nombre Test');
    await page.locator('#userNameInput').press('Enter');
    await expect(page.locator('#userNameDisplay')).toHaveText('Nombre Test');

    const exported = await page.evaluate(() => new Promise((resolve) => {
      const original = URL.createObjectURL;
      URL.createObjectURL = (blob) => {
        blob.text().then((text) => resolve(JSON.parse(text)));
        return original(blob);
      };
      window.exportData();
    }));

    expect(exported.userName).toBe('Nombre Test');
    expect(JSON.parse(exported.motivationalPhrases).length).toBeGreaterThan(0);
  });

  test('importData restaura el nombre y las frases desde un backup', async ({ page }) => {
    page.on('dialog', (dialog) => dialog.accept());

    await Promise.all([
      page.waitForNavigation({ waitUntil: 'domcontentloaded' }),
      page.evaluate(() => {
        const payload = {
          app: 'rutina-veronica',
          userName: 'Nombre Importado',
          motivationalPhrases: JSON.stringify([{ id: 'imp-1', text: 'Frase importada de prueba' }]),
        };
        const file = new File([JSON.stringify(payload)], 'backup.json', { type: 'application/json' });
        window.importData(file);
      }),
    ]);

    await page.waitForFunction(() => window.__appBooted === true, null, { timeout: 15000 });
    await expect(page.locator('#userNameDisplay')).toHaveText('Nombre Importado');
    // Nivel 23.1: el listado de frases vive colapsado por defecto — abrirlo
    // para poder verificar que la frase importada está ahí.
    await page.locator('#phrasesDetails summary').click();
    await expect(page.getByText('Frase importada de prueba')).toBeVisible();
  });
});
