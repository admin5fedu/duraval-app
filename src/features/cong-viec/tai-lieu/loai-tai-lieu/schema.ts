import { z } from "zod"

/**
 * Schema matching 'tai_lieu_loai' table in Supabase
 */
export const loaiTaiLieuSchema = z.object({
  id: z.number().optional(),
  hang_muc: z.string().min(1, "Hạng mục là bắt buộc"),
  loai: z.string().min(1, "Loại là bắt buộc"),
  mo_ta: z.string().optional().nullable(),
  nguoi_tao_id: z.number().int("Mã nhân viên phải là số nguyên").optional().nullable(),
  tg_tao: z.string().optional().nullable(),
  tg_cap_nhat: z.string().optional().nullable(),
  nguoi_tao_ten: z.string().optional().nullable(), // Joined from var_nhan_su
})

export type LoaiTaiLieu = z.infer<typeof loaiTaiLieuSchema>

