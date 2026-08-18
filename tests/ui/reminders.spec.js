const { test, expect } = require('@playwright/test');
const { gotoApp, reloadApp } = require('./helpers');

// Mockeamos Notification.requestPermission, navigator.serviceWorker.ready y
// la respuesta del Worker para no depender de un push service real
// (Google/Apple) ni de nuestro Worker de Cloudflare en producción — estos
// tests solo verifican la UI del botón, no el envío real de push (eso se
// verifica a mano, ver README).
async function setup(page, { permission = 'granted', subscribeStatus = 204 } = {}){
  await page.route(/rutina-veronica-push\.gustavopaine\.workers\.dev\/subscribe/, (route) =>
    route.fulfill({ status: subscribeStatus, body: '' })
  );
  await page.route(/rutina-veronica-push\.gustavopaine\.workers\.dev\/unsubscribe/, (route) =>
    route.fulfill({ status: 204, body: '' })
  );
  await page.addInitScript(({ permission }) => {
    Object.defineProperty(window.Notification, 'requestPermission', {
      value: async () => permission,
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
  }, { permission });

  await gotoApp(page);
  await page.evaluate(() => localStorage.clear());
  await reloadApp(page);
}

test('el botón de recordatorios aparece cuando el navegador soporta push', async ({ page }) => {
  await setup(page);
  const btn = page.locator('#reminderBtn');
  await expect(btn).toBeVisible();
  await expect(btn).toHaveText('🔔 Activar recordatorios');
});

test('activar pide permiso de notificaciones y cambia el botón a Desactivar', async ({ page }) => {
  await setup(page);
  const btn = page.locator('#reminderBtn');
  await btn.click();
  await expect(btn).toHaveText('🔕 Desactivar recordatorios');
  await expect(page.locator('#reminderStatus')).toContainText('activados');
});

test('desactivar vuelve a mostrar Activar recordatorios', async ({ page }) => {
  await setup(page);
  const btn = page.locator('#reminderBtn');
  await btn.click();
  await expect(btn).toHaveText('🔕 Desactivar recordatorios');
  await btn.click();
  await expect(btn).toHaveText('🔔 Activar recordatorios');
  await expect(page.locator('#reminderStatus')).toHaveText('');
});

test('negar el permiso de notificaciones deja el aviso visible, sin pisarlo', async ({ page }) => {
  await setup(page, { permission: 'denied' });
  const btn = page.locator('#reminderBtn');
  await btn.click();
  await expect(btn).toHaveText('🔔 Activar recordatorios');
  await expect(page.locator('#reminderStatus')).toContainText('falta el permiso');
});

test('si el servidor rechaza la suscripción, avisa y no queda como activado', async ({ page }) => {
  await setup(page, { subscribeStatus: 500 });
  const btn = page.locator('#reminderBtn');
  await btn.click();
  await expect(btn).toHaveText('🔔 Activar recordatorios');
  await expect(page.locator('#reminderStatus')).toContainText('no respondió');
});
