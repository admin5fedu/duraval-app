/**
 * Module Configuration for Trục Hạt
 */

import { ModuleConfig } from "@/shared/types/module-config"

export const trucHatConfig: ModuleConfig = {
  // Basic info
  moduleName: "truc-hat",
  moduleTitle: "Trục Hạt",
  moduleDescription: "Quản lý trục hạt",
  
  // Routing
  routePath: "/marketing/truc-hat",
  parentPath: "/marketing",
  
  // Breadcrumb
  breadcrumb: {
    label: "Trục Hạt",
    parentLabel: "Marketing",
  },
  
  // Database
  tableName: "kt_truc_hat",
  primaryKey: "id",
  
  // List view
  filterColumns: [
    {
      columnId: "ngay",
      title: "Ngày",
      options: [], // Will be populated dynamically
    },
    {
      columnId: "trang_thai",
      title: "Trạng Thái",
      options: [
        { label: "Mới", value: "Mới" },
        { label: "Đang vẽ", value: "Đang vẽ" },
        { label: "Đã đặt", value: "Đã đặt" },
        { label: "Đang về", value: "Đang về" },
        { label: "Chờ kiểm tra", value: "Chờ kiểm tra" },
        { label: "Chờ sửa", value: "Chờ sửa" },
        { label: "Chờ giao", value: "Chờ giao" },
        { label: "Đã giao", value: "Đã giao" },
      ],
    },
    {
      columnId: "nhan_vien_bh_id",
      title: "Nhân Viên BH",
      options: [], // Will be populated dynamically
    },
    {
      columnId: "nguoi_tao_id",
      title: "Người Tạo",
      options: [], // Will be populated dynamically
    },
  ],
  searchFields: ["ma_truc", "khach_hang", "ghi_chu"],
  defaultSorting: [{ id: "tg_tao", desc: true }],
}

