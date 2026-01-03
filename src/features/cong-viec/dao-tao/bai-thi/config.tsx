/**
 * Module Configuration for Bài thi
 */

import { ModuleConfig } from "@/shared/types/module-config"

export const baiThiConfig: ModuleConfig = {
  // Basic info
  moduleName: "bai-thi",
  moduleTitle: "Bài thi",
  moduleDescription: "Quản lý bài thi đào tạo",
  
  // Routing
  routePath: "/cong-viec/bai-thi",
  parentPath: "/cong-viec",
  
  // Breadcrumb
  breadcrumb: {
    label: "Bài thi",
    parentLabel: "Đào tạo",
  },
  
  // Database
  tableName: "dao_tao_bai_thi",
  primaryKey: "id",
  
  // List view
  filterColumns: [
    {
      columnId: "trang_thai",
      title: "Trạng Thái",
      options: [
        { label: "Chưa thi", value: "Chưa thi" },
        { label: "Đang thi", value: "Đang thi" },
        { label: "Đạt", value: "Đạt" },
        { label: "Không đạt", value: "Không đạt" },
      ],
    },
  ],
  searchFields: [],
  defaultSorting: [{ id: "ngay_lam_bai", desc: true }],
}

