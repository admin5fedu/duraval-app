import { z } from "zod"

/**
 * Schema matching 'chhn_nhom_cau_hoi' table in Supabase
 */
export const danhMucCauHoiSchema = z.object({
  id: z.number().optional(),
  ten_nhom: z.string().min(1, "Tên nhóm là bắt buộc"),
  mo_ta: z.string().optional().nullable(),
  nguoi_tao_id: z.number().int("Mã nhân viên phải là số nguyên"),
  tg_tao: z.string().optional().nullable(),
  tg_cap_nhat: z.string().optional().nullable(),
  nguoi_tao_ten: z.string().optional().nullable(), // Joined from var_nhan_su
})

export type DanhMucCauHoi = z.infer<typeof danhMucCauHoiSchema>

