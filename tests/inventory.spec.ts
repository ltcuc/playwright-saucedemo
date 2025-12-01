import { test, expect, Page } from "@playwright/test";
// --- HELPER FUNCTION: Add specific items to the cart ---
async function addTwoItemsToCart(page: Page) {
  // Use sequential clicks for stability
  await page.locator('[data-test="add-to-cart-sauce-labs-backpack"]').click();
  await page
    .locator('[data-test="add-to-cart-sauce-labs-bolt-t-shirt"]')
    .click();
}

//Grouping all test cases related to the Shopping Cart and Inventory feature.
test.describe("Shopping Cart and Inventory Tests", () => {
  // Set up the pre-condition: Login before each test case in this block.
  test.beforeEach(
    async ({ page }) => {
      // Navigate to the login page and perform login actions
      await page.goto("https://www.saucedemo.com/");
      await page
        .getByRole("textbox", { name: "Username" })
        .fill("standard_user");
      await page
        .getByRole("textbox", { name: "Password" })
        .fill("secret_sauce");
      await page.getByRole("button", { name: "Login" }).click();
      // Assertion to ensure login precondition was successful
      await expect(page).toHaveURL("https://www.saucedemo.com/inventory.html");
    },
    { timeout: 60000 }
  );
  // Test Case: Add two specific products and verify the cart count.
  test("TC_CART_001: Should successfully add two products and verify cart count", async ({
    page,
  }) => {
    // Use test.step() to clearly define execution blocks in the report
    // 1. Add two items to the cart (Using Helper Function)
    await test.step("1. Add two items to the cart", async () => {
      await addTwoItemsToCart(page);
    });
    await test.step("2. Verify the cart badge count", async () => {
      // Check the small shopping cart badge displays '2'
      await expect(
        page.locator('[data-test="shopping-cart-badge"]')
      ).toHaveText("2");
    });
    await test.step("3. Navigate to the Cart page and verify items", async () => {
      // Go to the Cart page
      await page.locator('[data-test="shopping-cart-link"]').click();

      // ASSERTION: Verify the URL confirms navigation to the cart page
      await expect(page).toHaveURL("https://www.saucedemo.com/cart.html");

      // ASSERTION: Verify there are exactly 2 item containers in the cart list
      await expect(page.locator(".cart_item")).toHaveCount(2);
    });
    // 4. Verify product details (Name, Quantity, Price, Description)

    await test.step("4. Verify details of the added products", async () => {
      // --- VERIFY SAUCE LABS BACKPACK ---

      // ASSERTIONS for Backpack
      // Define contextual locator for Backpack (The parent item container containing the name)
      const backpackItem = page.locator(".cart_item", {
        hasText: "Sauce Labs Backpack",
      });
      await expect(backpackItem).toBeVisible();
      await expect(
        backpackItem.locator('[data-test="item-quantity"]')
      ).toHaveText("1");
      await expect(
        backpackItem.locator('[data-test="inventory-item-price"]')
      ).toHaveText("$29.99");
      await expect(
        backpackItem.locator('[data-test="inventory-item-desc"]')
      ).toContainText("carry.allTheThings()");

      // ASSERTIONS for T-Shirt
      const tShirtItem = page.locator(".cart_item", {
        hasText: "Sauce Labs Bolt T-Shirt",
      });
      await expect(tShirtItem).toBeVisible();
      await expect(
        tShirtItem.locator('[data-test="item-quantity"]')
      ).toHaveText("1");
      await expect(
        tShirtItem.locator('[data-test="inventory-item-price"]')
      ).toHaveText("$15.99");
      await expect(
        tShirtItem.locator('[data-test="inventory-item-desc"]')
      ).toContainText("Sauce Labs bolt T-shirt");
    });
  });

  // ----------------------------------------------------------------------------------------------------------------------
  // --- NEW TEST CASE: TC_CHECKOUT_001 ---
  // ----------------------------------------------------------------------------------------------------------------------
  test("TC_CHECKOUT_001: User should be able to complete a purchase", async ({
    page,
  }) => {
    // PRE-CONDITION SETUP: Since this TC starts from the inventory page (due to beforeEach),
    // we must add items to the cart first, then proceed to checkout.
    await test.step("1. Add items to cart and navigate to Checkout", async () => {
      // Add items to the cart
      await addTwoItemsToCart(page);
      // Go to Cart page
      await page.locator('[data-test="shopping-cart-link"]').click();
      // Click Checkout button
      await page.getByRole("button", { name: "Checkout" }).click();
      // ASSERTION: Verify URL is checkout step one
      await expect(page).toHaveURL(
        "https://www.saucedemo.com/checkout-step-one.html"
      );
    });
    await test.step("2. Fill out customer information form", async () => {
      await page.getByRole("textbox", { name: "First Name" }).fill("Tester");
      await page.getByRole("textbox", { name: "Last Name" }).fill("Automation");
      await page
        .getByRole("textbox", { name: "Zip/Postal Code" })
        .fill("70000");
      // Click Continue
      await page.getByRole("button", { name: "Continue" }).click();
      // ASSERTION: Verify navigation to checkout step two
      await expect(page).toHaveURL(
        "https://www.saucedemo.com/checkout-step-two.html"
      );
    });
    await test.step("3. Verify order summary (Overview Page)", async () => {
      // --- ASSERTION: Verify title page ---
      await expect(page.getByText("Checkout: Overview")).toBeVisible();
      // --- ASSERTION :Verify product information ---
      // 1. Verify Sauce Labs Backpack
      const backpackItem = page.locator(".cart_item", {
        hasText: "Sauce Labs Backpack",
      });
      await expect(
        backpackItem.locator('[data-test="inventory-item-name"]')
      ).toHaveText("Sauce Labs Backpack");
      await expect(
        backpackItem.locator('[data-test="item-quantity"]')
      ).toHaveText("1");
      await expect(
        backpackItem.locator('[data-test="inventory-item-price"]')
      ).toHaveText("$29.99");
      await expect(
        backpackItem.locator('[data-test="inventory-item-desc"]')
      ).toContainText("carry.allTheThings");

      // 2. Verify Sauce Labs Bolt T-Shirt
      const tShirtItem = page.locator(".cart_item", {
        hasText: "Sauce Labs Bolt T-Shirt",
      });
      await expect(
        tShirtItem.locator('[data-test="inventory-item-name"]')
      ).toHaveText("Sauce Labs Bolt T-Shirt");
      await expect(
        tShirtItem.locator('[data-test="inventory-item-desc"]')
      ).toContainText("Get your testing superhero");
      await expect(
        tShirtItem.locator('[data-test="inventory-item-price"]')
      ).toHaveText("$15.99");
      await expect(
        tShirtItem.locator('[data-test="item-quantity"]')
      ).toHaveText("1");

      // --- ASSERTION Verify other information---
      // ASSERTION: Verify Payment Information is displayed
      await expect(page.locator('[data-test="payment-info-value"]')).toHaveText(
        "SauceCard #31337"
      );
      // ASSERTION: Verify Shipping Information is displayed
      await expect(
        page.locator('[data-test="shipping-info-label"]')
      ).toHaveText("Shipping Information:");
      await expect(
        page.locator('[data-test="shipping-info-value"]')
      ).toHaveText("Free Pony Express Delivery!");
      await expect(page.locator('[data-test="total-info-label"]')).toHaveText(
        "Price Total"
      );
      // ASSERTION: Verify the Subtotal calculation (29.99 + 15.99 = 45.98)
      await expect(page.locator('[data-test="subtotal-label"]')).toHaveText(
        "Item total: $45.98"
      );
      // ASSERTION: Verify the Tax calculation (Tax: 3.68)
      await expect(page.locator('[data-test="tax-label"]')).toHaveText(
        "Tax: $3.68"
      );
      // ASSERTION: Verify the Total calculation (45.98 + 3.68 = 49.66)
      await expect(page.locator('[data-test="total-label"]')).toHaveText(
        "Total: $49.66"
      );

      // Click Finish (Complete the purchase)
      await page.getByRole("button", { name: "Finish" }).click();
      await expect(page).toHaveURL(
        "https://www.saucedemo.com/checkout-complete.html"
      );
    });
  });
  // --- TC_SORT_001: NAME (A to Z) -default ---
  // Define the locator for the Sort Dropdown once
  const sortDropdown = '[data-test="product-sort-container"]';
  test("TC_SORT_001: Should display products sorted by Name (A to Z) by default", async ({
    page,
  }) => {
    await test.step("1. Verify the default sorting option is 'Name (A to Z)'", async () => {
      await expect(page.locator(sortDropdown)).toHaveValue("az");
    });
    await test.step("2. Verify product order is Name (A to Z)", async () => {
      // ASSERTION: // Check the first item (A) is 'Sauce Labs Backpack'
      const firstItemName = page.locator(".inventory_item_name").first();
      await expect(firstItemName).toHaveText("Sauce Labs Backpack");
      // ASSERTION: // Check the last item (Z) is 'Test.allTheThings() T-Shirt (Red)'
      const lastItemName = page.locator(".inventory_item_name").last();
      await expect(lastItemName).toHaveText(
        "Test.allTheThings() T-Shirt (Red)"
      );
    });
    await test.step("3. Re-select 'Name (A to Z)' for explicit verification", async () => {
      await page.locator(sortDropdown).selectOption("az");
      await expect(page.locator(sortDropdown)).toHaveValue("az");
    });
  });
  // --- TC_SORT_002: NAME (Z to A) ---
  test("TC_SORT_002: Should display products sorted by Name (Z to A)", async ({
    page,
  }) => {
    const sortDropdown = page.locator("[data-test=product-sort-container]");
    await test.step("1. Select sorting by Name (Z to A)", async () => {
      await sortDropdown.selectOption("za");
      await expect(sortDropdown).toHaveValue("za");
    });
    await test.step("2. Verify product order is Name (Z to A)", async () => {
      // Check the first item (Z)
      const firstItemName = page.locator(".inventory_item_name").first();
      await expect(firstItemName).toHaveText(
        "Test.allTheThings() T-Shirt (Red)"
      );
      // Check the last item (A)
      const lastItemName = page.locator(".inventory_item_name").last();
      await expect(lastItemName).toHaveText("Sauce Labs Backpack");
    });
  });
  // --- TC_SORT_003: PRICE (Low to High) ---
  test("TC_SORT_003: Should sort products correctly by Price (low to high)", async ({
    page,
  }) => {
    const sortDropdown = page.locator("[data-test=product-sort-container]");
    await test.step("1. Select sorting by Price (low to high)", async () => {
      // ACTION: Select the 'lohi' value
      await sortDropdown.selectOption("lohi");
      await expect(sortDropdown).toHaveValue("lohi");
    });
    await test.step("2. Verify product order is Price (low to high)", async () => {
      // Check the first item (Cheapest: $7.99)
      const firstItemName = page.locator(".inventory_item_name").first();
      await expect(firstItemName).toHaveText("Sauce Labs Onesie");
      // Check the last item (Most Expensive: $49.99)
      const lastItemName = page.locator(".inventory_item_name").last();
      await expect(lastItemName).toHaveText("Sauce Labs Fleece Jacket");
    });
  });
  // --- TC_SORT_004: PRICE (High to Low) ---
  test("TC_SORT_004: Should sort products correctly by Price (high to low)", async ({
    page,
  }) => {
    const sortDropdown = page.locator("[data-test=product-sort-container]");
    await test.step("1. Select sorting by Price (high to low)", async () => {
      // ACTION: Select the 'hilo' value
      await sortDropdown.selectOption("hilo");
      await expect(sortDropdown).toHaveValue("hilo");
    });
    await test.step("2. Verify product order is Price (high to low)", async () => {
      // Check the first item (Most Expensive: $49.99)
      const firstItemName = page.locator(".inventory_item_name").first();
      await expect(firstItemName).toHaveText("Sauce Labs Fleece Jacket");

      // Check the last item (Cheapest: $7.99)
      const lastItemName = page.locator(".inventory_item_name").last();
      await expect(lastItemName).toHaveText("Sauce Labs Onesie");
    });
  });
  // ----------------------------------------------------------------------------------------------------------------------
  // --- NEW TEST CASE: TC_CHECKOUT_ERROR_001 ---
  // -------------------------------------------------------------------------------
  test("TC_CHECKOUT_ERROR_001: Should show error when required First Name field is empty", async ({
    page,
  }) => {
    await test.step("Add items and navigate to Checkout Information Form", async () => {
      // 1. Add items to cart (using Helper Function)
      await addTwoItemsToCart(page);
      // 2. Go to Cart page
      await page.locator('[data-test="shopping-cart-link"]').click();
      // 3. Click Checkout button
      await page.getByRole("button", { name: "Checkout" }).click();
      // ASSERTION: Verify URL is checkout step one
      await expect(page).toHaveURL(
        "https://www.saucedemo.com/checkout-step-one.html"
      );
    });
    await test.step("2. Attempt to continue with First Name field empty", async () => {
      // 1.  First Name field leaves blank
      // 2. Fill Last Name and Zip Code
      await page.getByRole("textbox", { name: "Last Name" }).fill("Automation");
      await page
        .getByRole("textbox", { name: "Zip/Postal Code" })
        .fill("70000");
      // 3. Click Continue button
      await page.getByRole("button", { name: "Continue" }).click();
    });
    await test.step("3. Verify the validation error message is displayed", async () => {
      await expect(page.locator('[data-test="error"]')).toHaveText(
        "Error: First Name is required"
      );
    });
  });
  test("TC_CHECKOUT_ERROR_002: Should show error when required Last Name field is empty", async ({
    page,
  }) => {
    await test.step("1. Add items and navigate to Checkout Information Form", async () => {
      // 1. Add items to cart (using Helper Function)
      await addTwoItemsToCart(page);
      // 2. Go to Cart page
      await page.locator('[data-test="shopping-cart-link"]').click();
      //3. Click Checkout button
      await page.getByRole("button", { name: "Checkout" }).click();
      // ASSERTION: Verify URL is checkout step one
      await expect(page).toHaveURL(
        "https://www.saucedemo.com/checkout-step-one.html"
      );
    });
    await test.step("2. Attempt to continue with Last Name field empty", async () => {
      // 1.  Last Name field leaves blank
      // 2. Fill First Name and Zip Code
      await page
        .getByRole("textbox", { name: "First Name" })
        .fill("Automation");
      await page
        .getByRole("textbox", { name: "Zip/Postal Code" })
        .fill("70000");
      await page.getByRole("button", { name: "Continue" }).click();
    });
    await test.step("3. Verify the validation error message is displayed", async () => {
      await expect(page.locator('[data-test="error"]')).toHaveText(
        "Error: Last Name is required"
      );
    });
  });
  test("TC_CHECKOUT_ERROR_003: Should show error when required Zip/Postal Code field is empty", async ({
    page,
  }) => {
    await test.step("Add items and navigate to Checkout Information Form", async () => {
      await addTwoItemsToCart(page);
      // 2. Go to Cart page
      await page.locator('[data-test="shopping-cart-link"]').click();
      // 3. Click Checkout button
      await page.getByRole("button", { name: "Checkout" }).click();
      // ASSERTION: Verify URL is checkout step one
      await expect(page).toHaveURL(
        "https://www.saucedemo.com/checkout-step-one.html"
      );
    });
    await test.step("2. Attempt to continue with Zip/Postal Code field empty", async () => {
      await page.getByRole("textbox", { name: "First Name" }).fill("Tester");
      await page.getByRole("textbox", { name: "Last Name" }).fill("Automation");
      await page.getByRole("button", { name: "Continue" }).click();
    });
    await test.step("3. Verify the validation error message is displayed", async () => {
      await expect(page.locator('[data-test="error"]')).toHaveText(
        "Error: Postal Code is required"
      );
    });
  });
});
// ==============================================================================
// --- TC_SECURE_ACCESS: Verify direct inventory access block ---
// ==============================================================================
// NOTE: This TC must be run OUTSIDE any test.describe block that contains a beforeEach login hook.
// This ensures the test starts without any active session/cookies.
test("TC_SECURE_ACCESS: Should be redirected to login page when accessing inventory without login", async ({
  page,
}) => {
  await test.step("1. Attempt to navigate directly to the Inventory page", async () => {
    await page.goto("https://www.saucedemo.com/inventory.html");
  });
  await test.step("2. Verify access is denied and redirected to Login", async () => {
    // ASSERTION 1: Verify the URL is redirected back to the login page
    await expect(page).toHaveURL("https://www.saucedemo.com/");
    // ASSERTION 2: Verify the security error message is visible
    const errorMessageLocator = page.locator('[data-test="error"]');
    // ASSERTION 2: Verify the security error message is visible
    await expect(errorMessageLocator).toBeVisible();
    // ASSERTION 3: Verify the specific security error text is correct
    await expect(errorMessageLocator).toHaveText(
      "Epic sadface: You can only access '/inventory.html' when you are logged in."
    );
    // ASSERTION 4: Verify the login form fields are now visible
    await expect(page.getByRole("textbox", { name: "Username" })).toBeVisible();
  });
});
