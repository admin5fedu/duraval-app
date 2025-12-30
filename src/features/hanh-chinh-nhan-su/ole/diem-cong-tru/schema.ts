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
    loai: z.preprocess(
        (val) => (val === "" || val === null ? undefined : val),
        z.string().min(1, "Loại là bắt buộc")
    ),
    nhom: z.string().optional().nullable(),
    diem: z.preprocess(
        (val) => {
            // Cho phép 0, chỉ convert empty string và null thành undefined
            if (val === "" || val === null) return undefined
            // Nếu là 0, giữ nguyên 0
            if (val === 0 || val === "0") return 0
            return val
        },
        z.number({ required_error: "Điểm là bắt buộc", invalid_type_error: "Điểm phải là số" }).min(0, "Điểm không được là số âm")
    ),
    tien: z.preprocess(
        (val) => {
            // Cho phép 0, chỉ convert empty string và null thành undefined
            if (val === "" || val === null) return undefined
            // Nếu là 0, giữ nguyên 0
            if (val === 0 || val === "0") return 0
            return val
        },
        z.number({ required_error: "Tiền là bắt buộc", invalid_type_error: "Tiền phải là số" }).min(0, "Tiền không được là số âm")
    ),
    nhom_luong_id: z.number().optional().nullable(),
    ten_nhom_luong: z.string().optional().nullable(),
    mo_ta: z.preprocess(
        (val) => (val === "" || val === null ? undefined : val),
        z.string().min(1, "Mô tả là bắt buộc")
    ),
    trang_thai: z.string().optional().nullable(),
    trao_doi: z.any().optional().nullable(), // JSONB field
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

