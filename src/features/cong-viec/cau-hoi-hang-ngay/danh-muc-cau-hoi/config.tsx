/**
 * Module Configuration for Danh Mục Câu Hỏi
 */

import { ModuleConfig } from "@/shared/types/module-config"

export const danhMucCauHoiConfig: ModuleConfig = {
  // Basic info
  moduleName: "danh-muc-cau-hoi",
  moduleTitle: "Danh Mục Câu Hỏi",
  moduleDescription: "Quản lý danh mục các chủ đề câu hỏi hàng ngày",
  
  // Routing
  routePath: "/cong-viec/danh-muc-cau-hoi",
  parentPath: "/cong-viec",
  
  // Breadcrumb
  breadcrumb: {
    label: "Danh Mục Câu Hỏi",
    parentLabel: "Công Việc",
  },
  
  // Database
  tableName: "chhn_nhom_cau_hoi",
  primaryKey: "id",
  
  // List view
  filterColumns: [],
  searchFields: ["ten_nhom", "mo_ta"],
  defaultSorting: [{ id: "tg_tao", desc: true }],
}

