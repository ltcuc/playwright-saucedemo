import { Locator, Page, expect } from "@playwright/test";
export class LoginPage {
  // 1. PROPERTIES DECLARATION (readonly for type safety and stability)
  readonly page: Page;
  readonly usernameInput: Locator;
  readonly passwordInput: Locator;
  readonly loginButton: Locator;
  readonly menuButton: Locator; // New: Locator for the hamburger menu
  readonly logoutLink: Locator; // New: Locator for the Logout link
  readonly inventoryUrl: string = "https://www.saucedemo.com/inventory.html";
  readonly baseUrl: string = "https://www.saucedemo.com/";

  // 2. CONSTRUCTOR: Initializes Page object and defines all Locators
  constructor(page: Page) {
    this.page = page;
    // Define Locators using Playwright's Best Practices (getByRole)
    this.usernameInput = page.getByRole("textbox", { name: "Username" });
    this.passwordInput = page.getByRole("textbox", { name: "Password" });
    this.loginButton = page.getByRole("button", { name: "Login" });
    // Locators for Logout interaction
    this.menuButton = page.getByRole("button", { name: "Open Menu" });
    this.logoutLink = page.getByRole("link", { name: "Logout" });
  }
  // --- METHODS (Actions and Assertions) ---
  // 3. Method: Navigates to the Login page
  async goto() {
    await this.page.goto(this.baseUrl, { timeout: 60000 });
  }
  // 4. Method: Encapsulates the entire login action
  async login(username: string, password: string) {
    // Use Locators defined in the Constructor
    await this.goto();
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
  }
  // 5. Method: Encapsulates the entire logout action (NEW)
  async logout() {
    // 1. Click the side menu button
    await this.menuButton.click();
    // 2. Click the Logout link
    await this.logoutLink.click();
  }

  // 6. Method: Asserts the successful logged-in state
  async expectLoggedIn() {
    // ASSERTION 1: Verify URL redirection to the inventory page
    await expect(this.page).toHaveURL(this.inventoryUrl);
    // ASSERTION 2: Verify a key element ('Products' title) is visible
    await expect(this.page.getByText("Products")).toBeVisible();
  }
  // 7. Method: Asserts the successful logged-out state (NEW)
  async expectLoggedOut() {
    // Verify URL is back to the base URL
    await expect(this.page).toHaveURL(this.baseUrl);
    // Verify the login form is visible
    await expect(this.usernameInput).toBeVisible();
  }

  // Thêm Method resetAppState
  async resetAppState() {
    // FIX: BUỘC CHỜ một phần tử ổn định trên trang Inventory trước khi mở Menu
    await expect(this.page.getByText("Products")).toBeVisible({
      timeout: 10000,
    });
    const resetLink = this.page.locator("#reset_sidebar_link");
    // 1. Chờ Menu button sẵn sàng rồi mới click
    await this.menuButton.waitFor({ state: "visible" });
    await this.menuButton.click();
    // 2. Chờ Reset App State hiển thị rồi click
    await resetLink.waitFor({ state: "visible" });
    await resetLink.click();
    // 3. Đóng Menu (Tùy chọn) với timeout hợp lý
    await this.page.locator(".bm-cross-button").click({ timeout: 5000 });
  }
}
