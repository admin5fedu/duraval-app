import { z } from "zod"

/**
 * Schema matching 'hanh_chinh_nhom_phieu' table in Supabase
 */
export const nhomPhieuHanhChinhSchema = z.object({
    id: z.number().optional(), // Auto-generated, optional for create
    loai_phieu: z.string().min(1, "Loại phiếu là bắt buộc"),
    ma_nhom_phieu: z.string().min(1, "Mã nhóm phiếu là bắt buộc"),
    ten_nhom_phieu: z.string().min(1, "Tên nhóm phiếu là bắt buộc"),
    so_luong_cho_phep_thang: z.number().int().min(0, "Số lượng cho phép tháng phải là số nguyên không âm").default(0),
    can_hcns_duyet: z.enum(["Có", "Không"]).default("Không"),
    ca_toi: z.union([z.enum(["Có", "Không"]), z.null()]).optional().nullable(),
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

export type NhomPhieuHanhChinh = z.infer<typeof nhomPhieuHanhChinhSchema>

