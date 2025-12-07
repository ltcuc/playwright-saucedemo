import { expect } from "@playwright/test";
// FIX 1: Import 'test' từ file Fixtures (loginPageFixture là fixture, không cần import riêng)
//import { test } from "./fixtures/auth-fixtures";
import { test, loginPageFixture } from "./fixtures/auth-fixtures.ts";
import { allLoginScenarios } from "../test-data/users.ts";
// SỬA LỖI: Xóa các imports và khai báo thừa
// import { LoginPage } from "../pages/LoginPage.ts"; // KHÔNG CẦN
// let loginPage: LoginPage; // KHÔNG CẦN

// ... (logic DDT ở dưới) ...

test.describe("Authentication Scenarios (Data-Driven)", () => {
  // FIX 2: XÓA HOÀN TOÀN KHỐI test.beforeEach
  // ... (Khối code TC_DDT_LOGIN_ALL) ...

  for (const scenario of allLoginScenarios) {
    // Dynamically create a user display name for the report (e.g., [EMPTY USERNAME])
    const usernameDisplay = scenario.username || "[EMPTY USERNAME]";
    // Define the status label (SUCCESS or FAILURE) for the test title
    const statusLabel = scenario.isSuccess ? " (SUCCESS)" : " (FAILURE)";
    // Create the unique test title using Template Literal
    const testName = `TC_DDT_LOGIN: Check login for user: ${usernameDisplay} ${statusLabel}`;
    // Define the dynamic Test Case
    // Định nghĩa Test Case mới trong vòng lặp
    test(testName, async ({ page, loginPageFixture }) => {
      await test.step(`1. Attempt login with: ${usernameDisplay}`, async () => {
        // --- Conditional Asynchronous Action ---
        if (scenario.isSuccess) {
          // SUCCESS PATH: Use Promise.all to wait for both the click and the navigation
          await Promise.all([
            page.waitForURL(loginPageFixture.inventoryUrl, { timeout: 55000 }),
            loginPageFixture.login(scenario.username, scenario.password),
          ]);
        } else {
          // FAILURE PATH: Only perform the login action (expecting no navigation)
          await loginPageFixture.login(scenario.username, scenario.password);
        }
      });

      await test.step("2. Verify final outcome (Success or Failure)", async () => {
        // BASIC ASSERTION: Verify the resulting URL matches the expected URL
        await expect(loginPageFixture.page).toHaveURL(scenario.expectedUrl);
        // --- LOGIC BRANCHING ---
        if (scenario.isSuccess) {
          // SCENARIO A: SUCCESSFUL LOGIN
          await loginPageFixture.expectLoggedIn();
          // OPTIMIZATION: Logout immediately after successful test completion
          await loginPageFixture.logout();
          await loginPageFixture.expectLoggedOut();
        } else {
          // SCENARIO B: FAILED LOGIN (NEGATIVE PATH)
          const errorMessageLocator = loginPageFixture.page.locator(
            '[data-test="error"]'
          );
          // Assert error message visibility and content
          await expect(errorMessageLocator).toBeVisible();
          await expect(errorMessageLocator).toHaveText(scenario.errorMessage!);
          // Assert the user remains in the logged-out state
          await loginPageFixture.expectLoggedOut();
        }
      });
    });
  }
});
