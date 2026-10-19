import { test, expect } from '@playwright/test';

test.describe('EvolveAura Smoke-Free Quit Path E2E', () => {
  const timestamp = Date.now();
  const testUser = {
    email: `quit_user_${timestamp}@example.com`,
    password: 'Password123!',
    name: 'Smoke Free Champion',
  };

  test('Smoke-Free Flow: Consent -> Screening -> Plan -> Check-in -> SOS', async ({ page }) => {
    // 1. Register user
    await page.goto('/register');
    await page.fill('input[type="text"]', testUser.name);
    await page.fill('input[type="email"]', testUser.email);
    await page.fill('input[type="password"]', testUser.password);
    await page.click('button[type="submit"]');

    // 2. Navigate to /quit
    await page.goto('/quit');
    await expect(page.locator('body')).toContainText(/Smoke-Free Path|Informed Consent/i);

    // 3. Consent Gate
    if (page.url().includes('/quit/start') || page.url().includes('/quit')) {
      const over18Checkbox = page.locator('input[type="checkbox"]').first();
      if (await over18Checkbox.isVisible()) {
        await over18Checkbox.check();
        const consentCheckbox = page.locator('input[type="checkbox"]').nth(1);
        if (await consentCheckbox.isVisible()) {
          await consentCheckbox.check();
        }
        await page.click('button:has-text("Begin Confidentially"), button:has-text("Continue")');
      }
    }

    // 4. Screening Assessment
    await page.waitForURL(/\/quit\/plan|\/quit\/start/, { timeout: 15000 });
    if (page.url().includes('/quit/start')) {
      // Complete screening steps if displayed
      const submitScreeningBtn = page.locator('button:has-text("Continue"), button:has-text("Next")');
      if (await submitScreeningBtn.isVisible()) {
        await submitScreeningBtn.click();
      }
    }

    // 5. Plan Customization
    await page.goto('/quit/plan');
    await expect(page.locator('body')).toContainText(/Quit Plan|Strategy/i);
    const savePlanBtn = page.locator('button:has-text("Save Plan"), button:has-text("Commit to Plan")');
    if (await savePlanBtn.isVisible()) {
      await savePlanBtn.click();
    }

    // 6. Daily Check-in
    await page.goto('/quit/checkin');
    await expect(page.locator('body')).toContainText(/Daily Check-in|Today's Check-in/i);
    const saveCheckinBtn = page.locator('button:has-text("Submit Check-in"), button:has-text("Save Check-in")');
    if (await saveCheckinBtn.isVisible()) {
      await saveCheckinBtn.click();
    }

    // 7. SOS Urge Surfing & Breathing Rescue
    await page.goto('/quit/sos');
    await expect(page.locator('body')).toContainText(/Urge Surfing|Breathe|Emergency/i);
    // Should display emergency helpline 1800-11-2356
    await expect(page.locator('body')).toContainText(/1800-11-2356/);

    // Verify 4-7-8 timer or calming instruction is active
    const startRescueBtn = page.locator('button:has-text("Start"), button:has-text("Breathe")');
    if (await startRescueBtn.isVisible()) {
      await startRescueBtn.click();
    }
  });
});
