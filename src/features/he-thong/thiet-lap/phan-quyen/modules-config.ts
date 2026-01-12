/**
 * Configuration for modules in the system
 * Used for permission matrix display
 * 
 * Structure: 2-level hierarchy
 * - Level 1: Category (chức năng chính) - Hệ thống, Công việc, Hành chính nhân sự, Marketing, etc.
 * - Level 2: Group (nhóm module) - Sơ đồ, Nhân sự, Thiết lập, Tổng quan, etc.
 */

export interface ModuleConfig {
  id: string
  name: string
  category: string  // Cấp 1: Chức năng chính
  group: string      // Cấp 2: Nhóm module
  description?: string
}

export const MODULES: ModuleConfig[] = [
  // Hệ thống - Sơ đồ
  {
    id: "phong-ban",
    name: "Phòng ban",
    category: "Hệ thống",
    group: "Sơ đồ",
    description: "Quản lý cơ cấu phòng ban và đơn vị trực thuộc"
  },
  {
    id: "cap-bac",
    name: "Cấp bậc",
    category: "Hệ thống",
    group: "Sơ đồ",
    description: "Quản lý hệ thống cấp bậc nhân sự"
  },
  {
    id: "chuc-vu",
    name: "Chức vụ",
    category: "Hệ thống",
    group: "Sơ đồ",
    description: "Quản lý danh mục chức vụ và mô tả công việc"
  },
  // Hệ thống - Nhân sự
  {
    id: "danh-sach-nhan-su",
    name: "Danh sách nhân sự",
    category: "Hệ thống",
    group: "Nhân sự",
    description: "Quản lý hồ sơ và tài khoản nhân viên"
  },
  {
    id: "nguoi-than",
    name: "Thông tin người thân",
    category: "Hệ thống",
    group: "Nhân sự",
    description: "Quản lý dữ liệu người thân và liên hệ khẩn cấp"
  },
  // Hệ thống - Thiết lập
  {
    id: "thong-tin-cong-ty",
    name: "Thông tin công ty",
    category: "Hệ thống",
    group: "Thiết lập",
    description: "Cấu hình thông tin chung của doanh nghiệp"
  },
  {
    id: "chi-nhanh",
    name: "Chi nhánh",
    category: "Hệ thống",
    group: "Thiết lập",
    description: "Quản lý danh sách chi nhánh và văn phòng"
  },
  {
    id: "phan-quyen",
    name: "Phân quyền",
    category: "Hệ thống",
    group: "Thiết lập",
    description: "Quản lý phân quyền cho các chức vụ"
  },
  // Công Việc - Tổng quan
  {
    id: "ke-hoach-168",
    name: "Kế Hoạch 168",
    category: "Công việc",
    group: "Tổng quan",
    description: "Quản lý kế hoạch 168 giờ"
  },
  {
    id: "viec-hang-ngay",
    name: "Việc Hàng Ngày",
    category: "Công việc",
    group: "Tổng quan",
    description: "Theo dõi và quản lý các công việc hàng ngày, nhiệm vụ và tiến độ"
  },
  // Công Việc - Câu hỏi hàng ngày
  {
    id: "danh-muc-cau-hoi",
    name: "Danh Mục Câu Hỏi",
    category: "Công việc",
    group: "Câu hỏi hàng ngày",
    description: "Quản lý danh mục các chủ đề câu hỏi hàng ngày"
  },
  {
    id: "lich-dang",
    name: "Lịch Đăng",
    category: "Công việc",
    group: "Câu hỏi hàng ngày",
    description: "Lên lịch và quản lý thời gian đăng câu hỏi hàng ngày"
  },
  {
    id: "cau-tra-loi",
    name: "Câu Trả Lời",
    category: "Công việc",
    group: "Câu hỏi hàng ngày",
    description: "Quản lý câu trả lời của nhân viên cho câu hỏi hàng ngày"
  },
  // Công Việc - Tài liệu
  {
    id: "loai-tai-lieu",
    name: "Loại Tài Liệu",
    category: "Công việc",
    group: "Tài liệu",
    description: "Quản lý các loại và phân loại tài liệu trong hệ thống"
  },
  {
    id: "danh-muc-tai-lieu",
    name: "Danh Mục Tài Liệu",
    category: "Công việc",
    group: "Tài liệu",
    description: "Quản lý danh mục và phân loại tài liệu trong hệ thống"
  },
  {
    id: "tai-lieu-bieu-mau",
    name: "Tài Liệu & Biểu Mẫu",
    category: "Công việc",
    group: "Tài liệu",
    description: "Quản lý tài liệu và biểu mẫu trong hệ thống"
  },
  // Hành Chính Nhân Sự - OLE
  {
    id: "cham-ole",
    name: "Chấm OLE",
    category: "Hành chính nhân sự",
    group: "OLE",
    description: "Quản lý chấm điểm OLE nhân viên"
  },
  {
    id: "diem-cong-tru",
    name: "Điểm Cộng Trừ",
    category: "Hành chính nhân sự",
    group: "OLE",
    description: "Quản lý điểm cộng trừ nhân viên"
  },
  {
    id: "nhom-luong",
    name: "Nhóm Lương",
    category: "Hành chính nhân sự",
    group: "OLE",
    description: "Quản lý nhóm lương"
  },
  {
    id: "nhom-diem-cong-tru",
    name: "Nhóm Điểm Cộng Trừ",
    category: "Hành chính nhân sự",
    group: "OLE",
    description: "Quản lý nhóm điểm cộng trừ"
  },
  // Hành Chính Nhân Sự - Công lương
  {
    id: "phieu-hanh-chinh",
    name: "Phiếu Hành Chính",
    category: "Hành chính nhân sự",
    group: "Công lương",
    description: "Quản lý các phiếu hành chính"
  },
  {
    id: "nhom-phieu-hanh-chinh",
    name: "Nhóm Phiếu Hành Chính",
    category: "Hành chính nhân sự",
    group: "Công lương",
    description: "Quản lý nhóm các phiếu hành chính"
  },
  // Marketing - Kỹ thuật & CSKH
  {
    id: "phan-hoi-khach-hang",
    name: "Phản Hồi Khách Hàng",
    category: "Marketing",
    group: "Kỹ thuật & CSKH",
    description: "Quản lý phản hồi và góp ý từ khách hàng"
  },
  {
    id: "truc-hat",
    name: "Trục Hạt",
    category: "Marketing",
    group: "Kỹ thuật & CSKH",
    description: "Quản lý trục hạt"
  },

  // Kinh doanh - Phiếu đề xuất bán hàng
  {
    id: "phieu-de-xuat-ban-hang",
    name: "Phiếu đề xuất bán hàng",
    category: "Kinh doanh",
    group: "Phiếu đề xuất bán hàng",
    description: "Quản lý phiếu đề xuất bán hàng"
  },
  // Kinh doanh - Quỹ hỗ trợ bán hàng
  {
    id: "loai-phieu-hang-muc",
    name: "Loại Phiếu & Hạng Mục",
    category: "Kinh doanh",
    group: "Quỹ hỗ trợ bán hàng",
    description: "Quản lý loại phiếu và hạng mục quỹ"
  },
  {
    id: "quy-de-xuat-chiet-khau",
    name: "Quỹ Đề Xuất Chiết Khấu",
    category: "Kinh doanh",
    group: "Quỹ hỗ trợ bán hàng",
    description: "Quản lý quỹ đề xuất chiết khấu"
  },
  {
    id: "quy-htbh-theo-thang",
    name: "Quỹ HTBH Theo Tháng",
    category: "Kinh doanh",
    group: "Quỹ hỗ trợ bán hàng",
    description: "Quản lý quỹ hỗ trợ bán hàng theo tháng"
  },
  {
    id: "tong-quan-quy-htbh",
    name: "Tổng Quan Quỹ",
    category: "Kinh doanh",
    group: "Quỹ hỗ trợ bán hàng",
    description: "Xem tổng quan quỹ hỗ trợ bán hàng"
  },
  // Kinh doanh - Sale Ads
  {
    id: "bang-chia-data",
    name: "Bảng Chia Data",
    category: "Kinh doanh",
    group: "Sale Ads",
    description: "Quản lý bảng chia data cho sale"
  },
  {
    id: "quy-dinh-ty-le",
    name: "Quy Định Tỷ Lệ",
    category: "Kinh doanh",
    group: "Sale Ads",
    description: "Quản lý quy định tỷ lệ chia data"
  },
  // Kinh doanh - Thông tin
  {
    id: "chuong-trinh-ban-hang",
    name: "Chương trình bán hàng",
    category: "Kinh doanh",
    group: "Thông tin",
    description: "Quản lý chương trình bán hàng"
  },
  {
    id: "san-pham-xuat-vat",
    name: "Sản Phẩm Xuất VAT",
    category: "Kinh doanh",
    group: "Thông tin",
    description: "Danh sách sản phẩm xuất VAT"
  },
]

