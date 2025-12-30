/**
 * Module Configuration for Phản Hồi Khách Hàng
 */

import { ModuleConfig } from "@/shared/types/module-config"

export const phanHoiKhachHangConfig: ModuleConfig = {
  // Basic info
  moduleName: "phan-hoi-khach-hang",
  moduleTitle: "Phản Hồi Khách Hàng",
  moduleDescription: "Quản lý phản hồi và góp ý từ khách hàng",
  
  // Routing
  routePath: "/marketing/phan-hoi-khach-hang",
  parentPath: "/marketing",
  
  // Breadcrumb
  breadcrumb: {
    label: "Phản Hồi Khách Hàng",
    parentLabel: "Marketing",
  },
  
  // Database
  tableName: "cskh_phan_hoi_kh",
  primaryKey: "id",
  
  // List view
  filterColumns: [
    {
      columnId: "ngay",
      title: "Ngày",
      options: [], // Will be populated dynamically
    },
    {
      columnId: "nguoi_tao_id",
      title: "Người Tạo",
      options: [], // Will be populated dynamically
    },
    {
      columnId: "trang_thai",
      title: "Trạng Thái",
      options: [
        { label: "Mới", value: "Mới" },
        { label: "Đang xử lý", value: "Đang xử lý" },
        { label: "Hoàn thành", value: "Hoàn thành" },
        { label: "Đã hủy", value: "Đã hủy" },
      ],
    },
    {
      columnId: "loai_loi",
      title: "Loại",
      options: [
        { label: "Chất lượng SP", value: "Chất lượng SP" },
        { label: "Hỏng lỗi", value: "Hỏng lỗi" },
        { label: "Chăm sóc", value: "Chăm sóc" },
        { label: "Giao hàng", value: "Giao hàng" },
        { label: "Bảo hành / Bảo trì", value: "Bảo hành / Bảo trì" },
        { label: "Giá cả", value: "Giá cả" },
        { label: "Hóa đơn", value: "Hóa đơn" },
        { label: "Khác", value: "Khác" },
      ],
    },
    {
      columnId: "muc_do",
      title: "Mức Độ",
      options: [
        { label: "Nghiêm trọng", value: "Nghiêm trọng" },
        { label: "Bình thường", value: "Bình thường" },
        { label: "Thấp", value: "Thấp" },
      ],
    },
    {
      columnId: "kt_phu_trach",
      title: "KT Phụ Trách",
      options: [], // Will be populated dynamically
    },
    {
      columnId: "trang_thai_don_hoan",
      title: "Trạng Thái Đơn Hoàn",
      options: [], // Will be populated dynamically
    },
  ],
  searchFields: ["ten_san_pham", "id_don_hang", "sdt_khach", "loai_loi", "ten_loi"],
  defaultSorting: [{ id: "tg_tao", desc: true }],
}

