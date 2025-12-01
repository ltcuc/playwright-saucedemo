import { test, expect } from "@playwright/test";
// BƯỚC 1: Import Class LoginPage
import { LoginPage } from "../pages/LoginPage.ts";
// Khai báo biến toàn cục để lưu trữ đối tượng LoginPage
let loginPage: LoginPage;
test.describe("POM Authentication (Login/Logout) Scenarios", () => {
  // BƯỚC 2: Khởi tạo Page Object trước mỗi Test Case
  test.beforeEach(async ({ page }) => {
    // Khởi tạo đối tượng LoginPage mới cho mỗi TC và liên kết với 'page' hiện tại
    loginPage = new LoginPage(page);
  });
  // ==============================================================================
  // --- TC_LOGIN_SUCCESS: User Login (Happy Path) ---
  // ==============================================================================
  test("TC_LOGIN_SUCCESS: Valid user can successfully login", async ({
    page,
  }) => {
    await test.step("1. Perform login action", async () => {
      // SỬ DỤNG METHOD ĐÃ ĐÓNG GÓI: Chỉ cần cung cấp dữ liệu
      await loginPage.login("standard_user", "secret_sauce");
    });
    await test.step("2. Verify successful navigation and content", async () => {
      // SỬ DỤNG METHOD ASSERTION TỪ PO
      await loginPage.expectLoggedIn();
    });
  });
  // ==============================================================================
  // --- TC_LOGOUT: Successful Logout Test Case ---
  // ==============================================================================
  test("TC_LOGOUT: User should be logged out and session terminated", async ({
    page,
  }) => {
    await test.step("1. Login and perform logout action", async () => {
      // Login: Gọi method login
      await loginPage.login("standard_user", "secret_sauce");
      // Logout: Gọi method logout
      await loginPage.logout();
      await loginPage.expectLoggedOut();
    });
  });
  // ==============================================================================
  // --- TC_LOGIN_FAILURE_LOCKED: Failed Login (LOCKED OUT) ---
  // ==============================================================================
  test("TC_LOGIN_FAILURE_LOCKED: Should show error message for locked out user", async ({
    page,
  }) => {
    const expectedErrorMessage =
      "Epic sadface: Sorry, this user has been locked out.";
    await test.step("1. Attempt to login with locked-out credentials", async () => {
      // SỬ DỤNG METHOD LOGIN
      await loginPage.login("locked_out_user", "secret_sauce");
    });
    await test.step("2. Verify the correct error message is displayed", async () => {
      await expect(page).toHaveURL(loginPage.baseUrl);
      // Khẳng định tin nhắn lỗi hiển thị đúng
      await expect(page.locator('[data-test="error"]')).toHaveText(
        expectedErrorMessage
      );
    });
  });
  // ==============================================================================
  // --- TC_LOGIN_FAILURE_INVALID: Login with invalid credentials ---
  // --- Uses completely incorrect credentials that Playwright is not aware of ---
  // ==============================================================================
  test("TC_LOGIN_FAILURE_INVALID: Should show error for invalid username/password", async ({
    page,
  }) => {
    const invalidUsername = "incorrect_user";
    const invalidPassword = "wrong_password";
    const expectedErrorMessage =
      "Epic sadface: Username and password do not match any user in this service";
    await test.step("1. Attempt to login with invalid credentials", async () => {
      await loginPage.login(invalidUsername, invalidPassword);
    });
    await test.step("2. Verify the correct error message is displayed and location", async () => {
      const errorMessageLocator = page.locator('[data-test="error"]');
      // ASSERTION 1: Check the error message is visible
      await expect(errorMessageLocator).toBeVisible();
      // ASSERTION 2: Check the error message content is accurate.
      await expect(errorMessageLocator).toHaveText(expectedErrorMessage);
      // ASSERTION 3: Verify the URL remains on the login page
      await expect(page).toHaveURL(loginPage.baseUrl);
    });
  });
});
