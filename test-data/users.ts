// =====================================================================================
// 1. INTERFACE CƠ SỞ (BASE INTERFACE)
// Chứa các thuộc tính chung liên quan đến Credentials
// =====================================================================================
interface UserCredentials {
  username: string;
  password: string;
}
// =====================================================================================
// 2. INTERFACE MỞ RỘNG
// =====================================================================================

// User: Mở rộng từ UserCredentials và thêm mô tả (description)
interface User extends UserCredentials {
  description: string;
}
// FailureScenario: Mở rộng từ UserCredentials và thêm thông báo lỗi
interface FailureScenario extends UserCredentials {
  errorMessage: string; // Thông báo lỗi mong đợi
}

interface LoginScenario extends UserCredentials {
  // Thuộc tính chung cho cả thành công và thất bại
  isSuccess: boolean;
  expectedUrl: string;
  // Thuộc tính chỉ dùng cho thất bại, nên đánh dấu là tùy chọn (?)
  errorMessage?: string; //Dấu ? có nghĩa là: chuỗi CÓ THỂ là undefined hoặc null
}
// =====================================================================================
// 2. HẰNG SỐ DỮ LIỆU CỐ ĐỊNH (STATIC DATA)
// =====================================================================================
export const standardUser: User = {
  username: "standard_user",
  password: "secret_sauce",
  description: "Successful login user",
};
export const ProductConstants = {
  BACKPACK_NAME: "Sauce Labs Backpack",
  TSHIRT_BOLT_NAME: "Sauce Labs Bolt T-Shirt",
  SUBTOTAL_45_98: "Item total: $45.98",
  TAX_3_68: "Tax: $3.68",
  TOTAL_49_66: "Total: $49.66",
};
// =====================================================================================
// 3. DỮ LIỆU THẤT BẠI (FAILURE SCENARIOS)
// Dùng để tạo mảng dữ liệu tổng hợp
// =====================================================================================
const failureScenariosData = [
  // TC 1: Tài khoản bị khóa (Chặn truy cập)
  {
    username: "locked_out_user",
    password: "secret_sauce",
    errorMessage: "Epic sadface: Sorry, this user has been locked out.",
  },
  // TC 2: Thông tin không khớp (Sai tên/mật khẩu)
  {
    username: "incorrect_user",
    password: "wrong_password",
    errorMessage:
      "Epic sadface: Username and password do not match any user in this service",
  },
  // TC 3: Bỏ trống Tên người dùng (Kiểm tra form validation)
  {
    username: "",
    password: "secret_sauce",
    errorMessage: "Epic sadface: Username is required",
  },
  // TC 4: Bỏ trống Mật khẩu (Kiểm tra form validation)
  {
    username: "standard_user",
    password: "",
    errorMessage: "Epic sadface: Password is required",
  },
];

// =====================================================================================
// 4. DỮ LIỆU TỔNG HỢP (ALL-IN-ONE DDT)
// =====================================================================================
// Mảng này được export và dùng cho test.each() trong file login.ddt.spec.ts

export const allLoginScenarios: LoginScenario[] = [
  // 1. KỊCH BẢN THÀNH CÔNG (HAPPY PATH)
  {
    username: standardUser.username,
    password: standardUser.password,
    isSuccess: true,
    expectedUrl: "https://www.saucedemo.com/inventory.html", // URL sau khi login
  },
  // 2. KỊCH BẢN THẤT BẠI (Mở rộng từ mảng failureScenariosData)
  ...failureScenariosData.map((scenario) => ({
    ...scenario,
    isSuccess: false,
    expectedUrl: "https://www.saucedemo.com/", // URL vẫn là trang Login
  })),
];
