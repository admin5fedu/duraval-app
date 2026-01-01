import { z } from "zod"

/**
 * Schema matching 'var_dk_doanh_so' table in Supabase
 */
export const dangKyDoanhSoSchema = z.object({
    id: z.number().optional(), // Auto-generated, optional for create
    nam: z.number().min(1900, "Năm phải từ 1900 trở lên").max(3000, "Năm không được vượt quá 3000"),
    thang: z.number().min(1, "Tháng phải từ 1 đến 12").max(12, "Tháng phải từ 1 đến 12"),
    nhan_vien_id: z.number().min(1, "Nhân viên là bắt buộc"),
    ten_nhan_vien: z.string().optional().nullable(),
    bac_dt: z.string().min(1, "Bậc DT là bắt buộc"),
    doanh_thu: z.number().min(0, "Doanh thu không được âm"),
    nhom_ap_doanh_thu_id: z.number().min(1, "Nhóm áp doanh thu là bắt buộc"),
    ten_nhom_ap_doanh_thu: z.string().optional().nullable(),
    phong_id: z.number().optional().nullable(),
    ma_phong: z.string().optional().nullable(),
    nhom_id: z.number().optional().nullable(),
    ma_nhom: z.string().optional().nullable(),
    mo_ta: z.string().optional().nullable(),
    trao_doi: z.any().optional().nullable(), // jsonb field
    nguoi_tao_id: z.number().optional().nullable(),
    tg_tao: z.string().optional().nullable(),
    tg_cap_nhat: z.string().optional().nullable(),
})

export type DangKyDoanhSo = z.infer<typeof dangKyDoanhSoSchema>

/**
 * Schema for creating new đăng ký doanh số
 */
export type CreateDangKyDoanhSoInput = Omit<DangKyDoanhSo, "id" | "tg_tao" | "tg_cap_nhat" | "nguoi_tao_id">

/**
 * Schema for updating đăng ký doanh số
 */
export type UpdateDangKyDoanhSoInput = Partial<Omit<DangKyDoanhSo, "id" | "tg_tao" | "nguoi_tao_id">>

