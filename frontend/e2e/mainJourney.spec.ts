import { test, expect } from '@playwright/test';

test.describe('EvolveAura Main User Journey E2E', () => {
  const timestamp = Date.now();
  const testUser = {
    email: `e2e_student_${timestamp}@example.com`,
    password: 'Password123!',
    name: 'E2E Hero',
  };

  test('Main Journey: Register -> Onboarding -> Assessment -> Report -> Choose Path -> Dashboard (Path Purity)', async ({ page }) => {
    // 1. Visit Register
    await page.goto('/register');
    await expect(page.locator('h1')).toContainText(/Create Account/i);

    // Fill registration form
    await page.fill('input[type="text"]', testUser.name);
    await page.fill('input[type="email"]', testUser.email);
    await page.fill('input[type="password"]', testUser.password);
    await page.click('button[type="submit"]');

    // Should navigate to onboarding or dashboard
    await page.waitForURL(/\/(onboarding|dashboard)/);

    // 2. Onboarding Flow
    if (page.url().includes('/onboarding')) {
      // Step 1: Persona
      await page.locator('button:has-text("Student / Aspirant")').click();
      await page.locator('button:has-text("Continue")').click();

      // Step 2: Primary Goal
      await page.locator('button:has-text("Deep Focus Mastery")').click();
      await page.locator('button:has-text("Continue")').click();

      // Step 3: Biggest Obstacle
      await page.locator('button:has-text("Social Media Doomscrolling")').click();
      await page.locator('button:has-text("Continue")').click();

      // Step 4: Smoke-Free Path Option (Answer 'No' to continue core flow)
      await page.locator('button:has-text("No, continue to EvolveAura")').click();

      await page.waitForURL(/\/assessment/);
    }

    // 3. 16-Question Assessment Flow
    if (page.url().includes('/assessment')) {
      await expect(page.locator('body')).toContainText(/Assessment/i);

      // Select option 3 or 4 for each question and click next until submit
      for (let i = 0; i < 16; i++) {
        const optionButtons = page.locator('button:has-text("Often"), button:has-text("Neutral"), button:has-text("Sometimes")');
        if (await optionButtons.count() > 0) {
          await optionButtons.first().click();
        }
        const nextButton = page.locator('button:has-text("Next"), button:has-text("Complete Assessment")');
        if (await nextButton.isVisible()) {
          await nextButton.click();
        }
      }

      // Wait for navigation to /report
      await page.waitForURL(/\/report/, { timeout: 30000 });
    }

    // 4. Report Page
    if (page.url().includes('/report')) {
      await expect(page.locator('body')).toContainText(/Aura Score|Suggested Path|Rank/i);
      const choosePathBtn = page.locator('a[href="/choose-path"], button:has-text("Choose Your Path")');
      await choosePathBtn.click();
      await page.waitForURL(/\/choose-path/);
    }

    // 5. Choose Path Page
    if (page.url().includes('/choose-path')) {
      // Choose Scholar Path
      const scholarCard = page.locator('button:has-text("Scholar"), div:has-text("Scholar")').first();
      await scholarCard.click();
      const confirmBtn = page.locator('button:has-text("Confirm"), button:has-text("Commit to Path")');
      if (await confirmBtn.isVisible()) {
        await confirmBtn.click();
      }

      await page.waitForURL(/\/dashboard/, { timeout: 30000 });
    }

    // 6. Dashboard - Verify Path Purity
    await expect(page.locator('body')).toContainText(/Scholar/i);
    // Quests should be scholar-aligned
    const questCards = page.locator('.glass-panel');
    await expect(questCards.first()).toBeVisible();
  });
});
