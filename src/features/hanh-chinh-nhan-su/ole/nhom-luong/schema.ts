import { z } from "zod"

/**
 * Schema matching 'ole_nhom_luong' table in Supabase
 */
export const nhomLuongSchema = z.object({
    id: z.number().optional(), // Auto-generated, optional for create
    ten_nhom: z.string().min(1, "Tên nhóm là bắt buộc"),
    mo_ta: z.string().optional().nullable(),
    nguoi_tao_id: z.number().optional().nullable(),
    tg_tao: z.string().optional().nullable(),
    tg_cap_nhat: z.string().optional().nullable(),
    // Joined field from var_nhan_su
    nguoi_tao_ten: z.string().optional().nullable(),
    nguoi_tao: z.object({
        ma_nhan_vien: z.number(),
        ho_ten: z.string(),
    }).optional().nullable(),
})

export type NhomLuong = z.infer<typeof nhomLuongSchema>

