/**
 * Module Configuration for Quỹ Hỗ Trợ Bán Hàng
 */

import { ModuleConfig } from "@/shared/types/module-config"

export const quyHoTroBanHangConfig: ModuleConfig = {
  // Basic info
  moduleName: "quy-ho-tro-ban-hang",
  moduleTitle: "Quỹ Hỗ Trợ Bán Hàng",
  moduleDescription: "Quản lý và theo dõi quỹ hỗ trợ bán hàng",
  
  // Routing
  routePath: "/kinh-doanh/quy-ho-tro-ban-hang/quy-de-xuat-chiet-khau",
  parentPath: "/kinh-doanh",
  
  // Breadcrumb
  breadcrumb: {
    label: "Quỹ Hỗ Trợ Bán Hàng",
    parentLabel: "Kinh Doanh",
  },
}

