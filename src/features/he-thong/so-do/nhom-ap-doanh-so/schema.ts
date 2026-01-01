import { z } from "zod"

/**
 * Schema matching 'var_nhom_ap_doanh_so' table in Supabase
 */
export const nhomApDoanhSoSchema = z.object({
    id: z.number().optional(), // Auto-generated, optional for create
    ma_nhom_ap: z.string().min(1, "Mã nhóm áp là bắt buộc"),
    ten_nhom_ap: z.string().min(1, "Tên nhóm áp là bắt buộc"),
    mo_ta: z.string().optional().nullable(),
    nguoi_tao_id: z.number().optional().nullable(),
    tg_tao: z.string().optional().nullable(),
    tg_cap_nhat: z.string().optional().nullable(),
})

export type NhomApDoanhSo = z.infer<typeof nhomApDoanhSoSchema>

/**
 * Schema for creating new nhóm áp doanh số
 */
export type CreateNhomApDoanhSoInput = Omit<NhomApDoanhSo, "id" | "tg_tao" | "tg_cap_nhat" | "nguoi_tao_id">

/**
 * Schema for updating nhóm áp doanh số
 */
export type UpdateNhomApDoanhSoInput = Partial<Omit<NhomApDoanhSo, "id" | "tg_tao" | "nguoi_tao_id">>

