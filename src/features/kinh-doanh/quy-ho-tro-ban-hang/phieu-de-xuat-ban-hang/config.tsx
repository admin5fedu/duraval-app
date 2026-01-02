/**
 * Module Configuration for Phiếu đề xuất bán hàng
 */

import { ModuleConfig } from "@/shared/types/module-config"

export const phieuDeXuatBanHangConfig: ModuleConfig = {
  // Basic info
  moduleName: "phieu-de-xuat-ban-hang",
  moduleTitle: "Phiếu đề xuất bán hàng",
  moduleDescription: "Quản lý phiếu đề xuất bán hàng",
  
  // Routing
  routePath: "/kinh-doanh/phieu-de-xuat-ban-hang",
  parentPath: "/kinh-doanh",
  
  // Breadcrumb
  breadcrumb: {
    label: "Phiếu đề xuất bán hàng",
    parentLabel: "Kinh Doanh",
  },
  
  // Database
  tableName: "htbh_de_xuat_chiet_khau",
  primaryKey: "id",
  
  // List view
  searchFields: ["ten_nhan_vien", "so_hoa_don", "ten_loai_phieu", "ten_hang_muc", "mo_ta"],
  defaultSorting: [{ id: "tg_tao", desc: true }],
}

