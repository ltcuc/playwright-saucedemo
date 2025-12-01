import { test, expect, Page } from "@playwright/test";
// =====================================================================================
// --- GLOBAL HELPER FUNCTION ---
// --- This function is reusable across all test files (if imported). ---
// =====================================================================================
async function performLogin(page: Page, username: string, password: string) {
  // Note: The URL is hardcoded here, but could also be passed as a parameter.
  await page.goto("https://www.saucedemo.com/");
  await page.getByRole("textbox", { name: "Username" }).fill(username);
  await page.getByRole("textbox", { name: "Password" }).fill(password);
  await page.getByRole("button", { name: "Login" }).click();
}

// Grouping all test cases related to Authentication (Login) Scenarios
test.describe("Authentication (Login) Scenarios", () => {
  // ==============================================================================
  // --- TC_LOGIN_SUCCESS: Successful Login Test Case ---
  // ==============================================================================
  test("TC_LOGIN_SUCCESS: User can login with valid credentials", async ({
    page,
  }) => {
    await test.step("1. Perform login and verify URL navigation", async () => {
      // Use Helper Function
      await performLogin(page, "standard_user", "secret_sauce");

      // ASSERTION 1: Check URL has changed to inventory page
      await expect(page).toHaveURL("https://www.saucedemo.com/inventory.html");
    });

    await test.step("2. Check the 'Products' title is visible", async () => {
      // ASSERTION 2: Check the 'Products' title is visible
      await expect(page.getByText("Products")).toBeVisible();
    });
  });
  // ==============================================================================
  // --- TC_LOGOUT: Successful Logout Test Case ---
  // --- Reuses the login logic to establish the session ---
  // ==============================================================================
  test("TC_LOGOUT: User should be logged out and redirected to login page", async ({
    page,
  }) => {
    await test.step("1. Login and perform logout action", async () => {
      // Use Helper Function to establish session
      await performLogin(page, "standard_user", "secret_sauce");
      // 1. Click Menu button
      await page.getByRole("button", { name: "Open Menu" }).click();
      // 2. Click Logout Link
      await page.getByRole("link", { name: "Logout" }).click();
    });
    await test.step("2. Verify successful redirection and session termination", async () => {
      // ASSERTION 1: Verify the URL is redirected back to the login page
      await expect(page).toHaveURL("https://www.saucedemo.com/");
      // ASSERTION 2: Verify the login form fields are visible (Login check)
      await expect(
        page.getByRole("textbox", { name: "Username" })
      ).toBeVisible();
      // ASSERTION 3 (Session Check): Try to access Inventory and verify redirect
      await page.goto("https://www.saucedemo.com/inventory.html");
      await expect(page).toHaveURL("https://www.saucedemo.com/");
    });
  });

  // ==============================================================================
  // --- TC_LOGIN_FAILURE: Failed Login Test Case (Locked Out User) ---
  // ==============================================================================
  test("TC_LOGIN_FAILURE: Should show error message for locked out user", async ({
    page,
  }) => {
    await test.step("1. Navigate to Login Page and attempt to login with a locked-out user", async () => {
      // Use Helper Function with locked_out credentials
      await performLogin(page, "locked_out_user", "secret_sauce");
      // Click Login button
      await page.getByRole("button", { name: "Login" }).click();
    });
    await test.step("2. Verify the correct error message is displayed", async () => {
      // Locate the error message element.
      const errorMessageLocator = page.locator('[data-test="error"]');
      // ASSERTION 1: Check the error message is visible
      await expect(errorMessageLocator).toBeVisible();
      // ASSERTION 2:Expected error content for locked-out user
      await expect(errorMessageLocator).toContainText(
        "Epic sadface: Sorry, this user has been locked out."
      );
      // ASSERTION 3: Verify the URL remains on the login page
      await expect(page).toHaveURL("https://www.saucedemo.com/");
    });
  });
  // ==============================================================================
  // --- TC_LOGIN_FAILURE_INVALID: Login with invalid credentials ---
  // ==============================================================================
  test("TC_LOGIN_FAILURE_INVALID: Should show error for invalid username/password", async ({
    page,
  }) => {
    await test.step("1. Navigate to Login Page and attempt to login with problem_user", async () => {
      // Use Helper Function with invalid credentials
      await performLogin(page, "problem_user", "wrong_password");
      await page.getByRole("button", { name: "Login" }).click();
    });
    await test.step("2. Verify the correct error message is displayed", async () => {
      const errorMessageLocator = page.locator('[data-test="error"]');
      // ASSERTION 1: Check the error message is visible
      await expect(errorMessageLocator).toBeVisible();
      // ASSERTION 2:Expected error content for invalid user name/password
      await expect(errorMessageLocator).toHaveText(
        "Epic sadface: Username and password do not match any user in this service"
      );
      // ASSERTION 3: Verify the URL remains on the login page
      await expect(page).toHaveURL("https://www.saucedemo.com/");
    });
  });
});
