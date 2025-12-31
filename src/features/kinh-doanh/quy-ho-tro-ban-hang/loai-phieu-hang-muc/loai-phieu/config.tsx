/**
 * Module Configuration for Loại Phiếu
 */

import { ModuleConfig } from "@/shared/types/module-config"

export const loaiPhieuConfig: ModuleConfig = {
  // Basic info
  moduleName: "loai-phieu",
  moduleTitle: "Loại Phiếu",
  moduleDescription: "Quản lý loại phiếu",
  
  // Routing
  routePath: "/kinh-doanh/loai-phieu",
  parentPath: "/kinh-doanh",
  
  // Breadcrumb
  breadcrumb: {
    label: "Loại Phiếu",
    parentLabel: "Kinh Doanh",
  },
  
  // Database
  tableName: "htbh_loai_phieu",
  primaryKey: "id",
  
  // List view
  filterColumns: [
    // Có thể thêm filter theo các field khác nếu cần
    // Ví dụ: filter theo có mô tả / không có mô tả
  ],
  searchFields: ["ten_loai_phieu", "mo_ta"],
  defaultSorting: [{ id: "tg_tao", desc: true }],
}

