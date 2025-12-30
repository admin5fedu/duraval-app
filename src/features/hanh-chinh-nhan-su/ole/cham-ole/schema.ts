import { z } from "zod"

/**
 * Schema matching 'ole_cham_diem' table in Supabase
 */
export const chamOleSchema = z.object({
    id: z.number().optional(), // Auto-generated, optional for create
    nam: z.number().optional().nullable(),
    thang: z.preprocess(
        (val) => {
            if (val === "" || val === null || val === undefined) return undefined
            return val
        },
        z.number({ 
            required_error: "Tháng là bắt buộc", 
            invalid_type_error: "Tháng phải là số" 
        })
        .min(1, "Tháng phải từ 1 đến 12")
        .max(12, "Tháng phải từ 1 đến 12")
        .optional()
        .nullable()
    ),
    nhan_vien_id: z.number().optional().nullable(),
    phong_id: z.number().optional().nullable(),
    nhom_id: z.number().optional().nullable(),
    chuc_vu_id: z.number().optional().nullable(),
    danh_gia: z.string().optional().nullable(),
    ole: z.number().optional().nullable(),
    kpi: z.number().optional().nullable(),
    cong: z.number().optional().nullable(),
    tru: z.number().optional().nullable(),
    ghi_chu: z.string().optional().nullable(),
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
    chuc_vu: z.object({
        id: z.number(),
        ten_chuc_vu: z.string(),
    }).optional().nullable(),
    nguoi_tao: z.object({
        ma_nhan_vien: z.number(),
        ho_ten: z.string(),
    }).optional().nullable(),
})

export type ChamOle = z.infer<typeof chamOleSchema>

