/**
 * Module Configuration for Kỳ thi
 */

import { ModuleConfig } from "@/shared/types/module-config"

export const kyThiConfig: ModuleConfig = {
  // Basic info
  moduleName: "ky-thi",
  moduleTitle: "Kỳ thi",
  moduleDescription: "Quản lý kỳ thi đào tạo",
  
  // Routing
  routePath: "/cong-viec/ky-thi",
  parentPath: "/cong-viec",
  
  // Breadcrumb
  breadcrumb: {
    label: "Kỳ thi",
    parentLabel: "Đào tạo",
  },
  
  // Database
  tableName: "dao_tao_ky_thi",
  primaryKey: "id",
  
  // List view
  filterColumns: [
    {
      columnId: "trang_thai",
      title: "Trạng Thái",
      options: [
        { label: "Mở", value: "Mở" },
        { label: "Đóng", value: "Đóng" },
      ],
    },
  ],
  searchFields: ["ten_ky_thi", "ghi_chu"],
  defaultSorting: [{ id: "ngay", desc: true }],
}

