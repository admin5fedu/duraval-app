/**
 * Module Configuration for Nhóm Điểm Cộng Trừ
 */

import { ModuleConfig } from "@/shared/types/module-config"

export const nhomDiemCongTruConfig: ModuleConfig = {
  // Basic info
  moduleName: "nhom-diem-cong-tru",
  moduleTitle: "Nhóm Điểm Cộng Trừ",
  moduleDescription: "Quản lý nhóm điểm cộng trừ",
  
  // Routing
  routePath: "/hanh-chinh-nhan-su/nhom-diem-cong-tru",
  parentPath: "/hanh-chinh-nhan-su",
  
  // Breadcrumb
  breadcrumb: {
    label: "Nhóm Điểm Cộng Trừ",
    parentLabel: "Hành Chính Nhân Sự",
  },
  
  // Database
  tableName: "ole_nhom_diem_cong_tru",
  primaryKey: "id",
  
  // List view
  filterColumns: [],
  searchFields: ["hang_muc", "nhom", "mo_ta"],
  defaultSorting: [{ id: "hang_muc", desc: false }],
}

