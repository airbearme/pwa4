import { test, expect } from '@playwright/test';

test('map page should display the map container', async ({ page }) => {
  page.on('console', msg => console.log(msg.text()));
  await page.goto('http://localhost:5000/map');
  await page.screenshot({ path: 'test-results/map-page-failure.png' });
  const mapContainer = page.locator('[data-testid="map-container"]');
  await expect(mapContainer).toBeVisible({ timeout: 10000 });
});
