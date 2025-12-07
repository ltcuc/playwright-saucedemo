import { test, expect, APIRequestContext } from "@playwright/test";
// 1. Khai báo đối tượng API context toàn cục
let apiContext: APIRequestContext;
const BASE_URL = "https://www.saucedemo.com";
// 2. Hook: Khởi tạo API context trước khi tất cả các TC chạy
test.beforeAll(async ({ playwright }) => {
  apiContext = await playwright.request.newContext({
    baseURL: BASE_URL,
    extraHTTPHeaders: {
      Accept: "application/json",
    },
  });
});
// 3. Hook: Đảm bảo đóng API context sau khi hoàn thành
test.afterAll(async () => {
  if (apiContext) {
    await apiContext.dispose();
  }
});
// ---------------------------------------------------------------------
// BẮT ĐẦU TEST CASE TẠI ĐÂY
// ---------------------------------------------------------------------

test("TC_API_PRODUCTS_001: Should successfully retrieve product list and verify status", async () => {
  // 1. ACTION: Gửi yêu cầu GET
  // Giả định: Endpoint để lấy danh sách sản phẩm là /api/products
  const response = await apiContext.get("/api/product");
  // 2. ASSERTION: Kiểm tra trạng thái phản hồi
  // Kiểm tra API có trả về mã 200 OK (Thành công)
  await expect(response.status()).toBe(200);
  // 3. ASSERTION: Kiểm tra định dạng dữ liệu (Data Schema)
  const responseBody = await response.json(); // Phân tích JSON từ phản hồi
  // Khẳng định phản hồi là một mảng và có dữ liệu
  expect(Array.isArray(responseBody)).toBe(true);
  expect(responseBody.length).toBeGreaterThan(0);
  // 4. ASSERTION: Kiểm tra cấu trúc của mục hàng đầu tiên
  const firstProduct = responseBody[0];
  // Đảm bảo các trường dữ liệu quan trọng phải tồn tại
  expect(firstProduct).toHaveProperty("id");
  expect(firstProduct).toHaveProperty("name");
  expect(firstProduct).toHaveProperty("price");
});
test("TC_API_LOGIN_001: Should successfully log in and receive session token", async () => {
  // Giả định: Endpoint đăng nhập là /api/login
  const response = await apiContext.post("/api/login", {
    data: {
      // Payload (Body) chứa thông tin đăng nhập
      username: "standard_user",
      password: "secret_sauce",
    },
  });
  // 1. ASSERTION: Kiểm tra trạng thái 200 OK
  await expect(response.status()).toBe(200);
  // 2. ASSERTION: Kiểm tra body trả về phải có Token/Session ID
  const responseBody = await response.json();
  // Giả định: API trả về một đối tượng chứa trường 'token'
  expect(responseBody).toHaveProperty("token");
  // Đảm bảo token không bị rỗng
  expect(responseBody).not.toBeNull();
  // 3. (Tùy chọn) Kiểm tra Cookie nếu API trả về Cookie để quản lý session
  const headers = response.headers();
  expect(headers["set-cookie"]).toBeDefined();
});
test("TC_API_LOGIN_002: Should fail with 401 for invalid credentials", async () => {
  const response = await apiContext.post("/api/login", {
    data: {
      username: "invalid_user",
      password: "wrong_password",
    },
  });
  // 1. ASSERTION: Kiểm tra mã lỗi
  // API nên trả về 401 (Unauthorized) hoặc 403 (Forbidden)
  await expect(response.status()).toBe(401);
  // 2. ASSERTION: Kiểm tra nội dung lỗi
  // Kiểm tra xem body phản hồi có chứa thông báo lỗi mong đợi hay không
  const bodyText = await response.text();
  expect(bodyText).toContain("Invalid credentials");
});
