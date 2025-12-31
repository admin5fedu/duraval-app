/**
 * Module Configuration for Loại Doanh Thu
 */

import { ModuleConfig } from "@/shared/types/module-config"

export const loaiDoanhThuConfig: ModuleConfig = {
  // Basic info
  moduleName: "loai-doanh-thu",
  moduleTitle: "Loại Doanh Thu",
  moduleDescription: "Quản lý loại doanh thu",
  
  // Routing
  routePath: "/kinh-doanh/loai-doanh-thu",
  parentPath: "/kinh-doanh",
  
  // Breadcrumb
  breadcrumb: {
    label: "Loại Doanh Thu",
    parentLabel: "Kinh Doanh",
  },
  
  // Database
  tableName: "htbh_loai_doanh_thu",
  primaryKey: "id",
  
  // List view
  filterColumns: [
    // Có thể thêm filter theo các field khác nếu cần
  ],
  searchFields: ["ten_doanh_thu", "mo_ta"],
  defaultSorting: [{ id: "tg_tao", desc: true }],
}