/**
 * Get modules grouped by category and group (2-level hierarchy)
 * Returns: { category: { group: ModuleConfig[] } }
 */
export function getModulesByCategoryAndGroup(): Record<string, Record<string, ModuleConfig[]>> {
  const grouped: Record<string, Record<string, ModuleConfig[]>> = {}
  MODULES.forEach(module => {
    if (!grouped[module.category]) {
      grouped[module.category] = {}
    }
    if (!grouped[module.category][module.group]) {
      grouped[module.category][module.group] = []
    }
    grouped[module.category][module.group].push(module)
  })
  return grouped
}

/**
 * Get modules grouped by group (backward compatibility)
 * @deprecated Use getModulesByCategoryAndGroup() instead for 2-level hierarchy
 */
export function getModulesByGroup(): Record<string, ModuleConfig[]> {
  const grouped: Record<string, ModuleConfig[]> = {}
  MODULES.forEach(module => {
    const groupKey = `${module.category} - ${module.group}`
    if (!grouped[groupKey]) {
      grouped[groupKey] = []
    }
    grouped[groupKey].push(module)
  })
  return grouped
}

/**
 * Get module by ID
 */
export function getModuleById(moduleId: string): ModuleConfig | undefined {
  return MODULES.find(m => m.id === moduleId)
}

