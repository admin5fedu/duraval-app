/**
 * Module Configuration for Điểm Cộng Trừ
 */

import { ModuleConfig } from "@/shared/types/module-config"

export const diemCongTruConfig: ModuleConfig = {
  // Basic info
  moduleName: "diem-cong-tru",
  moduleTitle: "Điểm Cộng Trừ",
  moduleDescription: "Quản lý điểm cộng trừ nhân viên",
  
  // Routing
  routePath: "/hanh-chinh-nhan-su/diem-cong-tru",
  parentPath: "/hanh-chinh-nhan-su",
  
  // Breadcrumb
  breadcrumb: {
    label: "Điểm Cộng Trừ",
    parentLabel: "Hành Chính Nhân Sự",
  },
  
  // Database
  tableName: "ole_diem_cong_tru",
  primaryKey: "id",
  
  // List view
  filterColumns: [
    {
      columnId: "phong_ban_id",
      title: "Phòng Ban",
      options: [], // Will be populated dynamically
    },
    {
      columnId: "loai",
      title: "Loại",
      options: [], // Will be populated dynamically
    },
    {
      columnId: "ngay",
      title: "Ngày",
      options: [], // Will be populated dynamically
    },
    {
      columnId: "trang_thai",
      title: "Trạng Thái",
      options: [
        { label: "Chờ xác nhận", value: "Chờ xác nhận" },
        { label: "Đã xác nhận", value: "Đã xác nhận" },
      ],
    },
  ],
  searchFields: ["ho_va_ten", "mo_ta", "loai", "nhom"],
  defaultSorting: [{ id: "ngay", desc: true }],
}

