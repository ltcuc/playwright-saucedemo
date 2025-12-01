import { Page, Locator, expect } from "@playwright/test";
export class InventoryPage {
  // 1. PROPERTIES DECLARATION
  readonly page: Page;
  // Locators for Navigation and Controls
  readonly cartLink: Locator;
  readonly cartBadge: Locator;
  readonly sortDropdown: Locator;
  readonly inventoryItems: Locator;
  readonly inventoryUrl: string = "https://www.saucedemo.com/inventory.html";
  // Locators for Assertions (First and Last items used for sorting checks)
  readonly firstItemName: Locator;
  readonly lastItemName: Locator;

  // 2. CONSTRUCTOR: Initializes Page object and defines Locators
  constructor(page: Page) {
    this.page = page;
    this.cartLink = page.locator('[data-test="shopping-cart-link"]');
    this.cartBadge = page.locator('[data-test="shopping-cart-badge"]');
    this.sortDropdown = page.locator('[data-test="product-sort-container"]');
    // OPTIMIZATION: Using a more specific locator for the list item container
    // this.inventoryItems = page.locator(".inventory-item");
    this.inventoryItems = page.locator('[data-test="inventory-item"]');
    // Define Locators for the first and last item names in the list
    this.firstItemName = page.locator(".inventory_item_name").first();
    this.lastItemName = page.locator(".inventory_item_name").last();
  }
  // --- METHODS (Actions and Assertions) ---
  // 3. Method: Encapsulates the Add to Cart action
  async addItemToCart(itemName: string) {
    // Create a dynamic locator based on the item name (e.g., 'Sauce Labs Backpack')
    // Use CSS selector targeting the specific data-test button
    const locatorString = `[data-test="add-to-cart-${itemName
      .toLowerCase()
      .replace(/ /g, "-")}"]`;
    await this.page.locator(locatorString).click();
  }
  // 4. Method: Encapsulates the product sorting action
  async sortProducts(value: "az" | "za" | "lohi" | "hilo") {
    // Use selectOption() to perform the action and assert the value changed
    await this.sortDropdown.selectOption(value);
    await expect(this.sortDropdown).toHaveValue(value);
  }
  // 5. Method: Asserts the sort order by Name (A-Z)
  async assertSortNameAZ() {
    // ASSERTION: Verify the first item is 'Sauce Labs Backpack' (Name A)
    await expect(this.firstItemName).toHaveText("Sauce Labs Backpack");
    // ASSERTION: Verify the last item is 'Test.allTheThings() T-Shirt (Red)' (Name Z)
    await expect(this.lastItemName).toHaveText(
      "Test.allTheThings() T-Shirt (Red)"
    );
  }
  // 6. Method: Asserts the sort order by Price (Low to High)
  async assertSortPriceLOHI() {
    // ASSERTION: Verify the first item is the cheapest
    await expect(this.firstItemName).toHaveText("Sauce Labs Onesie");
    // ASSERTION: Verify the last item is the most expensive
    await expect(this.lastItemName).toHaveText("Sauce Labs Fleece Jacket");
  }
  // 7. Method: Kiểm tra chi tiết các mục hàng trong giỏ hàng (Sau khi đã ở trang Cart)
  async assertCartItemDetails() {
    const cartItemByName = (name: string) =>
      this.page
        .locator('[data-test="inventory-item"]')
        .filter({
          has: this.page.locator('[data-test="inventory-item-name"]').filter({ hasText: name }),
        });
    // Define contextual locator for Backpack (The parent item container containing the name)
    const backpackItem = cartItemByName("Sauce Labs Backpack");
    // Khẳng định chi tiết Backpack
    await expect(backpackItem).toBeVisible();
    await expect(backpackItem.locator('[data-test="item-quantity"]').first()).toHaveText("1");
    await expect(
      backpackItem.locator('[data-test="inventory-item-price"]').first()
    ).toHaveText("$29.99");
    await expect(
      backpackItem.locator('[data-test="inventory-item-desc"]').first()
    ).toContainText("carry.allTheThings");
    // Define contextual locator for T-Shirt
    const tShirtItem = cartItemByName("Sauce Labs Bolt T-Shirt");
    // Khẳng định chi tiết T-Shirt
    await expect(tShirtItem).toBeVisible();
    await expect(tShirtItem.locator('[data-test="item-quantity"]').first()).toHaveText("1");
    await expect(tShirtItem.locator('[data-test="inventory-item-price"]').first()).toHaveText(
      "$15.99"
    );
    await expect(
      tShirtItem.locator('[data-test="inventory-item-desc"]').first()
    ).toContainText("Sauce Labs bolt T-shirt");
  }
}
