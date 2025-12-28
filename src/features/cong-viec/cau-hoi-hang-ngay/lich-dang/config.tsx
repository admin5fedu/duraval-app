/**
 * Module Configuration for Lịch Đăng
 */

import { ModuleConfig } from "@/shared/types/module-config"

export const lichDangConfig: ModuleConfig = {
  // Basic info
  moduleName: "lich-dang",
  moduleTitle: "Lịch Đăng",
  moduleDescription: "Lên lịch và quản lý thời gian đăng câu hỏi hàng ngày",
  
  // Routing
  routePath: "/cong-viec/lich-dang",
  parentPath: "/cong-viec",
  
  // Breadcrumb
  breadcrumb: {
    label: "Lịch Đăng",
    parentLabel: "Công Việc",
  },
  
  // Database
  tableName: "chhn_lich_dang_bai",
  primaryKey: "id",
  
  // List view
  filterColumns: [
    {
      columnId: "nhom_cau_hoi_ten",
      title: "Nhóm Câu Hỏi",
      options: [], // Will be populated dynamically from data
    },
    {
      columnId: "ngay_dang",
      title: "Ngày Đăng",
      options: [], // Will be populated dynamically from data
    },
    {
      columnId: "chuc_vu_ap_dung",
      title: "Chức Vụ Áp Dụng",
      options: [], // Will be populated dynamically from chucVu
    },
    {
      columnId: "nguoi_tao_ten",
      title: "Người Tạo",
      options: [], // Will be populated dynamically from data
    },
  ],
  searchFields: ["cau_hoi", "dap_an_1", "dap_an_2", "dap_an_3", "dap_an_4"],
  defaultSorting: [{ id: "ngay_dang", desc: true }],
}

