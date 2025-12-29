/**
 * Module Configuration for Phiếu Hành Chính
 */

import { ModuleConfig } from "@/shared/types/module-config"

export const phieuHanhChinhConfig: ModuleConfig = {
  // Basic info
  moduleName: "phieu-hanh-chinh",
  moduleTitle: "Phiếu Hành Chính",
  moduleDescription: "Quản lý các phiếu hành chính",
  
  // Routing
  routePath: "/hanh-chinh-nhan-su/phieu-hanh-chinh",
  parentPath: "/hanh-chinh-nhan-su",
  
  // Breadcrumb
  breadcrumb: {
    label: "Phiếu Hành Chính",
    parentLabel: "Hành Chính Nhân Sự",
  },
  
  // Database
  tableName: "hanh_chinh_phieu_hanh_chinh",
  primaryKey: "id",
  
  // List view
  filterColumns: [
    {
      columnId: "ngay",
      title: "Ngày",
      options: [], // Will be populated dynamically from data
    },
    {
      columnId: "ma_phieu",
      title: "Mã Phiếu",
      options: [], // Will be populated dynamically from data
    },
    {
      columnId: "loai_phieu",
      title: "Loại Phiếu",
      options: [], // Will be populated dynamically
    },
    {
      columnId: "trang_thai",
      title: "Trạng Thái",
      options: [
        { label: "Chờ duyệt", value: "Chờ duyệt" },
        { label: "Đã duyệt", value: "Đã duyệt" },
        { label: "Từ chối", value: "Từ chối" },
      ],
    },
    {
      columnId: "quan_ly_duyet",
      title: "Quản Lý Duyệt",
      options: [
        { label: "Đã duyệt", value: "true" },
        { label: "Chưa duyệt", value: "false" },
      ],
    },
    {
      columnId: "hcns_duyet",
      title: "HCNS Duyệt",
      options: [
        { label: "Đã duyệt", value: "true" },
        { label: "Chưa duyệt", value: "false" },
      ],
    },
    {
      columnId: "nguoi_tao_id",
      title: "Người Tạo",
      options: [], // Will be populated dynamically
    },
  ],
  searchFields: ["loai_phieu", "ma_phieu", "ly_do"],
  defaultSorting: [{ id: "ngay", desc: true }],
}

