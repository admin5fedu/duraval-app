/**
 * Routing Configuration
 * 
 * File này quản lý cấu hình routing cho toàn bộ ứng dụng.
 * Đảm bảo tất cả module tuân theo pattern flatten structure.
 */

import { moduleRegistry } from "@/shared/config/module-registry"

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
  "cau-hoi-hang-ngay", // Câu hỏi hàng ngày - cấp trung gian, đã flatten
  "cong-luong",   // Công lương - cấp trung gian trong hành chính nhân sự
  "ole",          // OLE - cấp trung gian trong hành chính nhân sự
  "tuyen-dung",   // Tuyển dụng - cấp trung gian trong hành chính nhân sự
])

/**
 * Base PATH_LABELS mapping
 * Auto-populated from module registry
 */
const BASE_PATH_LABELS: Record<string, string> = {
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
  "nguoi-than": "Người thân",
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
  "danh-muc-cau-hoi": "Danh Mục Câu Hỏi",
  "lich-dang": "Lịch Đăng",
  "danh-muc-cau-hoi-hang-ngay": "Danh Mục Câu Hỏi Hàng Ngày", // Legacy, có thể xóa nếu không dùng
  "cau-tra-loi": "Câu Trả Lời",
  
  // Hanh-chinh-nhan-su sub-modules
  "cong-luong": "Công Lương",
  "phieu-hanh-chinh": "Phiếu Hành Chính",
  "nhom-phieu-hanh-chinh": "Nhóm Phiếu Hành Chính",
  "bang-cong": "Bảng Công",
  "bang-luong": "Bảng Lương",
  "cham-ole": "Chấm OLE",
  "diem-cong-tru": "Điểm Cộng Trừ",
  "nhom-diem-cong-tru": "Nhóm Điểm Cộng Trừ",
  "de-xuat-tuyen-dung": "Đề Xuất Tuyển Dụng",
  "ung-vien": "Ứng Viên",
  
  // Form actions
  "them-moi": "Thêm Mới",
  "moi": "Thêm Mới",
  "sua": "Sửa",
  "doi-mat-khau": "Đổi Mật Khẩu",
}

/**
 * Auto-populate PATH_LABELS from module registry
 * Modules can override labels via breadcrumb config
 */
function populatePathLabelsFromModules(): Record<string, string> {
  const moduleLabels: Record<string, string> = {}
  
  moduleRegistry.getAll().forEach(config => {
    // Extract segment from routePath (last part)
    const segments = config.routePath.split('/').filter(Boolean)
    const lastSegment = segments[segments.length - 1]
    
    if (lastSegment) {
      // Use breadcrumb label if available, otherwise use moduleTitle
      moduleLabels[lastSegment] = config.breadcrumb?.label || config.moduleTitle
    }
    
    // Also add parent path label if specified
    if (config.breadcrumb?.parentLabel) {
      const parentSegments = config.parentPath.split('/').filter(Boolean)
      const parentSegment = parentSegments[parentSegments.length - 1]
      if (parentSegment && !BASE_PATH_LABELS[parentSegment]) {
        moduleLabels[parentSegment] = config.breadcrumb.parentLabel
      }
    }
  })
  
  return moduleLabels
}

/**
 * Mapping các segment path sang label tiếng Việt cho breadcrumb
 * Được sử dụng trong DynamicBreadcrumb component
 * Auto-populated from module registry
 */
export const PATH_LABELS: Record<string, string> = {
  ...BASE_PATH_LABELS,
  ...populatePathLabelsFromModules(),
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
 * Also checks module config for skip segments
 */
export function shouldSkipSegmentInBreadcrumb(segment: string, routePath?: string): boolean {
  // Check base skip segments
  if (BREADCRUMB_SKIP_SEGMENTS.has(segment)) {
    return true
  }
  
  // Check module-specific skip segments
  if (routePath) {
    const config = moduleRegistry.getByRoutePath(routePath)
    if (config?.breadcrumb?.skipSegments?.includes(segment)) {
      return true
    }
  }
  
  return false
}

/**
 * Helper function để format segment thành label
 * Sử dụng PATH_LABELS nếu có, nếu không thì format từ kebab-case
 * Also checks module registry for dynamic labels
 */
export function formatSegmentLabel(segment: string, routePath?: string): string {
  // Nếu là số (ID), bỏ qua
  if (/^\d+$/.test(segment)) {
    return ""
  }
  
  // Try to get from module registry first
  if (routePath) {
    const config = moduleRegistry.getByRoutePath(routePath)
    if (config) {
      const segments = routePath.split('/').filter(Boolean)
      const lastSegment = segments[segments.length - 1]
      if (segment === lastSegment && config.breadcrumb?.label) {
        return config.breadcrumb.label
      }
    }
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

