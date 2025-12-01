import { Page, Locator, expect } from "@playwright/test";
export class CheckoutPage {
  // Locators for Checkout Step 1 (Customer Information Form)
  readonly page: Page;
  readonly firstNameInput: Locator;
  readonly lastNameInput: Locator;
  readonly zipCodeInput: Locator;
  readonly continueButton: Locator;
  // Locators for Checkout Step 2 (Overview Summary)
  readonly finishButton: Locator;
  readonly cancelButton: Locator;
  readonly subtotalLabel: Locator;
  readonly taxLabel: Locator;
  readonly totalLabel: Locator;
  readonly errorContainer: Locator; // Dùng để kiểm tra lỗi Form

  // Constructor: Khởi tạo đối tượng Page và định nghĩa Locators
  constructor(page: Page) {
    this.page = page;
    this.firstNameInput = page.getByRole("textbox", { name: "First Name" });
    this.lastNameInput = page.getByRole("textbox", { name: "Last Name" });
    this.zipCodeInput = page.getByRole("textbox", { name: "Zip/Postal Code" });
    this.continueButton = page.getByRole("button", { name: "Continue" });
    this.finishButton = page.getByRole("button", { name: "Finish" });
    this.cancelButton = page.getByRole("button", { name: "Cancel" });
    this.subtotalLabel = page.locator('[data-test="subtotal-label"]');
    this.taxLabel = page.locator(".summary_tax_label");
    this.totalLabel = page.locator(".summary_total_label");
    this.errorContainer = page.locator('[data-test="error"]');
  }
  // --- METHODS (Actions) ---
  // 1. Method: Điền thông tin khách hàng và chuyển sang bước 2
  async fillCustomerInfo(firstName: string, lastName: string, zipCode: string) {
    await this.firstNameInput.fill(firstName);
    await this.lastNameInput.fill(lastName);
    await this.zipCodeInput.fill(zipCode);
    await this.continueButton.click();
  }
  // 2. Method: Hoàn tất đơn hàng
  async completeOrder() {
    await this.finishButton.click();
    // Assertion: Kiểm tra chuyển hướng đến trang xác nhận
    await expect(this.page).toHaveURL(
      "https://www.saucedemo.com/checkout-complete.html"
    );
    await expect(
      this.page.getByRole("heading", { name: "Thank you for your order!" })
    ).toBeVisible();
  }
  // 3. Method: Hủy đơn hàng (từ trang Overview)
  async cancelCheckout() {
    await this.cancelButton.click();
    await expect(this.page).toHaveURL(
      "https://www.saucedemo.com/inventory.html"
    );
  }
  // --- METHODS (Assertions) ---
  // 4. Method: Kiểm tra tính toán Tổng tiền (dùng trong Overview)
  async assertFinalTotals(
    expectedSubtotal: string,
    expectedTax: string,
    expectedTotal: string
  ) {
    await expect(this.subtotalLabel).toContainText(expectedSubtotal);
    await expect(this.taxLabel).toContainText(expectedTax);
    await expect(this.totalLabel).toContainText(expectedTotal);
  }
  // 5. Method: Khẳng định lỗi Form Validation (dùng cho TC lỗi)
  async assertFormError(expectedErrorMessage: string) {
    await expect(this.errorContainer).toHaveText(expectedErrorMessage);
    await expect(this.page).toHaveURL(
      "https://www.saucedemo.com/checkout-step-one.html"
    ); // Phải ở lại trang Form
  }
}
