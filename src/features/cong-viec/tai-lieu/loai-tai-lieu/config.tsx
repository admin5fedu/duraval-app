/**
 * Module Configuration for Loại Tài Liệu
 */

import { ModuleConfig } from "@/shared/types/module-config"

export const loaiTaiLieuConfig: ModuleConfig = {
  // Basic info
  moduleName: "loai-tai-lieu",
  moduleTitle: "Loại Tài Liệu",
  moduleDescription: "Quản lý các loại và phân loại tài liệu trong hệ thống",
  
  // Routing
  routePath: "/cong-viec/loai-tai-lieu",
  parentPath: "/cong-viec",
  
  // Breadcrumb
  breadcrumb: {
    label: "Loại Tài Liệu",
    parentLabel: "Công Việc",
  },
  
  // Database
  tableName: "tai_lieu_loai",
  primaryKey: "id",
  
  // List view
  filterColumns: [],
  searchFields: ["hang_muc", "loai", "mo_ta"],
  defaultSorting: [{ id: "tg_tao", desc: true }],
}

