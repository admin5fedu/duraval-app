import { z } from "zod"

/**
 * Base schema matching 'bb_khach_buon' table in Supabase (without refine)
 */
export const danhSachKBBaseSchema = z.object({
  id: z.number().optional(), // Auto-generated, optional for create
  ma_so: z.string().optional().nullable(),
  ten_khach_buon: z.string().min(1, "Tên khách buôn là bắt buộc"),
  loai_khach: z.string().min(1, "Loại khách là bắt buộc"),
  nguon: z.string().min(1, "Nguồn là bắt buộc"),
  nam_thanh_lap: z.preprocess(
    (val) => {
      if (val === null || val === undefined || val === "") return null
      if (typeof val === 'string') {
        const num = parseInt(val, 10)
        return isNaN(num) ? null : num
      }
      return typeof val === 'number' ? val : null
    },
    z.number().int().nullable().optional()
  ),
  hinh_anh: z.string().optional().nullable(),
  so_dien_thoai_1: z.string().min(1, "Số điện thoại 1 là bắt buộc"),
  so_dien_thoai_2: z.string().optional().nullable(),
  nhom_nganh: z.string().min(1, "Nhóm ngành là bắt buộc"),
  link_group_zalo: z.string().optional().nullable(),
  mien: z.string().optional().nullable(),
  
  // Địa chỉ TSN (Trước sát nhập)
  tsn_tinh_thanh_id: z.preprocess(
    (val) => {
      if (val === null || val === undefined || val === "") return null
      if (typeof val === 'string') {
        const num = parseFloat(val)
        return isNaN(num) ? null : num
      }
      return typeof val === 'number' ? val : null
    },
    z.number().nullable().optional()
  ),
  tsn_ten_tinh_thanh: z.string().optional().nullable(),
  tsn_quan_huyen_id: z.preprocess(
    (val) => {
      if (val === null || val === undefined || val === "") return null
      if (typeof val === 'string') {
        const num = parseFloat(val)
        return isNaN(num) ? null : num
      }
      return typeof val === 'number' ? val : null
    },
    z.number().nullable().optional()
  ),
  tsn_ten_quan_huyen: z.string().optional().nullable(),
  tsn_phuong_xa_id: z.preprocess(
    (val) => {
      if (val === null || val === undefined || val === "") return null
      if (typeof val === 'string') {
        const num = parseFloat(val)
        return isNaN(num) ? null : num
      }
      return typeof val === 'number' ? val : null
    },
    z.number().nullable().optional()
  ),
  tsn_ten_phuong_xa: z.string().optional().nullable(),
  tsn_so_nha: z.string().optional().nullable(),
  tsn_dia_chi_day_du: z.string().optional().nullable(),
  
  // Địa chỉ SSN (Sau sát nhập)
  ssn_tinh_thanh_id: z.preprocess(
    (val) => {
      if (val === null || val === undefined || val === "") return null
      if (typeof val === 'string') {
        const num = parseFloat(val)
        return isNaN(num) ? null : num
      }
      return typeof val === 'number' ? val : null
    },
    z.number().nullable().optional()
  ),
  ssn_ten_tinh_thanh: z.string().optional().nullable(),
  ssn_phuong_xa_id: z.preprocess(
    (val) => {
      if (val === null || val === undefined || val === "") return null
      if (typeof val === 'string') {
        const num = parseFloat(val)
        return isNaN(num) ? null : num
      }
      return typeof val === 'number' ? val : null
    },
    z.number().nullable().optional()
  ),
  ssn_ten_phuong_xa: z.string().optional().nullable(),
  ssn_so_nha: z.string().optional().nullable(),
  ssn_dia_chi_day_du: z.string().optional().nullable(),
  
  dinh_vi_gps: z.string().optional().nullable(),
  
  // Foreign keys
  giai_doan_id: z.preprocess(
    (val) => {
      if (val === null || val === undefined || val === "") return null
      if (typeof val === 'string') {
        const num = parseFloat(val)
        return isNaN(num) ? null : num
      }
      return typeof val === 'number' ? val : null
    },
    z.number().min(1, "Giai đoạn là bắt buộc")
  ),
  ten_giai_doan: z.string().optional().nullable(), // Joined from bb_giai_doan
  ma_giai_doan: z.string().optional().nullable(), // Joined from bb_giai_doan
  trang_thai_id: z.preprocess(
    (val) => {
      if (val === null || val === undefined || val === "") return null
      if (typeof val === 'string') {
        const num = parseFloat(val)
        return isNaN(num) ? null : num
      }
      return typeof val === 'number' ? val : null
    },
    z.number().min(1, "Trạng thái là bắt buộc")
  ),
  ten_trang_thai: z.string().optional().nullable(), // Joined from bb_trang_thai
  ma_trang_thai: z.string().optional().nullable(), // Joined from bb_trang_thai
  
  tele_sale_id: z.preprocess(
    (val) => {
      if (val === null || val === undefined || val === "") return null
      if (typeof val === 'string') {
        const num = parseFloat(val)
        return isNaN(num) ? null : num
      }
      return typeof val === 'number' ? val : null
    },
    z.number().nullable().optional()
  ),
  ten_tele_sale: z.string().optional().nullable(),
  thi_truong_id: z.preprocess(
    (val) => {
      if (val === null || val === undefined || val === "") return null
      if (typeof val === 'string') {
        const num = parseFloat(val)
        return isNaN(num) ? null : num
      }
      return typeof val === 'number' ? val : null
    },
    z.number().nullable().optional()
  ),
  ten_thi_truong: z.string().optional().nullable(),
  
  nguoi_tao_id: z.number().optional().nullable(),
  nguoi_tao_ten: z.string().optional().nullable(), // Enriched field from var_nhan_su
  quy_mo: z.string().optional().nullable(),
  ghi_chu: z.string().optional().nullable(),
  tg_tao: z.string().optional().nullable(),
  tg_cap_nhat: z.string().optional().nullable(),
})

/**
 * Schema with validation rules (with refine)
 */
export const danhSachKBSchema = danhSachKBBaseSchema.refine(data => data.tele_sale_id !== null || data.thi_truong_id !== null, {
  message: "Phải điền ít nhất một trong hai trường: Tele Sale hoặc Thị Trường",
  path: ["tele_sale_id"], // Attach error to tele_sale_id field
})

export type DanhSachKB = z.infer<typeof danhSachKBSchema>

/**
 * Schema for creating new khách buôn
 */
export type CreateDanhSachKBInput = Omit<DanhSachKB, "id" | "tg_tao" | "tg_cap_nhat" | "ten_giai_doan" | "ten_trang_thai" | "ten_tele_sale" | "ten_thi_truong" | "tsn_ten_tinh_thanh" | "tsn_ten_quan_huyen" | "tsn_ten_phuong_xa" | "ssn_ten_tinh_thanh" | "ssn_ten_phuong_xa"> & {
  nguoi_tao_id?: number | null
}

/**
 * Schema for updating khách buôn
 */
export type UpdateDanhSachKBInput = Partial<Omit<DanhSachKB, "id" | "tg_tao" | "nguoi_tao_id" | "ten_giai_doan" | "ten_trang_thai" | "ten_tele_sale" | "ten_thi_truong" | "tsn_ten_tinh_thanh" | "tsn_ten_quan_huyen" | "tsn_ten_phuong_xa" | "ssn_ten_tinh_thanh" | "ssn_ten_phuong_xa">>

