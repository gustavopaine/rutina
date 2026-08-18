const { test, expect } = require('@playwright/test');
const { gotoApp, reloadApp } = require('./helpers');

// Mockeamos Notification.requestPermission y navigator.serviceWorker.ready
// para no depender de un push service real (Google/Apple) ni de nuestro
// Worker de Cloudflare en producción — estos tests solo verifican la UI del
// botón, no el envío real de push (eso se verifica a mano, ver README).
async function mockPushSupport(page){
  await page.route(/rutina-veronica-push\.gustavopaine\.workers\.dev/, (route) =>
    route.fulfill({ status: 204, body: '' })
  );
  await page.addInitScript(() => {
    Object.defineProperty(window.Notification, 'requestPermission', {
      value: async () => 'granted',
      configurable: true,
    });

    let subscribed = null;
    const fakeRegistration = {
      pushManager: {
        getSubscription: async () => subscribed,
        subscribe: async () => {
          subscribed = {
            endpoint: 'https://example.test/fake-endpoint',
            keys: { p256dh: 'fake-p256dh', auth: 'fake-auth' },
            unsubscribe: async () => { subscribed = null; return true; },
          };
          return subscribed;
        },
      },
    };
    Object.defineProperty(navigator.serviceWorker, 'ready', {
      get: () => Promise.resolve(fakeRegistration),
      configurable: true,
    });
  });
}

test.beforeEach(async ({ page }) => {
  await mockPushSupport(page);
  await gotoApp(page);
  await page.evaluate(() => localStorage.clear());
  await reloadApp(page);
});

test('el botón de recordatorios aparece cuando el navegador soporta push', async ({ page }) => {
  const btn = page.locator('#reminderBtn');
  await expect(btn).toBeVisible();
  await expect(btn).toHaveText('🔔 Activar recordatorios');
});

test('activar pide permiso de notificaciones y cambia el botón a Desactivar', async ({ page }) => {
  const btn = page.locator('#reminderBtn');
  await btn.click();
  await expect(btn).toHaveText('🔕 Desactivar recordatorios');
  await expect(page.locator('#reminderStatus')).toContainText('activados');
});

test('desactivar vuelve a mostrar Activar recordatorios', async ({ page }) => {
  const btn = page.locator('#reminderBtn');
  await btn.click();
  await expect(btn).toHaveText('🔕 Desactivar recordatorios');
  await btn.click();
  await expect(btn).toHaveText('🔔 Activar recordatorios');
  await expect(page.locator('#reminderStatus')).toHaveText('');
});
