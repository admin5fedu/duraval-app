/**
 * Configuration for modules in the system
 * Used for permission matrix display
 */

export interface ModuleConfig {
  id: string
  name: string
  group: string
  description?: string
}

export const MODULES: ModuleConfig[] = [
  // Hệ thống - Sơ đồ
  {
    id: "phong-ban",
    name: "Phòng ban",
    group: "Hệ thống - Sơ đồ",
    description: "Quản lý cơ cấu phòng ban và đơn vị trực thuộc"
  },
  {
    id: "cap-bac",
    name: "Cấp bậc",
    group: "Hệ thống - Sơ đồ",
    description: "Quản lý hệ thống cấp bậc nhân sự"
  },
  {
    id: "chuc-vu",
    name: "Chức vụ",
    group: "Hệ thống - Sơ đồ",
    description: "Quản lý danh mục chức vụ và mô tả công việc"
  },
  // Hệ thống - Nhân sự
  {
    id: "danh-sach-nhan-su",
    name: "Danh sách nhân sự",
    group: "Hệ thống - Nhân sự",
    description: "Quản lý hồ sơ và tài khoản nhân viên"
  },
  {
    id: "nguoi-than",
    name: "Thông tin người thân",
    group: "Hệ thống - Nhân sự",
    description: "Quản lý dữ liệu người thân và liên hệ khẩn cấp"
  },
  // Hệ thống - Thiết lập
  {
    id: "thong-tin-cong-ty",
    name: "Thông tin công ty",
    group: "Hệ thống - Thiết lập",
    description: "Cấu hình thông tin chung của doanh nghiệp"
  },
  {
    id: "chi-nhanh",
    name: "Chi nhánh",
    group: "Hệ thống - Thiết lập",
    description: "Quản lý danh sách chi nhánh và văn phòng"
  },
  {
    id: "phan-quyen",
    name: "Phân quyền",
    group: "Hệ thống - Thiết lập",
    description: "Quản lý phân quyền cho các chức vụ"
  },
]

/**
 * Get modules grouped by group
 */
export function getModulesByGroup(): Record<string, ModuleConfig[]> {
  const grouped: Record<string, ModuleConfig[]> = {}
  MODULES.forEach(module => {
    if (!grouped[module.group]) {
      grouped[module.group] = []
    }
    grouped[module.group].push(module)
  })
  return grouped
}

/**
 * Get module by ID
 */
export function getModuleById(moduleId: string): ModuleConfig | undefined {
  return MODULES.find(m => m.id === moduleId)
}

