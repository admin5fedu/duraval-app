/**
 * Module Configuration for Tổng quan quỹ HTBH
 */

import { ModuleConfig } from "@/shared/types/module-config"

export const tongQuanQuyHTBHConfig: ModuleConfig = {
  // Basic info
  moduleName: "tong-quan-quy-htbh",
  moduleTitle: "Tổng quan quỹ HTBH",
  moduleDescription: "Xem tổng quan về quỹ hỗ trợ bán hàng",
  
  // Routing
  routePath: "/kinh-doanh/tong-quan-quy-htbh",
  parentPath: "/kinh-doanh",
  
  // Breadcrumb
  breadcrumb: {
    label: "Tổng quan quỹ HTBH",
    parentLabel: "Kinh Doanh",
  },
}
