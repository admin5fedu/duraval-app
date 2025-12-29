import { z } from "zod"

/**
 * Schema matching 'cong_viec_viec_hang_ngay' table in Supabase
 */
export const viecHangNgaySchema = z.object({
    id: z.number().optional(),
    // Coerce string to number for form compatibility (combobox returns string)
    ma_nhan_vien: z.coerce.number().int().positive("Mã nhân viên phải là số dương"),
    ngay_bao_cao: z.string().min(1, "Ngày báo cáo là bắt buộc").or(z.date({ required_error: "Ngày báo cáo là bắt buộc" })),
    chi_tiet_cong_viec: z.any().default([]), // JSONB field
    tg_tao: z.string().optional().nullable(),
    tg_cap_nhat: z.string().optional().nullable(),
    // Coerce string to number for form compatibility (select returns string)
    // Handle null/empty string/"none" by transforming to null first
    phong_ban_id: z.preprocess(
        (val) => {
            if (val === null || val === undefined || val === "" || val === "none") {
                return null
            }
            // Coerce to number if not null
            const num = Number(val)
            return isNaN(num) ? null : num
        },
        z.number().int().positive().nullable()
    ).optional().nullable(),
    ma_phong: z.string().optional().nullable(),
    ma_nhom: z.string().optional().nullable(),
})

export type ViecHangNgay = z.infer<typeof viecHangNgaySchema>

