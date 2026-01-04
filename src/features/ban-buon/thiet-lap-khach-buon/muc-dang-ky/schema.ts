import { z } from "zod"

/**
 * Schema matching 'bb_muc_dang_ky' table in Supabase
 */
export const mucDangKySchema = z.object({
  id: z.number().optional(), // Auto-generated, optional for create
  ma_hang: z.string().optional().nullable(),
  ten_hang: z.string().min(1, "Tên hạng là bắt buộc"),
  doanh_so_min_quy: z.preprocess(
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
  doanh_so_max_quy: z.preprocess(
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
  doanh_so_min_nam: z.preprocess(
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
  doanh_so_max_nam: z.preprocess(
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
  ghi_chu: z.string().optional().nullable(),
  nguoi_tao_id: z.number().optional().nullable(),
  nguoi_tao_ten: z.string().optional().nullable(), // Joined from var_nhan_su
  tg_tao: z.string().optional().nullable(),
  tg_cap_nhat: z.string().optional().nullable(),
})

export type MucDangKy = z.infer<typeof mucDangKySchema>

/**
 * Schema for creating new mức đăng ký
 */
export type CreateMucDangKyInput = Omit<MucDangKy, "id" | "tg_tao" | "tg_cap_nhat" | "nguoi_tao_ten"> & {
  nguoi_tao_id?: number | null
}

/**
 * Schema for updating mức đăng ký
 */
export type UpdateMucDangKyInput = Partial<Omit<MucDangKy, "id" | "tg_tao" | "nguoi_tao_id" | "nguoi_tao_ten">>

