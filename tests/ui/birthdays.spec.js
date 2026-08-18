const { test, expect } = require('@playwright/test');
const { gotoApp, reloadApp } = require('./helpers');

test.beforeEach(async ({ page }) => {
  await gotoApp(page);
  await page.evaluate(() => localStorage.clear());
  await reloadApp(page);
  await page.getByRole('tab', { name: '🎂 Cumples' }).click();
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
