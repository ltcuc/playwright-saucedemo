import { test, expect } from "@playwright/test";
import { LoginPage } from "../pages/LoginPage.ts";
// Import array of scenarios from external data file
import { allLoginScenarios } from "../test-data/users.ts";
// Global variable for the Page Object
let loginPage: LoginPage;

test.describe("Authentication Scenarios (Data-Driven)", () => {
  test.beforeEach(async ({ page }) => {
    // SETUP HOOK: Initialize Page Object before each test execution
    loginPage = new LoginPage(page);
  });

  // ==============================================================================
  // --- DATA-DRIVEN TESTING BLOCK (Using FOR...OF) ---
  // This loop dynamically creates one test() for each scenario in the array.
  // ==============================================================================

  // Iterate through the array of all login scenarios
  for (const scenario of allLoginScenarios) {
    // Dynamically create a user display name for the report (e.g., [EMPTY USERNAME])
    const usernameDisplay = scenario.username || "[EMPTY USERNAME]";
    // Define the status label (SUCCESS or FAILURE) for the test title
    const statusLabel = scenario.isSuccess ? " (SUCCESS)" : " (FAILURE)";
    // Create the unique test title using Template Literal
    const testName = `TC_DDT_LOGIN: Check login for user: ${usernameDisplay} ${statusLabel}`;
    // Define the dynamic Test Case
    test(testName, async ({ page }) => {
      await test.step(`1. Attempt login with: ${usernameDisplay}`, async () => {
        // --- Conditional Asynchronous Action ---
        if (scenario.isSuccess) {
          // SUCCESS PATH: Use Promise.all to wait for both the click and the navigation
          await Promise.all([
            page.waitForURL(loginPage.inventoryUrl, { timeout: 55000 }),
            loginPage.login(scenario.username, scenario.password),
          ]);
        } else {
          // FAILURE PATH: Only perform the login action (expecting no navigation)
          await loginPage.login(scenario.username, scenario.password);
        }
      });

      await test.step("2. Verify final outcome (Success or Failure)", async () => {
        // BASIC ASSERTION: Verify the resulting URL matches the expected URL
        await expect(loginPage.page).toHaveURL(scenario.expectedUrl);
        // --- LOGIC BRANCHING ---
        if (scenario.isSuccess) {
          // SCENARIO A: SUCCESSFUL LOGIN
          await loginPage.expectLoggedIn();
          // OPTIMIZATION: Logout immediately after successful test completion
          await loginPage.logout();
          await loginPage.expectLoggedOut();
        } else {
          // SCENARIO B: FAILED LOGIN (NEGATIVE PATH)
          const errorMessageLocator = loginPage.page.locator(
            '[data-test="error"]'
          );
          // Assert error message visibility and content
          await expect(errorMessageLocator).toBeVisible();
          await expect(errorMessageLocator).toHaveText(scenario.errorMessage!);
          // Assert the user remains in the logged-out state
          await loginPage.expectLoggedOut();
        }
      });
    });
  }
});
