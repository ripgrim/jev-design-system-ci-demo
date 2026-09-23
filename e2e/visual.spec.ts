import { expect, test } from '@playwright/test';

test('people page matches the design system', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'People' })).toBeVisible();
  await expect(page).toHaveScreenshot('people.png');
});

test('archive dialog matches the design system', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Policies', exact: true }).click();
  await page.getByRole('button', { name: 'Archive', exact: true }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await expect(page).toHaveScreenshot('archive-dialog.png');
});

test('access dialog matches the design system', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: "Change Jordan's access" }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await expect(page).toHaveScreenshot('access-dialog.png');
  await page.getByTestId('access-confirm').click();
  await expect(page.getByText('Disabled')).toBeVisible();
});

test('dialog close controls and action spacing work', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Add user' }).click();
  await page.getByRole('button', { name: 'Close', exact: true }).click();
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await page.getByRole('button', { name: 'Add user' }).click();
  await page.locator('[data-slot="dialog-overlay"]').click({ position: { x: 5, y: 5 } });
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await page.getByRole('button', { name: 'Policies', exact: true }).click();
  await page.getByRole('button', { name: 'Archive', exact: true }).click();
  expect(await page.getByTestId('archive-confirm').evaluate((element) => parseFloat(getComputedStyle(element.parentElement!).gap))).toBeGreaterThanOrEqual(8);
  expect(await page.getByRole('button', { name: 'Keep policy' }).evaluate((element) => parseFloat(getComputedStyle(element).height))).toBeGreaterThanOrEqual(32);
  expect(await page.getByTestId('archive-confirm').evaluate((element) => parseFloat(getComputedStyle(element).height))).toBeGreaterThanOrEqual(32);
});
