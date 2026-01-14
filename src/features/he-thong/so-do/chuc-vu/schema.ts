import { z } from "zod"

/**
 * Schema matching 'var_chuc_vu' table in Supabase
 */
export const chucVuSchema = z.object({
    id: z.number().optional(), // Auto-generated, optional for create
    ma_chuc_vu: z.string().min(1, "Mã chức vụ là bắt buộc"),
    ten_chuc_vu: z.string().min(1, "Tên chức vụ là bắt buộc"),
    cap_bac: z.number().optional().nullable(),
    ten_cap_bac: z.string().optional().nullable(),
    ma_phong_ban: z.string().min(1, "Mã phòng ban là bắt buộc"),
    ngach_luong: z.string().optional().nullable(),
    muc_dong_bao_hiem: z.number().optional().nullable(),
    so_ngay_nghi_thu_7: z.string().optional().nullable(),
    nhom_thuong: z.string().optional().nullable(),
    diem_thuong: z.number().optional().nullable(),
    tg_tao: z.string().optional().nullable(),
    tg_cap_nhat: z.string().optional().nullable(),
    phong_ban_id: z.number().optional().nullable(),
    cap_bac_id: z.number().optional().nullable(),
})

export type ChucVu = z.infer<typeof chucVuSchema>

/**
 * Schema for creating new chức vụ
 */
export type CreateChucVuInput = Omit<ChucVu, "id" | "tg_tao" | "tg_cap_nhat">

/**
 * Schema for updating chức vụ
 */
export type UpdateChucVuInput = Partial<Omit<ChucVu, "id" | "tg_tao">>

