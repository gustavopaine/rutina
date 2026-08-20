const { test, expect } = require('@playwright/test');
const { gotoApp, reloadApp } = require('./helpers');

test.beforeEach(async ({ page }) => {
  await gotoApp(page);
  await page.evaluate(() => localStorage.clear());
  await reloadApp(page);
  await page.getByRole('tab', { name: 'Cumples' }).click();
});

test('agregar, editar y borrar un cumpleaños', async ({ page }) => {
  await page.locator('#bdayNameInput').fill('Test Playwright');
  await page.locator('#bdayDayInput').fill('5');
  await page.locator('#bdayMonthInput').selectOption('3');
  await page.locator('#bdayFormSubmit').click();
  await expect(page.getByText('Test Playwright')).toBeVisible();

  const row = page.locator('.bday-item', { hasText: 'Test Playwright' });
  await row.locator('.bday-edit').click();
  await expect(page.locator('#bdayNameInput')).toHaveValue('Test Playwright');
  await page.locator('#bdayNameInput').fill('Test Editado');
  await page.locator('#bdayFormSubmit').click();
  await expect(page.getByText('Test Editado')).toBeVisible();

  page.once('dialog', (dialog) => dialog.accept());
  await page.locator('.bday-item', { hasText: 'Test Editado' }).locator('.bday-del').click();
  await expect(page.getByText('Test Editado')).not.toBeVisible();
});

test.describe('sync con recordatorios activos (Nivel 17)', () => {
  test('agregar un cumpleaños lo sincroniza al Worker con solo nombre/día/mes', async ({ page }) => {
    let birthdaysBody = null;
    await page.route(/rutina-veronica-push\.gustavopaine\.workers\.dev\/birthdays/, (route) => {
      birthdaysBody = route.request().postDataJSON();
      route.fulfill({ status: 204, body: '' });
    });
    // Simula una suscripción push ya activa (mismo patrón que reminders.spec.js).
    await page.addInitScript(() => {
      const fakeRegistration = {
        pushManager: {
          getSubscription: async () => ({
            endpoint: 'https://example.test/fake-endpoint',
            keys: { p256dh: 'fake-p256dh', auth: 'fake-auth' },
          }),
        },
      };
      Object.defineProperty(navigator.serviceWorker, 'ready', {
        get: () => Promise.resolve(fakeRegistration),
        configurable: true,
      });
    });

    await gotoApp(page);
    await page.evaluate(() => localStorage.clear());
    await reloadApp(page);
    await page.getByRole('tab', { name: 'Cumples' }).click();

    await page.locator('#bdayNameInput').fill('Sync Test');
    await page.locator('#bdayDayInput').fill('9');
    await page.locator('#bdayMonthInput').selectOption('11');
    await page.locator('#bdayFormSubmit').click();
    await expect(page.getByText('Sync Test')).toBeVisible();

    await expect.poll(() => birthdaysBody).not.toBeNull();
    const synced = birthdaysBody.find(b => b.name === 'Sync Test');
    expect(synced).toMatchObject({ name: 'Sync Test', day: 9, month: 11 });
    expect(Object.keys(synced).sort()).toEqual(['day', 'month', 'name']);
  });
});
