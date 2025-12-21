
import { test, expect } from '@playwright/test';

test.describe('AirBear Critical User Flows', () => {
    test.beforeEach(async ({ page }) => {
        // Go to home page
        await page.goto('/');
    });

    test('Homepage Validation', async ({ page }) => {
        await expect(page).toHaveTitle(/AirBear/i);

        // Check key visible elements
        await expect(page.getByTestId('img-mascot')).toBeVisible();
        await expect(page.getByText('Solar Powered Rideshare')).toBeVisible();

        // Verify Stats are present (even if loading)
        await expect(page.getByTestId('stat-rides')).toBeVisible();
        await expect(page.getByTestId('stat-co2')).toBeVisible();
    });

    test('Booking Flow Navigation', async ({ page }) => {
        // Click 'Book Your AirBear'
        const bookBtn = page.getByTestId('button-book-airbear');
        await expect(bookBtn).toBeVisible();
        await bookBtn.click();

        // Should navigate to Map
        await expect(page).toHaveURL(/.*\/map/);

        // Map page specific checks (assuming there is a map container or title)
        // Note: Leaflet might take a moment
        await expect(page.locator('.leaflet-container').or(page.getByText('Available AirBears'))).toBeVisible();
    });

    test('CEO T-Shirt Promo Interaction', async ({ page }) => {
        const promoBtn = page.getByTestId('button-ceo-tshirt');
        await expect(promoBtn).toBeVisible();

        // Open Dialog
        await promoBtn.click();

        // Check Dialog content
        await expect(page.getByText('CEO T-Shirt Promo')).toBeVisible();
        await expect(page.getByText('$100')).toBeVisible();

        // Close dialog (Escape or button)
        // await page.keyboard.press('Escape');
        // await expect(page.getByText('CEO T-Shirt Promo')).not.toBeVisible();
    });

    test('Auth Guard Protection', async ({ page }) => {
        // Try to go to dashboard directly
        await page.goto('/dashboard');

        // Should redirect to Auth page if not logged in
        // Or show Auth UI
        await expect(page).toHaveURL(/.*\/auth/);
        await expect(page.getByText('Sign In')).toBeVisible();
    });

    test('Footer Navigation', async ({ page }) => {
        // Scroll to bottom
        await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));

        // Check Privacy Policy link availability
        const privacyLink = page.getByText('Privacy Policy').first();
        await expect(privacyLink).toBeVisible();
        await privacyLink.click();

        await expect(page).toHaveURL(/.*\/privacy/);
        await expect(page.getByText('Privacy Policy')).toBeVisible();
    });
});
