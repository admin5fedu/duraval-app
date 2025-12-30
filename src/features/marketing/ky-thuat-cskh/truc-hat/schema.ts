import { z } from "zod"

/**
 * Schema matching 'kt_truc_hat' table in Supabase
 */
export const trucHatSchema = z.object({
    id: z.number().optional(), // Auto-generated, optional for create
    ngay: z.string().optional().nullable(), // Date field
    ma_truc: z.preprocess(
        (val) => (val === "" || val === null ? undefined : val),
        z.number().min(1, "Mã trục là bắt buộc")
    ),
    khach_hang: z.string().optional().nullable(),
    nhan_vien_bh_id: z.preprocess(
        (val) => (val === "" || val === null ? undefined : val),
        z.number().min(1, "Nhân viên bán hàng là bắt buộc")
    ),
    anh_ban_ve: z.string().optional().nullable(),
    ghi_chu: z.string().optional().nullable(),
    trang_thai: z.preprocess(
        (val) => (val === "" || val === null ? "Mới" : val),
        z.string().min(1, "Trạng thái là bắt buộc")
    ).default("Mới"),
    nguoi_tao_id: z.number().optional().nullable(),
    tg_tao: z.string().optional().nullable(),
    tg_cap_nhat: z.string().optional().nullable(),
    trao_doi: z.any().optional().nullable(), // JSONB field
    // Joined fields from related tables (if needed)
    nhan_vien_bh: z.object({
        ma_nhan_vien: z.number(),
        ho_ten: z.string(),
    }).optional().nullable(),
    nguoi_tao: z.object({
        ma_nhan_vien: z.number(),
        ho_ten: z.string(),
    }).optional().nullable(),
})

export type TrucHat = z.infer<typeof trucHatSchema>

