import { z } from "zod"

/**
 * Schema matching 'bb_giai_doan' table in Supabase
 */
export const giaiDoanKhachBuonSchema = z.object({
  id: z.number().optional(), // Auto-generated, optional for create
  ma_giai_doan: z.string().optional().nullable(),
  ten_giai_doan: z.string().min(1, "Tên giai đoạn là bắt buộc"),
  tt: z.preprocess(
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
  mo_ta: z.string().optional().nullable(),
  nguoi_tao_id: z.number().optional().nullable(),
  nguoi_tao_ten: z.string().optional().nullable(), // Joined from var_nhan_su
  tg_tao: z.string().optional().nullable(),
  tg_cap_nhat: z.string().optional().nullable(),
})

export type GiaiDoanKhachBuon = z.infer<typeof giaiDoanKhachBuonSchema>

/**
 * Schema for creating new giai đoạn khách buôn
 */
export type CreateGiaiDoanKhachBuonInput = Omit<GiaiDoanKhachBuon, "id" | "tg_tao" | "tg_cap_nhat"> & {
  nguoi_tao_id?: number | null
}

/**
 * Schema for updating giai đoạn khách buôn
 */
export type UpdateGiaiDoanKhachBuonInput = Partial<Omit<GiaiDoanKhachBuon, "id" | "tg_tao" | "nguoi_tao_id">>

