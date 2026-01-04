import { z } from "zod"

/**
 * Base schema matching 'bb_lien_he' table in Supabase
 */
export const nguoiLienHeBaseSchema = z.object({
  id: z.number().optional(), // Auto-generated, optional for create
  khach_buon_id: z.preprocess(
    (val) => {
      if (val === null || val === undefined || val === "") return null
      if (typeof val === 'string') {
        const num = parseFloat(val)
        return isNaN(num) ? null : num
      }
      return typeof val === 'number' ? val : null
    },
    z.number({ required_error: "Khách buôn là bắt buộc", invalid_type_error: "Khách buôn phải là số" }).min(1, "Khách buôn là bắt buộc")
  ),
  ten_khach_buon: z.string().optional().nullable(), // Joined from bb_khach_buon
  vai_tro: z.string().min(1, "Vai trò là bắt buộc"),
  ten_lien_he: z.string().min(1, "Tên liên hệ là bắt buộc"),
  hinh_anh: z.string().optional().nullable(),
  gioi_tinh: z.string().min(1, "Giới tính là bắt buộc"),
  ngay_sinh: z.string().optional().nullable(),
  so_dien_thoai_1: z.string().optional().nullable(),
  so_dien_thoai_2: z.string().optional().nullable(),
  email: z.string().email("Email không hợp lệ").optional().nullable().or(z.literal("")),
  tinh_cach: z.string().optional().nullable(),
  so_thich: z.string().optional().nullable(),
  luu_y_khi_lam_viec: z.string().optional().nullable(),
  ghi_chu_khac: z.string().optional().nullable(),
  nguoi_tao_id: z.number().optional().nullable(),
  tg_tao: z.string().optional().nullable(),
  tg_cap_nhat: z.string().optional().nullable(),
})

/**
 * Schema with validation rules
 */
export const nguoiLienHeSchema = nguoiLienHeBaseSchema

export type NguoiLienHe = z.infer<typeof nguoiLienHeSchema>

/**
 * Schema for creating new người liên hệ
 */
export type CreateNguoiLienHeInput = Omit<NguoiLienHe, "id" | "tg_tao" | "tg_cap_nhat" | "ten_khach_buon"> & {
  nguoi_tao_id?: number | null
}

/**
 * Schema for updating người liên hệ
 */
export type UpdateNguoiLienHeInput = Partial<Omit<NguoiLienHe, "id" | "tg_tao" | "nguoi_tao_id" | "ten_khach_buon">>

