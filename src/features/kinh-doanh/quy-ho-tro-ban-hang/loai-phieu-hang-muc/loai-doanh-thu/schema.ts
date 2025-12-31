import { z } from "zod"

/**
 * Schema matching 'htbh_loai_doanh_thu' table in Supabase
 */
export const loaiDoanhThuSchema = z.object({
  id: z.number().optional(), // Auto-generated, optional for create
  ten_doanh_thu: z.string().min(1, "Tên doanh thu là bắt buộc"),
  mo_ta: z.string().optional().nullable(),
  nguoi_tao_id: z.number().optional().nullable(),
  nguoi_tao_ten: z.string().optional().nullable(), // Joined from var_nhan_su
  tg_tao: z.string().optional().nullable(),
  tg_cap_nhat: z.string().optional().nullable(),
})

export type LoaiDoanhThu = z.infer<typeof loaiDoanhThuSchema>

/**
 * Schema for creating new loại doanh thu
 * nguoi_tao_id có thể được set tự động từ employee hiện tại
 */
export type CreateLoaiDoanhThuInput = Omit<LoaiDoanhThu, "id" | "tg_tao" | "tg_cap_nhat"> & {
  nguoi_tao_id?: number | null
}

/**
 * Schema for updating loại doanh thu
 */
export type UpdateLoaiDoanhThuInput = Partial<Omit<LoaiDoanhThu, "id" | "tg_tao" | "nguoi_tao_id">>

