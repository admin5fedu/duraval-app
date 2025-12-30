/**
 * Module Configuration for Chấm OLE
 */

import { ModuleConfig } from "@/shared/types/module-config"

export const chamOleConfig: ModuleConfig = {
  // Basic info
  moduleName: "cham-ole",
  moduleTitle: "Chấm OLE",
  moduleDescription: "Quản lý chấm điểm OLE nhân viên",
  
  // Routing
  routePath: "/hanh-chinh-nhan-su/cham-ole",
  parentPath: "/hanh-chinh-nhan-su",
  
  // Breadcrumb
  breadcrumb: {
    label: "Chấm OLE",
    parentLabel: "Hành Chính Nhân Sự",
  },
  
  // Database
  tableName: "ole_cham_diem",
  primaryKey: "id",
  
  // List view
  filterColumns: [
    {
      columnId: "nhan_vien_id",
      title: "Nhân Viên",
      options: [], // Will be populated dynamically
    },
    {
      columnId: "phong_id",
      title: "Phòng",
      options: [], // Will be populated dynamically
    },
    {
      columnId: "chuc_vu_id",
      title: "Chức Vụ",
      options: [], // Will be populated dynamically
    },
    {
      columnId: "danh_gia",
      title: "Đánh Giá",
      options: [
        { label: "Đạt", value: "Đạt" },
        { label: "Không đạt", value: "Không đạt" },
      ],
    },
    {
      columnId: "nam",
      title: "Năm",
      options: [], // Will be populated dynamically
    },
    {
      columnId: "thang",
      title: "Tháng",
      options: [], // Will be populated dynamically
    },
  ],
  searchFields: ["danh_gia", "ghi_chu"],
  defaultSorting: [{ id: "nam", desc: true }, { id: "thang", desc: true }],
}

