import { expect } from "@playwright/test";
// FIX 1: Import 'test' đã được tùy chỉnh và các Fixture cần thiết từ auth-fixtures
import {
  test,
  Page,
  LoginPage,
  CheckoutPage,
} from "../tests/fixtures/auth-fixtures";
// Note: LoginPage không cần import ở đây vì logic login đã nằm trong Fixture
// XÓA TOÀN BỘ KHỐI: let loginPage: LoginPage; let inventoryPage: InventoryPage;...
// XÓA TOÀN BỘ KHỐI: test.beforeEach(...)
// XÓA TOÀN BỘ KHỐI: GLOBAL HELPER FUNCTION navigateToCheckoutStepOne (chúng ta sẽ gộp nó lại)
// --- GLOBAL HELPER FUNCTION: Navigate to Checkout Step 1 (Reusable Setup) ---
// Note: This logic is shared among all Checkout TCs.

test.describe("POM E2E Checkout Workflow Scenarios", () => {
  // ==============================================================================
  // --- TC_CHECKOUT_001: E2E SUCCESSFUL PURCHASE ---
  // ==============================================================================
  test("TC_CHECKOUT_001: Should successfully purchase two products and verify totals", async ({
    page,
    inventoryPageFixture,
    checkoutPageFixture,
  }) => {
    // Test Case Data
    const subtotalExpected = "Item total: $45.98";
    const taxExpected = "Tax: $3.68";
    const totalExpected = "Total: $49.66";
    // 1. PHASE: ADD ITEMS AND START CHECKOUT
    await test.step("1. Add items to cart and navigate to Checkout Form", async () => {
      // Using Helper Function to set up items and navigate to Step 1
      // Add items (InventoryPage Method)
      await inventoryPageFixture.addItemToCart("Sauce Labs Backpack");
      await inventoryPageFixture.addItemToCart("Sauce Labs Bolt T-Shirt");
      // Navigate to Cart -> Checkout Step 1
      await inventoryPageFixture.cartLink.click();
      await page.getByRole("button", { name: "Checkout" }).click();
      // Verify URL
      await expect(page).toHaveURL(
        "https://www.saucedemo.com/checkout-step-one.html"
      );
    });
    // 2. PHASE: FILL FORM AND PROCEED
    await test.step("2. Fill customer info and proceed to Overview", async () => {
      // Fill customer information (using Encapsulated Method)
      await checkoutPageFixture.fillCustomerInfo("Cuc", "Le", "70000");
      // ASSERTION: Verify navigation to Overview page
      await expect(page).toHaveURL(
        "https://www.saucedemo.com/checkout-step-two.html"
      );
    });
    // 3. PHASE: VERIFY SUMMARY AND COMPLETE ORDER

    await test.step("3. Verify final totals and complete order", async () => {
      // Verify totals (CheckoutPage method)
      await checkoutPageFixture.assertFinalTotals(
        subtotalExpected,
        taxExpected,
        totalExpected
      );
      // Complete the order (CheckoutPage method)
      await checkoutPageFixture.completeOrder();
    });
    // 4. PHASE: FINAL VERIFICATION
    // The completeOrder() method includes the final URL assertion.
    await test.step("4. Final verification of order success", async () => {
      await expect(
        page.getByRole("heading", { name: "Thank you for your order!" })
      ).toBeVisible();
    });
  });
  // ==============================================================================
  // --- TC_CHECKOUT_ERROR_001: NEGATIVE TEST (FORM VALIDATION) ---
  // ==============================================================================
  test("TC_CHECKOUT_ERROR_001: Should block checkout and show error for empty Last Name", async ({
    page,
    inventoryPageFixture,
    checkoutPageFixture,
  }) => {
    await test.step("1. Setup: Navigate to Checkout Form", async () => {
      await inventoryPageFixture.addItemToCart("Sauce Labs Backpack");
      await inventoryPageFixture.addItemToCart("Sauce Labs Bolt T-Shirt");
      await inventoryPageFixture.cartLink.click();
      await page.getByRole("button", { name: "Checkout" }).click();

      // Assertion
      await expect(page).toHaveURL(
        "https://www.saucedemo.com/checkout-step-one.html"
      );
    });
    await test.step("2. Attempt to continue with Last Name field empty", async () => {
      // Fill First Name (Correct value)
      await checkoutPageFixture.firstNameInput.fill("Tester");
      // Fill Zip Code (Correct value)
      await checkoutPageFixture.zipCodeInput.fill("70000");

      // ACTION: Leave Last Name blank, then click Continue
      await checkoutPageFixture.continueButton.click();
    });
    await test.step("3. Verify the validation error message", async () => {
      // Note: The assertion is correctly checking for "Last Name is required" based on the logic.
      await checkoutPageFixture.assertFormError("Error: Last Name is required");
    });
  });
  test("TC_CHECKOUT_ERROR_002: Should block checkout and show error for empty First Name", async ({
    page,
    inventoryPageFixture,
    checkoutPageFixture,
  }) => {
    await test.step("1. Setup: Navigate to Checkout Form", async () => {
      await inventoryPageFixture.addItemToCart("Sauce Labs Backpack");
      await inventoryPageFixture.addItemToCart("Sauce Labs Bolt T-Shirt");
      await inventoryPageFixture.cartLink.click();
      await page.getByRole("button", { name: "Checkout" }).click();
      await expect(page).toHaveURL(
        "https://www.saucedemo.com/checkout-step-one.html"
      );
    });
    await test.step("2. Attempt to continue with First Name field empty", async () => {
      // Fill First Name (Correct value)
      await checkoutPageFixture.lastNameInput.fill("Automation");
      // Fill Zip Code (Correct value)
      await checkoutPageFixture.zipCodeInput.fill("70000");

      // ACTION: Leave First Name blank, then click Continue
      await checkoutPageFixture.continueButton.click();
    });
    await test.step("3. Verify the validation error message", async () => {
      // Note: The assertion is correctly checking for "First Name is required" based on the logic.
      await checkoutPageFixture.assertFormError(
        "Error: First Name is required"
      );
    });
  });
  test("TC_CHECKOUT_ERROR_003: Should block checkout and show error for empty Postal Code", async ({
    page,
    inventoryPageFixture,
    checkoutPageFixture,
  }) => {
    await test.step("1. Setup: Navigate to Checkout Form", async () => {
      // Note: This TC reuses the Add/Navigate logic from the successful TC.
      // Add items, navigate to Cart, and click Checkout
      await inventoryPageFixture.addItemToCart("Sauce Labs Backpack");
      await inventoryPageFixture.addItemToCart("Sauce Labs Bolt T-Shirt");
      await inventoryPageFixture.cartLink.click();
      await page.getByRole("button", { name: "Checkout" }).click();
      await expect(page).toHaveURL(
        "https://www.saucedemo.com/checkout-step-one.html"
      );
    });
    await test.step("2. Attempt to continue with Postal Code field empty", async () => {
      // Fill First Name (Correct value)
      await checkoutPageFixture.lastNameInput.fill("Automation");
      // Fill Zip Code (Correct value)
      await checkoutPageFixture.firstNameInput.fill("Tester");

      // ACTION: Postal Code field blank, then click Continue
      await checkoutPageFixture.continueButton.click();
    });
    await test.step("3. Verify the validation error message", async () => {
      // Note: The assertion is correctly checking for "Postal Code is required" based on the logic.
      await checkoutPageFixture.assertFormError(
        "Error: Postal Code is required"
      );
    });
  });
});
