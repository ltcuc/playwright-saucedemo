// File: tests/fixtures/auth-fixtures.ts

import { test as base, Page, expect } from "@playwright/test";
// Đảm bảo đường dẫn import các Page Object Class là chính xác
import { LoginPage } from "../../pages/LoginPage";
import { InventoryPage } from "../../pages/InventoryPage";
import { CheckoutPage } from "../../pages/CheckoutPage";
import { standardUser, ProductConstants } from "../../test-data/users";

// 1. ĐỊNH NGHĨA KIỂU DỮ LIỆU FIXTURE
type AuthFixtures = {
  // Fixture cơ sở: Page đã đăng nhập (State Setup)
  loggedPage: Page;
  // Các Fixture cung cấp Page Object
  loginPageFixture: LoginPage;
  inventoryPageFixture: InventoryPage;
  checkoutPageFixture: CheckoutPage;
  // Fixture mới: Page đã được điều hướng đến Checkout Step 1
  checkoutStepOnePage: Page;
};

// 2. MỞ RỘNG ĐỐI TƯỢNG TEST (BASE.EXTEND)
export const test = base.extend<AuthFixtures>({
  // ===================================================================
  // A. loggedPage: FIXTURE TRẠNG THÁI (State Setup - Đăng nhập)
  // ===================================================================
  loggedPage: [
    async ({ page }, use) => {
      const loginPage = new LoginPage(page);
      // ACTION: Thực hiện đăng nhập thành công
      // Note: Logic này đã được FIX để sử dụng Promise.all trong LoginPage.login()
      await loginPage.login(standardUser.username, standardUser.password);
      // Khẳng định đã đăng nhập (Assertion)
      await loginPage.expectLoggedIn();
      // CHUYỂN GIAO: Cung cấp đối tượng 'page' đã được xác thực
      await use(page);
      // TEARDOWN: (Logic dọn dẹp sau khi TC kết thúc nếu cần)
    },
    { scope: "test" },
  ],
  // ===================================================================
  // B. FIXTURE TRẠNG THÁI PHỨC HỢP (Checkout Step 1 Page)
  // ===================================================================
  checkoutStepOnePage: [
    async ({ loggedPage, inventoryPageFixture }, use) => {
      // 1. ACTION: Thêm 2 sản phẩm vào giỏ hàng
      await inventoryPageFixture.addItemToCart(ProductConstants.BACKPACK_NAME);
      await inventoryPageFixture.addItemToCart(
        ProductConstants.TSHIRT_BOLT_NAME
      );
      // 2. ACTION: Navigate từ Inventory -> Cart -> Checkout Step 1
      await inventoryPageFixture.cartLink.click();
      await loggedPage.getByRole("button", { name: "Checkout" }).click();
      // 3. ASSERTION: Xác nhận đã đến trang Form thông tin khách hàng
      await expect(loggedPage).toHaveURL(
        "https://www.saucedemo.com/checkout-step-one.html"
      );
      // CHUYỂN GIAO: Cung cấp Page đã thiết lập trạng thái cho Test Case
      await use(loggedPage);
    },
    { scope: "test" },
  ],
  // ===================================================================
  // C. FIXTURES CUNG CẤP PAGE OBJECT (Dependency Injection)
  // ===================================================================
  // Fixture 1: Trang Login (Dùng cho TC DDT và Login Lỗi)
  loginPageFixture: [
    async ({ page }, use) => {
      // Chỉ khởi tạo Class và chuyển giao
      const loginPage = new LoginPage(page);
      await use(loginPage);
    },
    { scope: "test" },
  ],
  // Fixture 2: Trang Inventory (Phụ thuộc vào trạng thái loggedPage)
  inventoryPageFixture: [
    async ({ loggedPage }, use) => {
      // Yêu cầu 'loggedPage' để đảm bảo đã đăng nhập
      const inventoryPage = new InventoryPage(loggedPage);
      await use(inventoryPage);
    },
    { scope: "test" },
  ],
  // Fixture 3: Trang Checkout (Phụ thuộc vào trạng thái loggedPage)
  checkoutPageFixture: [
    async ({ loggedPage }, use) => {
      const checkoutPage = new CheckoutPage(loggedPage);
      await use(checkoutPage);
    },
    { scope: "test" },
  ],
});

// Re-export tất cả các hàm và kiểu dữ liệu gốc của Playwright Test
export * from "@playwright/test";
