import { test, expect } from "@playwright/test";
import { LoginPage } from "../pages/LoginPage.ts"; // Import Page Object cho Login
import { InventoryPage } from "../pages/InventoryPage"; // Import Page Object cho Inventory
let loginPage: LoginPage;
let inventoryPage: InventoryPage;
test.describe("POM Inventory and Checkout Scenarios", () => {
  // Setup Hook: Initializes Page Objects and performs login before each test
  test.beforeEach(
    async ({ page }) => {
      // Khởi tạo cả hai Page Objects
      loginPage = new LoginPage(page);
      inventoryPage = new InventoryPage(page);
      // PRE-CONDITION: Đăng nhập thành công (Sử dụng LoginPage method)
      await loginPage.login("standard_user", "secret_sauce");
      await loginPage.expectLoggedIn();
    },
    { timeout: 60000 } // <<< FIX: Tăng timeout cho toàn bộ khối trước khi chạy TC
  );
  // ==============================================================================
  // --- TC_CART_001: Add to Cart and Verify Details ---
  // ==============================================================================
  test("TC_CART_001: Should successfully add two products and verify cart details", async () => {
    await test.step("1. Add two items to the cart", async () => {
      // USING INVENTORY METHOD: Add items using dynamic locators
      await inventoryPage.addItemToCart("Sauce Labs Backpack");
      await inventoryPage.addItemToCart("Sauce Labs Bolt T-Shirt");
    });
    await test.step("2. Verify the cart badge count and navigate", async () => {
      // ASSERTION: Kiểm tra badge giỏ hàng
      await expect(inventoryPage.cartBadge).toHaveText("2");
      // Go to Cart page
      await inventoryPage.cartLink.click();
      await expect(inventoryPage.page).toHaveURL(
        "https://www.saucedemo.com/cart.html"
      );
    });
    await test.step("3. Verify list structure", async () => {
      // ASSERTION: Verify there are exactly 2 item containers in the cart list
      await expect(inventoryPage.page.locator(".cart_item")).toHaveCount(2);
    });
    await test.step("4. Verify product details (Name, Quantity, Price, Description)", async () => {
      // USING ENCAPSULATED METHOD TO VERIFY ITEM DATA INTEGRITY
      await inventoryPage.assertCartItemDetails();
    });
  });
});
