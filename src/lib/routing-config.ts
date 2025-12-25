/**
 * Routing Configuration
 * 
 * File này quản lý cấu hình routing cho toàn bộ ứng dụng.
 * Đảm bảo tất cả module tuân theo pattern flatten structure.
 */

/**
 * Danh sách các segment cần bỏ qua trong breadcrumb
 * Các segment này là cấp trung gian (grouping level) không cần hiển thị trong breadcrumb
 * 
 * Pattern: Flatten structure - bỏ qua cấp trung gian
 * Ví dụ: /he-thong/nhan-su/danh-sach-nhan-su → /he-thong/danh-sach-nhan-su
 *        Breadcrumb sẽ hiển thị: Trang Chủ > Hệ Thống > Danh Sách Nhân Sự (bỏ qua "Nhân Sự")
 */
export const BREADCRUMB_SKIP_SEGMENTS: Set<string> = new Set([
  "nhan-su",      // Nhân sự - cấp trung gian, đã flatten
  "so-do",        // Sơ đồ - cấp trung gian, có thể flatten sau
  "thiet-lap",    // Thiết lập - cấp trung gian, có thể flatten sau
])

/**
 * Mapping các segment path sang label tiếng Việt cho breadcrumb
 * Được sử dụng trong DynamicBreadcrumb component
 */
export const PATH_LABELS: Record<string, string> = {
  // Root
  "trang-chu": "Trang Chủ",
  
  // Main modules
  "he-thong": "Hệ Thống",
  "cong-viec": "Công Việc",
  "hanh-chinh-nhan-su": "Hành Chính Nhân Sự",
  "kinh-doanh": "Kinh Doanh",
  "marketing": "Marketing",
  "mua-hang": "Mua Hàng",
  "ke-toan": "Kế Toán",
  "kho-van": "Kho Vận",
  
  // He-thong sub-modules (flattened)
  "danh-sach-nhan-su": "Danh Sách Nhân Sự",
  "thong-tin-nguoi-than": "Thông Tin Người Thân",
  "phong-ban": "Phòng Ban",
  "cap-bac": "Cấp Bậc",
  "chuc-vu": "Chức Vụ",
  "thong-tin-cong-ty": "Thông Tin Công Ty",
  "chi-nhanh": "Chi Nhánh",
  "phan-quyen": "Phân Quyền",
  
  // Cong-viec sub-modules
  "ke-hoach-168": "Kế Hoạch 168",
  "viec-hang-ngay": "Việc Hàng Ngày",
  "tai-lieu": "Tài Liệu",
  "danh-muc": "Danh Mục",
  "tai-lieu-bieu-mau": "Tài Liệu / Biểu Mẫu",
  "ho-so": "Hồ Sơ",
  "dao-tao": "Đào Tạo",
  "ky-thi": "Kỳ Thi",
  "bai-thi": "Bài Thi",
  "cau-hoi-hang-ngay": "Câu Hỏi Hàng Ngày",
  "danh-muc-cau-hoi-hang-ngay": "Danh Mục Câu Hỏi Hàng Ngày",
  "lich-dang": "Lịch Đăng",
  "cau-tra-loi": "Câu Trả Lời",
  
  // Hanh-chinh-nhan-su sub-modules
  "tuyen-dung": "Tuyển Dụng",
  "cong-luong": "Công Lương",
  
  // Form actions
  "them-moi": "Thêm Mới",
  "sua": "Sửa",
  "doi-mat-khau": "Đổi Mật Khẩu",
}

/**
 * Routing Conventions
 * 
 * 1. FLATTEN STRUCTURE RULE:
 *    - Tất cả module nên được flatten, bỏ qua cấp trung gian
 *    - Ví dụ: /he-thong/nhan-su/danh-sach-nhan-su → /he-thong/danh-sach-nhan-su
 * 
 * 2. NAMING CONVENTIONS:
 *    - Sử dụng kebab-case cho tất cả routes
 *    - Tên folder phải match với route path
 *    - Ví dụ: folder "danh-sach-nhan-su" → route "/he-thong/danh-sach-nhan-su"
 * 
 * 3. BREADCRUMB RULE:
 *    - Các segment trong BREADCRUMB_SKIP_SEGMENTS sẽ không hiển thị trong breadcrumb
 *    - Breadcrumb luôn bắt đầu từ "Trang Chủ"
 *    - Breadcrumb hiển thị theo hierarchy thực tế của URL (sau khi skip)
 * 
 * 4. NAVIGATION RULE:
 *    - Tất cả navigation phải sử dụng absolute paths (không dùng relative)
 *    - Back button sử dụng getParentRouteFromBreadcrumb() để tính parent route
 *    - Form navigation sử dụng query parameter ?returnTo=list|detail
 */

/**
 * Helper function để check xem một segment có nên skip trong breadcrumb không
 */
export function shouldSkipSegmentInBreadcrumb(segment: string): boolean {
  return BREADCRUMB_SKIP_SEGMENTS.has(segment)
}

/**
 * Helper function để format segment thành label
 * Sử dụng PATH_LABELS nếu có, nếu không thì format từ kebab-case
 */
export function formatSegmentLabel(segment: string): string {
  // Nếu là số (ID), bỏ qua
  if (/^\d+$/.test(segment)) {
    return ""
  }
  
  // Nếu có trong mapping, dùng label đó
  if (PATH_LABELS[segment]) {
    return PATH_LABELS[segment]
  }
  
  // Format từ kebab-case sang Title Case
  return segment
    .split('-')
    .map(s => s.charAt(0).toUpperCase() + s.slice(1))
    .join(' ')
}

