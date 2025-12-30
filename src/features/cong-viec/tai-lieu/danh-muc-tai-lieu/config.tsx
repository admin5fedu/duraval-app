/**
 * Module Configuration for Danh Mục Tài Liệu
 */

import { ModuleConfig } from "@/shared/types/module-config"

export const danhMucTaiLieuConfig: ModuleConfig = {
  // Basic info
  moduleName: "danh-muc-tai-lieu",
  moduleTitle: "Danh Mục Tài Liệu",
  moduleDescription: "Quản lý danh mục và phân loại tài liệu trong hệ thống",
  
  // Routing
  routePath: "/cong-viec/danh-muc-tai-lieu",
  parentPath: "/cong-viec",
  
  // Breadcrumb
  breadcrumb: {
    label: "Danh Mục Tài Liệu",
    parentLabel: "Công Việc",
  },
  
  // Database
  tableName: "tai_lieu_danh_muc_tai_lieu",
  primaryKey: "id",
  
  // List view
  filterColumns: [],
  searchFields: ["hang_muc", "ten_danh_muc", "loai_tai_lieu", "mo_ta"],
  defaultSorting: [{ id: "tg_tao", desc: true }],
}

