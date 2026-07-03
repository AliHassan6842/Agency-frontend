import { test, expect } from '@playwright/test';

test('landing page loads correctly', async ({ page }) => {
  // Go to the base URL (which is http://localhost:3001 as configured)
  await page.goto('/');

  // Expect the page to have a title that relates to the app
  // This is a basic smoke test to ensure the dev server is alive
  await expect(page).toHaveTitle(/./);
});
