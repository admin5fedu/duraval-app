/**
 * Module Configuration for Câu Trả Lời
 */

import { ModuleConfig } from "@/shared/types/module-config"

export const cauTraLoiConfig: ModuleConfig = {
  // Basic info
  moduleName: "cau-tra-loi",
  moduleTitle: "Câu Trả Lời",
  moduleDescription: "Quản lý câu trả lời của nhân viên cho câu hỏi hàng ngày",
  
  // Routing
  routePath: "/cong-viec/cau-tra-loi",
  parentPath: "/cong-viec",
  
  // Breadcrumb
  breadcrumb: {
    label: "Câu Trả Lời",
    parentLabel: "Công Việc",
  },
  
  // Database
  tableName: "chhn_cau_tra_loi",
  primaryKey: "id",
  
  // List view
  filterColumns: [
    {
      columnId: "lich_dang_cau_hoi",
      title: "Lịch Đăng",
      options: [], // Will be populated dynamically from data
    },
    {
      columnId: "ket_qua",
      title: "Kết Quả",
      options: [], // Will be populated dynamically from data
    },
    {
      columnId: "nguoi_tao_ten",
      title: "Người Tạo",
      options: [], // Will be populated dynamically from data
    },
  ],
  searchFields: ["cau_tra_loi", "lich_dang_cau_hoi"],
  defaultSorting: [{ id: "tg_tao", desc: true }],
}

