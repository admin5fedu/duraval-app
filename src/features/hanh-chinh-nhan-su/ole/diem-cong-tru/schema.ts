import { z } from "zod"

/**
 * Schema matching 'ole_diem_cong_tru' table in Supabase
 */
export const diemCongTruSchema = z.object({
    id: z.number().optional(), // Auto-generated, optional for create
    nhan_vien_id: z.number().optional().nullable(),
    ho_va_ten: z.string().optional().nullable(),
    ngay: z.string().optional().nullable(), // date
    ma_phong_id: z.number().optional().nullable(),
    phong_ban_id: z.number().optional().nullable(),
    loai: z.string().optional().nullable(),
    nhom: z.string().optional().nullable(),
    diem: z.number().default(0).optional().nullable(),
    tien: z.number().default(0).optional().nullable(),
    nhom_luong_id: z.number().optional().nullable(),
    ten_nhom_luong: z.string().optional().nullable(),
    mo_ta: z.string().optional().nullable(),
    trang_thai: z.string().optional().nullable(),
    nguoi_tao_id: z.number().optional().nullable(),
    tg_tao: z.string().optional().nullable(),
    tg_cap_nhat: z.string().optional().nullable(),
    // Joined fields from related tables
    nhan_vien: z.object({
        ma_nhan_vien: z.number(),
        ho_ten: z.string(),
    }).optional().nullable(),
    phong_ban: z.object({
        id: z.number(),
        ma_phong_ban: z.string(),
        ten_phong_ban: z.string(),
    }).optional().nullable(),
    nhom_luong: z.object({
        id: z.number(),
        ten_nhom: z.string(),
    }).optional().nullable(),
    nguoi_tao: z.object({
        ma_nhan_vien: z.number(),
        ho_ten: z.string(),
    }).optional().nullable(),
})

export type DiemCongTru = z.infer<typeof diemCongTruSchema>

