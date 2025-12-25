/**
 * Module Configuration for Danh Sách Nhân Sự
 */

export const nhanSuConfig = {
  moduleName: "danh-sach-nhan-su",
  moduleTitle: "Danh Sách Nhân Sự",
  moduleDescription: "Quản lý hồ sơ và tài khoản nhân viên",
  tableName: "var_nhan_su",
  primaryKey: "ma_nhan_vien",
  routePath: "/he-thong/danh-sach-nhan-su",
  parentPath: "/he-thong",
  // Filter columns for faceted filters
  filterColumns: [
    {
      columnId: "tinh_trang",
      title: "Tình Trạng",
      options: [
        { label: "Thử việc", value: "Thử việc" },
        { label: "Chính thức", value: "Chính thức" },
        { label: "Nghỉ việc", value: "Nghỉ việc" },
        { label: "Tạm nghỉ", value: "Tạm nghỉ" },
      ],
    },
    {
      columnId: "phong_ban",
      title: "Phòng Ban",
      options: [], // Will be populated dynamically
    },
  ],
  // Search fields
  searchFields: ["ho_ten", "email_cong_ty", "email_ca_nhan", "so_dien_thoai", "ma_nhan_vien"],
  // Default sorting
  defaultSorting: [{ id: "ma_nhan_vien", desc: true }],
} as const

