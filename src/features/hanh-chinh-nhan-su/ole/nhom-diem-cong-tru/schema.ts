import { z } from "zod"

/**
 * Schema matching 'ole_nhom_diem_cong_tru' table in Supabase
 */
export const nhomDiemCongTruSchema = z.object({
    id: z.number().optional(), // Auto-generated, optional for create
    hang_muc: z.enum(["Cộng", "Trừ"], { required_error: "Hạng mục là bắt buộc", invalid_type_error: "Hạng mục phải là 'Cộng' hoặc 'Trừ'" }),
    nhom: z.string().min(1, "Nhóm là bắt buộc"),
    min: z.number().min(0, "Min phải lớn hơn hoặc bằng 0").default(0),
    max: z.number().default(0),
    mo_ta: z.string().optional().nullable(),
    pb_ap_dung_ib: z.array(z.number()).optional().nullable(), // JSONB array of department IDs
    tg_tao: z.string().optional().nullable(),
    tg_cap_nhat: z.string().optional().nullable(),
    nguoi_tao_id: z.number().optional().nullable(),
    // Joined field from var_nhan_su
    nguoi_tao_ten: z.string().optional().nullable(),
    nguoi_tao: z.object({
        ma_nhan_vien: z.number(),
        ho_ten: z.string(),
    }).optional().nullable(),
})

export type NhomDiemCongTru = z.infer<typeof nhomDiemCongTruSchema>

