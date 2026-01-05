import { z } from "zod"

/**
 * Base schema matching 'bb_ke_hoach_thi_truong' table in Supabase
 */
export const keHoachThiTruongBaseSchema = z.object({
  id: z.number().optional(), // Auto-generated, optional for create
  ngay: z.string().min(1, "Ngày là bắt buộc"),
  nhan_vien_id: z.preprocess(
    (val) => {
      if (val === null || val === undefined || val === "") return null
      if (typeof val === 'string') {
        const num = parseFloat(val)
        return isNaN(num) ? null : num
      }
      return typeof val === 'number' ? val : null
    },
    z.number().min(1, "Nhân viên là bắt buộc")
  ),
  buoi: z.string().min(1, "Buổi là bắt buộc"),
  hanh_dong: z.string().min(1, "Hành động là bắt buộc"),
  khach_buon_id: z.preprocess(
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
  muc_tieu: z.string().min(1, "Mục tiêu là bắt buộc"),
  ghi_chu: z.string().optional().nullable(),
  trang_thai: z.string().optional().nullable(),
  nguoi_tao_id: z.number().optional().nullable(),
  tg_tao: z.string().optional().nullable(),
  tg_cap_nhat: z.string().optional().nullable(),
  // Enriched fields from related tables (optional, not in DB)
  ten_nhan_vien: z.string().optional().nullable(), // Format: "mã - tên" or just "tên"
  ma_nhan_vien: z.number().optional().nullable(), // For display
  ten_khach_buon: z.string().optional().nullable(),
  ten_tinh_thanh: z.string().optional().nullable(),
  ten_nguoi_tao: z.string().optional().nullable(), // Format: "mã - tên" or just "tên"
  ma_nguoi_tao: z.number().optional().nullable(), // For display
})

/**
 * Schema with validation rules
 */
export const keHoachThiTruongSchema = keHoachThiTruongBaseSchema

export type KeHoachThiTruong = z.infer<typeof keHoachThiTruongSchema>

/**
 * Schema for creating new kế hoạch thị trường
 */
export type CreateKeHoachThiTruongInput = Omit<KeHoachThiTruong, "id" | "tg_tao" | "tg_cap_nhat"> & {
  nguoi_tao_id?: number | null
}

/**
 * Schema for updating kế hoạch thị trường
 */
export type UpdateKeHoachThiTruongInput = Partial<Omit<KeHoachThiTruong, "id" | "tg_tao" | "nguoi_tao_id">>

