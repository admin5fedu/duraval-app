import { z } from "zod"

/**
 * Schema matching 'htbh_loai_phieu' table in Supabase
 */
export const loaiPhieuSchema = z.object({
  id: z.number().optional(), // Auto-generated, optional for create
  ten_loai_phieu: z.string().min(1, "Tên loại phiếu là bắt buộc"),
  mo_ta: z.string().optional().nullable(),
  nguoi_tao_id: z.number().optional().nullable(),
  nguoi_tao_ten: z.string().optional().nullable(), // Joined from var_nhan_su
  tg_tao: z.string().optional().nullable(),
  tg_cap_nhat: z.string().optional().nullable(),
})

export type LoaiPhieu = z.infer<typeof loaiPhieuSchema>

/**
 * Schema for creating new loại phiếu
 * nguoi_tao_id có thể được set tự động từ employee hiện tại
 */
export type CreateLoaiPhieuInput = Omit<LoaiPhieu, "id" | "tg_tao" | "tg_cap_nhat"> & {
  nguoi_tao_id?: number | null
}

/**
 * Schema for updating loại phiếu
 */
export type UpdateLoaiPhieuInput = Partial<Omit<LoaiPhieu, "id" | "tg_tao" | "nguoi_tao_id">>

