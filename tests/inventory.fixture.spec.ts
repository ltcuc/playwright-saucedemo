import { expect } from "@playwright/test";
// FIX 1: Import 'test' đã tùy chỉnh từ auth-fixtures
import {
  test,
  inventoryPageFixture,
  loggedPage,
} from "./fixtures/auth-fixtures.ts";
// XÓA: import { LoginPage } và { InventoryPage } cũ
// XÓA: let loginPage: LoginPage;
// XÓA: let inventoryPage: InventoryPage;
// XÓA: TOÀN BỘ KHỐI test.beforeEach
test.describe("POM Inventory and Checkout Scenarios", () => {
  // Setup Hook: Initializes Page Objects and performs login before each test
  // ==============================================================================
  // --- TC_CART_001: Add to Cart and Verify Details ---
  // ==============================================================================
  // YÊU CẦU FIXTURES: inventoryPageFixture (Page Object) và loggedPage (đối tượng page)
  test("TC_CART_001: Should successfully add two products and verify cart details", async ({
    inventoryPageFixture,
    loggedPage,
  }) => {
    await test.step("1. Add two items to the cart", async () => {
      // USING INVENTORY METHOD: Add items using dynamic locators
      await inventoryPageFixture.addItemToCart("Sauce Labs Backpack");
      await inventoryPageFixture.addItemToCart("Sauce Labs Bolt T-Shirt");
    });
    await test.step("2. Verify the cart badge count and navigate", async () => {
      // ASSERTION: Kiểm tra badge giỏ hàng
      await expect(inventoryPageFixture.cartBadge).toHaveText("2");
      // Go to Cart page
      await inventoryPageFixture.cartLink.click();
      await expect(inventoryPageFixture.page).toHaveURL(
        "https://www.saucedemo.com/cart.html"
      );
    });
    await test.step("3. Verify list structure", async () => {
      // ASSERTION: Verify there are exactly 2 item containers in the cart list
      await expect(inventoryPageFixture.page.locator(".cart_item")).toHaveCount(
        2
      );
    });
    await test.step("4. Verify product details (Name, Quantity, Price, Description)", async () => {
      // USING ENCAPSULATED METHOD TO VERIFY ITEM DATA INTEGRITY
      await inventoryPageFixture.assertCartItemDetails();
    });
  });
});
