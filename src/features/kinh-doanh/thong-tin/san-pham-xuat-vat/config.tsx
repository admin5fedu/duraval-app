/**
 * Module Configuration for Sản phẩm xuất VAT
 */

import { ModuleConfig } from "@/shared/types/module-config"

export const sanPhamXuatVatConfig: ModuleConfig = {
  // Basic info
  moduleName: "san-pham-xuat-vat",
  moduleTitle: "Sản phẩm xuất VAT",
  moduleDescription: "Danh sách sản phẩm xuất VAT",
  
  // Routing
  routePath: "/kinh-doanh/san-pham-xuat-vat",
  parentPath: "/kinh-doanh",
  
  // Breadcrumb
  breadcrumb: {
    label: "Sản phẩm xuất VAT",
    parentLabel: "Kinh Doanh",
  },
  
  // Database (not applicable - external API)
  tableName: "",
  primaryKey: "index",
  
  // List view
  searchFields: ["ma_hang", "ten_hang_hoa", "dvt", "so_luong_ton", "gia_xuat", "thue_suat", "loai_san_pham"],
  defaultSorting: [{ id: "ma_hang", desc: false }],
}

