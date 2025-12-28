/**
 * Module Configuration for Nhóm Phiếu Hành Chính
 */

import { ModuleConfig } from "@/shared/types/module-config"

export const nhomPhieuHanhChinhConfig: ModuleConfig = {
  // Basic info
  moduleName: "nhom-phieu-hanh-chinh",
  moduleTitle: "Nhóm Phiếu Hành Chính",
  moduleDescription: "Quản lý nhóm các phiếu hành chính",
  
  // Routing
  routePath: "/hanh-chinh-nhan-su/nhom-phieu-hanh-chinh",
  parentPath: "/hanh-chinh-nhan-su",
  
  // Breadcrumb
  breadcrumb: {
    label: "Nhóm Phiếu Hành Chính",
    parentLabel: "Hành Chính Nhân Sự",
  },
  
  // Database
  tableName: "hanh_chinh_nhom_phieu",
  primaryKey: "id",
  
  // List view
  filterColumns: [
    {
      columnId: "loai_phieu",
      title: "Loại Phiếu",
      options: [], // Will be populated dynamically
    },
    {
      columnId: "can_hcns_duyet",
      title: "Cần HCNS Duyệt",
      options: [
        { label: "Có", value: "Có" },
        { label: "Không", value: "Không" },
      ],
    },
    {
      columnId: "ca_toi",
      title: "Ca Tối",
      options: [
        { label: "Có", value: "Có" },
        { label: "Không", value: "Không" },
      ],
    },
  ],
  searchFields: ["loai_phieu", "ma_nhom_phieu", "ten_nhom_phieu"],
  defaultSorting: [{ id: "ma_nhom_phieu", desc: false }],
}

