const { test, expect } = require('@playwright/test');
const { gotoApp, reloadApp } = require('./helpers');

test.beforeEach(async ({ page }) => {
  await gotoApp(page);
  await page.evaluate(() => localStorage.clear());
  await reloadApp(page);
  await page.getByRole('tab', { name: 'Biblioteca' }).click();
});

test('agregar, editar y borrar un ítem de biblioteca', async ({ page }) => {
  await page.locator('#libTitleInput').fill('Playlist test');
  await page.locator('#libUrlInput').fill('https://example.com/test');
  await page.locator('#libAddBtn').click();
  await expect(page.getByText('Playlist test')).toBeVisible();

  const row = page.locator('.lib-item', { hasText: 'Playlist test' });
  await row.locator('.lib-edit').click();
  await expect(page.locator('#libTitleInput')).toHaveValue('Playlist test');
  await page.locator('#libTitleInput').fill('Playlist editada');
  await page.locator('#libAddBtn').click();
  await expect(page.getByText('Playlist editada')).toBeVisible();

  page.once('dialog', (dialog) => dialog.accept());
  await page.locator('.lib-item', { hasText: 'Playlist editada' }).locator('.lib-del').click();
  await expect(page.getByText('Playlist editada')).not.toBeVisible();
});
