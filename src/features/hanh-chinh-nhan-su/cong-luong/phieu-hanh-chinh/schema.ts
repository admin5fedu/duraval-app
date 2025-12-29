import { z } from "zod"

/**
 * Schema matching 'nhom_phieu_hanh_chinh' table in Supabase
 */
export const phieuHanhChinhSchema = z.object({
    id: z.number().optional(), // Auto-generated, optional for create
    ngay: z.string().or(z.date()).refine(
        (val) => {
            if (!val) return false
            if (val instanceof Date) return true
            if (typeof val === 'string') {
                // Validate date string format (YYYY-MM-DD)
                return /^\d{4}-\d{2}-\d{2}$/.test(val)
            }
            return false
        },
        { message: "Ngày không hợp lệ" }
    ),
    loai_phieu: z.string().min(1, "Loại phiếu là bắt buộc"),
    ma_phieu: z.string().min(1, "Mã phiếu là bắt buộc"),
    ca: z.string().optional().nullable(),
    so_gio: z.number().positive("Số giờ phải là số dương").optional().nullable(),
    ly_do: z.string().optional().nullable(),
    com_trua: z.boolean().optional().nullable().default(false),
    phuong_tien: z.string().optional().nullable(),
    trang_thai: z.string().optional().nullable().default("Chờ duyệt"),
    quan_ly_duyet: z.boolean().optional().nullable().default(false),
    ten_quan_ly: z.string().optional().nullable(),
    tg_quan_ly_duyet: z.string().optional().nullable(),
    hcns_duyet: z.boolean().optional().nullable().default(false),
    ten_hcns: z.string().optional().nullable(),
    tg_hcns_duyet: z.string().optional().nullable(),
    nguoi_tao_id: z.number().optional().nullable(), // ma_nhan_vien from var_nhan_su
    tg_tao: z.string().optional().nullable(),
    tg_cap_nhat: z.string().optional().nullable(),
    trao_doi: z.any().optional().nullable().default([]), // JSONB field
    // Joined field from var_nhan_su
    nguoi_tao_ten: z.string().optional().nullable(),
    // Joined field from nhom_phieu_hanh_chinh
    ten_nhom_phieu: z.string().optional().nullable(),
})

export type PhieuHanhChinh = z.infer<typeof phieuHanhChinhSchema>

