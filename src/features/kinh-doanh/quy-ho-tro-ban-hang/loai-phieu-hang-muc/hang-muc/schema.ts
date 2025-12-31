import { z } from "zod"

/**
 * Schema matching 'htbh_hang_muc' table in Supabase
 */
export const hangMucSchema = z.object({
  id: z.number().optional(), // Auto-generated, optional for create
  loai_phieu_id: z.number().optional().nullable(),
  ten_loai_phieu: z.string().optional().nullable(), // Denormalized from htbh_loai_phieu
  ten_hang_muc: z.string().min(1, "Tên hạng mục là bắt buộc"),
  mo_ta: z.string().optional().nullable(),
  nguoi_tao_id: z.number().optional().nullable(),
  tg_tao: z.string().optional().nullable(),
  tg_cap_nhat: z.string().optional().nullable(),
  nguoi_tao_ten: z.string().optional().nullable(), // Joined from var_nhan_su
})

export type HangMuc = z.infer<typeof hangMucSchema>

/**
 * Schema for creating new hạng mục
 * nguoi_tao_id có thể được set tự động từ employee hiện tại
 */
export type CreateHangMucInput = Omit<HangMuc, "id" | "tg_tao" | "tg_cap_nhat" | "nguoi_tao_ten"> & {
  nguoi_tao_id?: number | null
}

/**
 * Schema for updating hạng mục
 */
export type UpdateHangMucInput = Partial<Omit<HangMuc, "id" | "tg_tao" | "nguoi_tao_id" | "nguoi_tao_ten">>

