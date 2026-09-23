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
  await expect(page.getByTestId('archive-confirm')).toHaveAttribute('data-variant', 'danger');
  await expect(page).toHaveScreenshot('archive-dialog.png');
});

test('dialog close controls and action spacing work', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Add user' }).click();
  await page.getByRole('button', { name: 'Close dialog' }).click();
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await page.getByRole('button', { name: 'Add user' }).click();
  await page.getByTestId('dialog-backdrop').click({ position: { x: 5, y: 5 } });
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await page.getByRole('button', { name: 'Policies', exact: true }).click();
  await page.getByRole('button', { name: 'Archive', exact: true }).click();
  const keep = await page.getByRole('button', { name: 'Keep policy' }).boundingBox();
  const archive = await page.getByTestId('archive-confirm').boundingBox();
  expect(keep && archive).toBeTruthy();
  expect(archive!.x - (keep!.x + keep!.width)).toBeGreaterThanOrEqual(8);
  expect(keep!.height).toBeGreaterThanOrEqual(34);
  expect(archive!.height).toBeGreaterThanOrEqual(34);
});
