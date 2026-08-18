const { test, expect } = require('@playwright/test');
const { gotoApp, reloadApp } = require('./helpers');

test.beforeEach(async ({ page }) => {
  await gotoApp(page);
  await page.evaluate(() => localStorage.clear());
  await reloadApp(page);
});

test('agregar, editar, tildar y borrar una tarea mantiene el checklist sincronizado', async ({ page }) => {
  const progLabel = page.locator('#progLabel');
  const initialTotal = Number((await progLabel.textContent()).split('/')[1]);

  await page.locator('.block-add-btn').first().click();
  await page.locator('.item-add-text').fill('Tarea de test');
  await page.locator('.item-add-emoji').fill('🧪');
  await page.locator('.item-edit-form .item-edit-save').click();

  await expect(page.getByText('Tarea de test')).toBeVisible();
  await expect(progLabel).toHaveText(`0/${initialTotal + 1}`);

  const newItem = page.locator('.item', { hasText: 'Tarea de test' });
  // Clickeamos el ícono visible, no el <input> oculto (ver checklist.spec.js).
  await newItem.locator('.checkbox').click();
  await expect(progLabel).toHaveText(`1/${initialTotal + 1}`);

  await newItem.locator('.item-edit-btn').click();
  const editForm = page.locator('.item-edit-form');
  await editForm.locator('.item-edit-text').fill('Tarea editada');
  await editForm.locator('.item-edit-save').click();

  const editedItem = page.locator('.item', { hasText: 'Tarea editada' });
  await expect(editedItem).toBeVisible();
  await expect(editedItem).toHaveClass(/done/); // el tilde sobrevive a la edición

  page.once('dialog', (dialog) => dialog.accept());
  await editedItem.locator('.item-del-btn').click();
  await expect(page.getByText('Tarea editada')).not.toBeVisible();
  await expect(progLabel).toHaveText(`0/${initialTotal}`);
});
