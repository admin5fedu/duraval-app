/**
 * Module Configuration for Quỹ HTBH theo tháng
 */

import { ModuleConfig } from "@/shared/types/module-config"

export const quyHTBHTheoThangConfig: ModuleConfig = {
  // Basic info
  moduleName: "quy-htbh-theo-thang",
  moduleTitle: "Quỹ HTBH theo tháng",
  moduleDescription: "Xem chi tiết quỹ hỗ trợ bán hàng theo từng tháng",
  
  // Routing
  routePath: "/kinh-doanh/quy-htbh-theo-thang",
  parentPath: "/kinh-doanh",
  
  // Breadcrumb
  breadcrumb: {
    label: "Quỹ HTBH theo tháng",
    parentLabel: "Kinh Doanh",
  },
  
  // Database
  tableName: "htbh_quy_htbh",
  primaryKey: "id",
  
  // List view
  searchFields: ["ten_nhan_vien", "ma_phong", "ma_nhom", "quy", "ghi_chu"],
  defaultSorting: [{ id: "tg_tao", desc: true }],
}
