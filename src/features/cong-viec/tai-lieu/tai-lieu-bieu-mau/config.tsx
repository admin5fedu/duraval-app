/**
 * Module Configuration for Tài Liệu & Biểu Mẫu
 */

import { ModuleConfig } from "@/shared/types/module-config"

export const taiLieuBieuMauConfig: ModuleConfig = {
  // Basic info
  moduleName: "tai-lieu-bieu-mau",
  moduleTitle: "Tài Liệu & Biểu Mẫu",
  moduleDescription: "Quản lý tài liệu và biểu mẫu trong hệ thống",
  
  // Routing
  routePath: "/cong-viec/tai-lieu-bieu-mau",
  parentPath: "/cong-viec",
  
  // Breadcrumb
  breadcrumb: {
    label: "Tài Liệu & Biểu Mẫu",
    parentLabel: "Công Việc",
  },
  
  // Database
  tableName: "tai_lieu_ds_tai_lieu_bieu_mau",
  primaryKey: "id",
  
  // List view
  filterColumns: [],
  searchFields: ["hang_muc", "ma_tai_lieu", "ten_tai_lieu", "mo_ta", "ghi_chu"], // ten_loai và ten_danh_muc được ẩn khỏi UI nhưng vẫn lưu trong DB
  defaultSorting: [{ id: "tg_tao", desc: true }],
}

